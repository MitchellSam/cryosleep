/**
 * The ship — the hauler *Meridian*.
 *
 * M1 STUB. This is a small hand-built graph so the walking skeleton has somewhere
 * to move; it is NOT the real board. The real room slots, corridor numbering,
 * technical-corridor entrances and room colours are transcribed in M2 — see G2 in
 * RULES-GAPS.md. Everything downstream reads this module, so replacing it is the
 * whole of that change.
 */
export type RoomId = string;
export type CorridorId = string;

/** Special rooms are printed on the board: explored from the start, never searchable. */
export type RoomKind = 'special' | 'basic' | 'additional';

export interface RoomContent {
  readonly id: RoomId;
  readonly name: string;
  readonly kind: RoomKind;
  /** Layout hint for the client, in abstract board units. */
  readonly x: number;
  readonly y: number;
}

export interface CorridorContent {
  readonly id: CorridorId;
  /** The number a noise roll matches against, 1-4. */
  readonly number: 1 | 2 | 3 | 4;
  readonly between: readonly [RoomId, RoomId];
}

export const ROOMS: readonly RoomContent[] = [
  { id: 'cryobay', name: 'Cryobay', kind: 'special', x: 0, y: 0 },
  { id: 'cockpit', name: 'Cockpit', kind: 'special', x: 0, y: -2 },
  { id: 'engine-1', name: 'Engine 1', kind: 'special', x: -2, y: 2 },
  { id: 'engine-2', name: 'Engine 2', kind: 'special', x: 0, y: 2 },
  { id: 'engine-3', name: 'Engine 3', kind: 'special', x: 2, y: 2 },
  { id: 'room-a', name: 'Unexplored', kind: 'basic', x: -2, y: 0 },
  { id: 'room-b', name: 'Unexplored', kind: 'basic', x: 2, y: 0 },
  { id: 'room-c', name: 'Unexplored', kind: 'basic', x: -2, y: -2 },
  { id: 'room-d', name: 'Unexplored', kind: 'basic', x: 2, y: -2 },
];

export const CORRIDORS: readonly CorridorContent[] = [
  { id: 'c1', number: 1, between: ['cryobay', 'cockpit'] },
  { id: 'c2', number: 2, between: ['cryobay', 'room-a'] },
  { id: 'c3', number: 3, between: ['cryobay', 'room-b'] },
  { id: 'c4', number: 4, between: ['cryobay', 'engine-2'] },
  { id: 'c5', number: 1, between: ['room-a', 'room-c'] },
  { id: 'c6', number: 2, between: ['room-b', 'room-d'] },
  { id: 'c7', number: 3, between: ['room-c', 'cockpit'] },
  { id: 'c8', number: 4, between: ['room-d', 'cockpit'] },
  { id: 'c9', number: 1, between: ['room-a', 'engine-1'] },
  { id: 'c10', number: 2, between: ['room-b', 'engine-3'] },
  { id: 'c11', number: 3, between: ['engine-1', 'engine-2'] },
  { id: 'c12', number: 4, between: ['engine-2', 'engine-3'] },
];

export const ROOM_BY_ID: ReadonlyMap<RoomId, RoomContent> = new Map(ROOMS.map((r) => [r.id, r]));

/** The room every crew member wakes up in. */
export const STARTING_ROOM: RoomId = 'cryobay';

/** Rooms reachable from `from` through exactly one corridor. Doors are M2. */
export function neighboursOf(from: RoomId): RoomId[] {
  const out: RoomId[] = [];
  for (const corridor of CORRIDORS) {
    const [a, b] = corridor.between;
    if (a === from) out.push(b);
    else if (b === from) out.push(a);
  }
  return out;
}
