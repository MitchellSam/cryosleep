import { randomInt } from 'node:crypto';
import { createServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import {
  PROTOCOL_VERSION,
  clientMessages,
  type JoinedPayload,
  projectFor,
} from '@cryosleep/shared';
import { applyAction, createGame, legalActionsFor } from '@cryosleep/engine';
import {
  type Room,
  type Seat,
  canStart,
  chooseRole,
  createRoom,
  disconnect,
  getRoom,
  joinRoom,
  leaveRoom,
  lobbyStateOf,
  rejoin,
  sweep,
  touch,
} from './rooms.js';

export interface RunningServer {
  readonly port: number;
  close(): Promise<void>;
}

/**
 * The authoritative referee. Clients send intents; this decides what happened and
 * sends each player their own view of it. Nothing here ever emits `GameState`.
 */
export function startServer(port = 0): Promise<RunningServer> {
  const http = createServer((req, res) => {
    // Something has to answer plain HTTP: socket.io only claims /socket.io.
    if (req.url === '/healthz') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, protocolVersion: PROTOCOL_VERSION }));
      return;
    }
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('cryosleep server: socket.io only\n');
  });

  const io = new Server(http, { cors: { origin: '*' } });

  /** Which seat each socket is sitting in. */
  const sessions = new Map<string, { code: string; seatId: string }>();

  function broadcast(room: Room): void {
    if (!room.state) {
      const lobby = lobbyStateOf(room);
      for (const seat of room.seats) {
        if (seat.socketId) io.to(seat.socketId).emit('lobby', lobby);
      }
      return;
    }

    // Connectivity lives on the seat, not in the rules, so it is stamped onto the
    // state we project rather than tracked by the engine.
    const connected = new Set(room.seats.filter((s) => s.socketId).map((s) => s.id));
    const state = {
      ...room.state,
      players: room.state.players.map((p) => ({ ...p, connected: connected.has(p.id) })),
    };

    for (const seat of room.seats) {
      if (!seat.socketId) continue;
      io.to(seat.socketId).emit('view', projectFor(seat.id, state, legalActionsFor(state, seat.id)));
    }
  }

  function fail(socket: Socket, error: unknown): void {
    socket.emit('error_message', {
      message: error instanceof Error ? error.message : 'something went wrong',
    });
  }

  function seatOf(socket: Socket): { room: Room; seat: Seat } {
    const session = sessions.get(socket.id);
    if (!session) throw new Error('you are not in a room');

    const room = getRoom(session.code);
    if (!room) throw new Error('that room is gone');

    const seat = room.seats.find((s) => s.id === session.seatId);
    if (!seat) throw new Error('your seat is gone');

    return { room, seat };
  }

  function joined(room: Room, seat: Seat): JoinedPayload {
    return {
      code: room.code,
      playerId: seat.id,
      token: seat.token,
      protocolVersion: PROTOCOL_VERSION,
    };
  }

  io.on('connection', (socket) => {
    socket.on('createRoom', (raw: unknown) => {
      try {
        const { name } = clientMessages.createRoom.parse(raw);
        const { room, seat } = createRoom(name, socket.id);
        sessions.set(socket.id, { code: room.code, seatId: seat.id });
        socket.emit('joined', joined(room, seat));
        broadcast(room);
      } catch (error) {
        fail(socket, error);
      }
    });

    socket.on('joinRoom', (raw: unknown) => {
      try {
        const { code, name } = clientMessages.joinRoom.parse(raw);
        const { room, seat } = joinRoom(code, name, socket.id);
        sessions.set(socket.id, { code: room.code, seatId: seat.id });
        socket.emit('joined', joined(room, seat));
        broadcast(room);
      } catch (error) {
        fail(socket, error);
      }
    });

    socket.on('rejoin', (raw: unknown) => {
      try {
        const { code, token } = clientMessages.rejoin.parse(raw);
        const { room, seat } = rejoin(code, token, socket.id);

        // A seat is one player: drop any older socket still claiming it, or two
        // connections could submit actions as the same crew member.
        for (const [socketId, session] of sessions) {
          if (socketId !== socket.id && session.seatId === seat.id) {
            sessions.delete(socketId);
            io.sockets.sockets.get(socketId)?.disconnect(true);
          }
        }

        sessions.set(socket.id, { code: room.code, seatId: seat.id });
        socket.emit('joined', joined(room, seat));
        broadcast(room);
      } catch (error) {
        fail(socket, error);
      }
    });

    socket.on('chooseRole', (raw: unknown) => {
      try {
        const { role } = clientMessages.chooseRole.parse(raw);
        const { room, seat } = seatOf(socket);
        chooseRole(room, seat, role);
        broadcast(room);
      } catch (error) {
        fail(socket, error);
      }
    });

    socket.on('leaveRoom', () => {
      try {
        const { room, seat } = seatOf(socket);
        leaveRoom(room, seat);
        sessions.delete(socket.id);
        socket.emit('left', {});
        broadcast(room);
      } catch (error) {
        fail(socket, error);
      }
    });

    socket.on('startGame', () => {
      try {
        const { room, seat } = seatOf(socket);
        if (seat.id !== room.hostId) throw new Error('only the host can start the game');
        if (!canStart(room)) throw new Error('every crew member needs a role first');

        const seats = room.seats.map((s) => {
          if (!s.role) throw new Error('every crew member needs a role first');
          return { id: s.id, name: s.name, role: s.role };
        });
        // Not Date.now(): once the bag and deck orders derive from this seed, a
        // millisecond-resolution guess against an open-source engine would
        // reconstruct exactly what projectFor exists to hide.
        room.state = createGame(seats, randomInt(0, 2 ** 32));
        broadcast(room);
      } catch (error) {
        fail(socket, error);
      }
    });

    socket.on('submitAction', (raw: unknown) => {
      try {
        const { action } = clientMessages.submitAction.parse(raw);
        const { room, seat } = seatOf(socket);
        if (!room.state) throw new Error('the game has not started');

        room.state = applyAction(room.state, seat.id, action).state;
        touch(room);
        broadcast(room);
      } catch (error) {
        fail(socket, error);
      }
    });

    socket.on('disconnect', () => {
      sessions.delete(socket.id);
      for (const room of disconnect(socket.id)) broadcast(room);
    });
  });

  const sweeper = setInterval(() => sweep(), 10 * 60 * 1000);
  sweeper.unref();

  return new Promise((resolve) => {
    http.listen(port, () => {
      const address = http.address();
      const bound = typeof address === 'object' && address ? address.port : port;
      resolve({
        port: bound,
        close: () =>
          new Promise<void>((done) => {
            clearInterval(sweeper);
            io.close(() => http.close(() => done()));
          }),
      });
    });
  });
}
