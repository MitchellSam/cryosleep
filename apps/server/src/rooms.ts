import { randomBytes, randomUUID } from 'node:crypto';
import {
  type GameState,
  type LobbyState,
  MAX_PLAYERS,
  MIN_PLAYERS,
  ROLES,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  type Role,
} from '@cryosleep/shared';

export { MAX_PLAYERS, MIN_PLAYERS };

export interface Seat {
  readonly id: string;
  name: string;
  role: Role | null;
  /** Held client-side so a refresh returns to the same seat with the same secrets. */
  readonly token: string;
  socketId: string | null;
}

export interface Room {
  readonly code: string;
  seats: Seat[];
  hostId: string;
  state: GameState | null;
  createdAt: number;
  /** Refreshed on every socket event, so an in-progress game is never swept away. */
  lastSeenAt: number;
}

const rooms = new Map<string, Room>();

function newCode(): string {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const bytes = randomBytes(ROOM_CODE_LENGTH);
    let code = '';
    for (const byte of bytes) {
      code += ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length];
    }
    if (!rooms.has(code)) return code;
  }
  throw new Error('could not allocate a room code');
}

export function createRoom(hostName: string, socketId: string): { room: Room; seat: Seat } {
  const code = newCode();
  const seat: Seat = { id: randomUUID(), name: hostName, role: null, token: randomUUID(), socketId };
  const now = Date.now();
  const room: Room = {
    code,
    seats: [seat],
    hostId: seat.id,
    state: null,
    createdAt: now,
    lastSeenAt: now,
  };
  rooms.set(code, room);
  return { room, seat };
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function joinRoom(code: string, name: string, socketId: string): { room: Room; seat: Seat } {
  const room = rooms.get(code);
  if (!room) throw new Error('no such room');
  if (room.state) throw new Error('that game has already started');
  if (room.seats.length >= MAX_PLAYERS) throw new Error('that room is full');

  const seat: Seat = { id: randomUUID(), name, role: null, token: randomUUID(), socketId };
  room.seats.push(seat);
  room.lastSeenAt = Date.now();
  return { room, seat };
}

/**
 * Leaving frees the seat, but only before the game starts: mid-game the seat has
 * to stay, because the crew member is on the board and the turn order runs
 * through them.
 */
export function leaveRoom(room: Room, seat: Seat): void {
  if (room.state) throw new Error('you cannot leave a game in progress');

  room.seats = room.seats.filter((s) => s.id !== seat.id);
  room.lastSeenAt = Date.now();

  if (room.hostId === seat.id) {
    const successor = room.seats[0];
    if (successor) room.hostId = successor.id;
  }
  if (room.seats.length === 0) rooms.delete(room.code);
}

export function rejoin(code: string, token: string, socketId: string): { room: Room; seat: Seat } {
  const room = rooms.get(code);
  if (!room) throw new Error('no such room');

  const seat = room.seats.find((s) => s.token === token);
  if (!seat) throw new Error('that seat is not in this room');

  seat.socketId = socketId;
  room.lastSeenAt = Date.now();
  return { room, seat };
}

export function chooseRole(room: Room, seat: Seat, role: Role): void {
  if (room.state) throw new Error('the game has already started');
  if (!ROLES.includes(role)) throw new Error('no such role');
  if (room.seats.some((s) => s.id !== seat.id && s.role === role)) {
    throw new Error('another crew member already took that role');
  }
  seat.role = role;
}

export function canStart(room: Room): boolean {
  return (
    room.state === null &&
    room.seats.length >= MIN_PLAYERS &&
    room.seats.every((s) => s.role !== null)
  );
}

export function lobbyStateOf(room: Room): LobbyState {
  return {
    code: room.code,
    seats: room.seats.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      connected: s.socketId !== null,
      isHost: s.id === room.hostId,
    })),
    takenRoles: room.seats.flatMap((s) => (s.role ? [s.role] : [])),
    canStart: canStart(room),
  };
}

/** Marks a room as still in use, so the sweeper leaves it alone. */
export function touch(room: Room): void {
  room.lastSeenAt = Date.now();
}

export function disconnect(socketId: string): Room[] {
  const touched: Room[] = [];
  for (const room of rooms.values()) {
    for (const seat of room.seats) {
      if (seat.socketId === socketId) {
        seat.socketId = null;
        touched.push(room);
      }
    }
  }
  return touched;
}

export const IDLE_SWEEP_MS = 60 * 60 * 1000;

/**
 * Drops rooms that have been entirely disconnected for an hour. Keyed off
 * lastSeenAt, not createdAt: a long game whose players all briefly drop —
 * a wifi blip, a server restart, two refreshes at once — must survive.
 */
export function sweep(now = Date.now()): void {
  for (const [code, room] of rooms) {
    const empty = room.seats.every((s) => s.socketId === null);
    if (empty && now - room.lastSeenAt > IDLE_SWEEP_MS) rooms.delete(code);
  }
}

/** Test seam. */
export function reset(): void {
  rooms.clear();
}
