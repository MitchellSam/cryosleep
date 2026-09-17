/**
 * Wire protocol and shared content types.
 *
 * Everything a client is ever allowed to see passes through this package. The
 * authoritative `GameState` lives in the engine and never leaves the server;
 * clients receive only a `PlayerView` produced by `projectFor` (M1).
 */
export const PROTOCOL_VERSION = 1;

/** Room codes are 4 uppercase letters, ambiguous glyphs excluded. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export const ROOM_CODE_LENGTH = 4;

/** Crew are identified by role, never by a personal name. */
export const ROLES = [
  'scout',
  'mechanic',
  'soldier',
  'scientist',
  'pilot',
  'captain',
  'doctor',
] as const;

export type Role = (typeof ROLES)[number];
