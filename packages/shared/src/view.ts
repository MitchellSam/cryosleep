import type { RoomId } from './content/ship.js';
import type { Role } from './content/roles.js';
import type { CardId, GameState, LogEntry, ObjectiveId, Phase, PlayerId } from './state.js';

/**
 * What one player is allowed to see.
 *
 * This is the ONLY shape that reaches a client. If a secret is not stripped here
 * it is on the wire, and opening devtools is enough to read it — which in a game
 * with betrayal objectives is the difference between a bluff and a lie you can
 * check. Every new secret field in GameState must be dropped here and covered by
 * view.test.ts.
 */
export interface PlayerView {
  readonly phase: Phase;
  readonly round: number;
  readonly activePlayer: PlayerId | null;
  readonly firstPlayer: PlayerId | null;
  readonly turnOrder: readonly PlayerId[];
  readonly rooms: readonly PublicRoom[];
  readonly log: readonly LogEntry[];
  /** You, in full. */
  readonly you: SelfView;
  /** Everyone else, in public only. */
  readonly crew: readonly CrewView[];
  /** What you may legally do right now, decided by the server. */
  readonly legalActions: readonly LegalAction[];
}

export interface PublicRoom {
  readonly id: RoomId;
  readonly explored: boolean;
}

export interface SelfView {
  readonly id: PlayerId;
  readonly name: string;
  readonly role: Role | null;
  readonly location: RoomId;
  readonly actionsRemaining: number;
  readonly passed: boolean;
  readonly lightWounds: number;
  readonly hand: readonly CardId[];
  readonly objectives: readonly ObjectiveId[];
}

export interface CrewView {
  readonly id: PlayerId;
  readonly name: string;
  readonly role: Role | null;
  readonly location: RoomId;
  readonly actionsRemaining: number;
  readonly passed: boolean;
  readonly connected: boolean;
  readonly lightWounds: number;
  /** Hand SIZE is public — it decides who a bioform attacks. The cards are not. */
  readonly handSize: number;
}

export type LegalAction = { readonly kind: 'move'; readonly to: RoomId } | { readonly kind: 'pass' };

/**
 * Project the authoritative state down to what `playerId` may see.
 *
 * Written as an explicit field-by-field construction, never a spread of the
 * source state: a spread would silently leak any field added to GameState later.
 */
export function projectFor(
  playerId: PlayerId,
  state: GameState,
  legalActions: readonly LegalAction[] = [],
): PlayerView {
  const self = state.players.find((p) => p.id === playerId);
  if (!self) throw new Error(`no such player: ${playerId}`);

  return {
    phase: state.phase,
    round: state.round,
    activePlayer: state.activePlayer,
    firstPlayer: state.firstPlayer,
    turnOrder: [...state.turnOrder],
    rooms: state.rooms.map((r) => ({ id: r.id, explored: r.explored })),
    log: state.log.map((entry) => ({ round: entry.round, text: entry.text })),
    you: {
      id: self.id,
      name: self.name,
      role: self.role,
      location: self.location,
      actionsRemaining: self.actionsRemaining,
      passed: self.passed,
      lightWounds: self.lightWounds,
      hand: [...self.hand],
      objectives: [...self.objectives],
    },
    crew: state.players
      .filter((p) => p.id !== playerId)
      .map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        location: p.location,
        actionsRemaining: p.actionsRemaining,
        passed: p.passed,
        connected: p.connected,
        lightWounds: p.lightWounds,
        handSize: p.hand.length,
      })),
    legalActions: [...legalActions],
  };
}
