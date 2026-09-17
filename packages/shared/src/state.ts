import type { RoomId } from './content/ship.js';
import type { Role } from './content/roles.js';

export type PlayerId = string;

/** Opaque handles for cards. Real card content lands in M4-M9. */
export type CardId = string;
export type ObjectiveId = string;

export type Phase = 'lobby' | 'player' | 'event' | 'ended';

export interface PlayerState {
  readonly id: PlayerId;
  readonly name: string;
  readonly role: Role | null;
  readonly location: RoomId;
  /** Actions left in the current round. Two per round — RULES.md §3.1. */
  readonly actionsRemaining: number;
  readonly passed: boolean;
  readonly connected: boolean;

  // ---- public ----
  /** Light wounds are markers on the character board: everyone can see them. */
  readonly lightWounds: number;

  // ---- SECRET: never leaves the server for anyone but this player ----
  readonly hand: readonly CardId[];
  /** Two until the first bioform appears, then one — RULES.md §7. */
  readonly objectives: readonly ObjectiveId[];
}

export interface RoomState {
  readonly id: RoomId;
  readonly explored: boolean;
}

/**
 * The authoritative game state. **This type never crosses the wire.** Clients
 * only ever receive a `PlayerView` (see view.ts), which is the one place that
 * decides what each player is allowed to know.
 */
export interface GameState {
  readonly phase: Phase;
  readonly round: number;
  readonly rngSeed: number;
  readonly players: readonly PlayerState[];
  readonly turnOrder: readonly PlayerId[];
  readonly firstPlayer: PlayerId | null;
  readonly activePlayer: PlayerId | null;
  readonly rooms: readonly RoomState[];
  readonly log: readonly LogEntry[];

  // ---- SECRET: server-only, redacted from every view ----
  /** Face-down tile identities, deck orders, bag contents. Nobody sees these. */
  readonly hidden: HiddenState;
}

export interface HiddenState {
  /** Placeholder until M2/M3 fill it. Present from M1 so the redaction test has a target. */
  readonly unexploredTileFaces: Readonly<Record<RoomId, string>>;
  readonly bag: readonly string[];
  readonly deckOrder: readonly CardId[];
}

export interface LogEntry {
  readonly round: number;
  /** Public events only. Anything secret is summarised, never quoted. */
  readonly text: string;
}
