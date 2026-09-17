import { randomBytes, randomUUID } from 'node:crypto';
import {
  type GameState,
  type LobbyState,
  ROLES,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  type Role,
} from '@cryosleep/shared';

export const MAX_PLAYERS = 5;
export const MIN_PLAYERS = 2;

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
  readonly seats: Seat[];
  hostId: string;
  state: GameState | null;
  createdAt: number;
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
  const room: Room = { code, seats: [seat], hostId: seat.id, state: null, createdAt: Date.now() };
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
  return { room, seat };
}

export function rejoin(code: string, token: string, socketId: string): { room: Room; seat: Seat } {
  const room = rooms.get(code);
  if (!room) throw new Error('no such room');

  const seat = room.seats.find((s) => s.token === token);
  if (!seat) throw new Error('that seat is not in this room');

  seat.socketId = socketId;
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

/** Drops rooms nobody has been connected to for an hour. */
export function sweep(now = Date.now()): void {
  for (const [code, room] of rooms) {
    const empty = room.seats.every((s) => s.socketId === null);
    if (empty && now - room.createdAt > 60 * 60 * 1000) rooms.delete(code);
  }
}

/** Test seam. */
export function reset(): void {
  rooms.clear();
}
