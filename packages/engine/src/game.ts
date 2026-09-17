import {
  ACTIONS_PER_ROUND,
  type Action,
  type GameState,
  type LegalAction,
  type PlayerId,
  type PlayerState,
  type Role,
  ROOMS,
  STARTING_ROOM,
  neighboursOf,
} from '@cryosleep/shared';

export { ACTIONS_PER_ROUND };

export interface SeatSpec {
  readonly id: PlayerId;
  readonly name: string;
  readonly role: Role;
}

export interface ApplyResult {
  readonly state: GameState;
  readonly events: readonly string[];
}

export class RuleError extends Error {}

export function createGame(seats: readonly SeatSpec[], seed: number): GameState {
  if (seats.length < 1) throw new RuleError('a game needs at least one crew member');

  const players: PlayerState[] = seats.map((seat) => ({
    id: seat.id,
    name: seat.name,
    role: seat.role,
    location: STARTING_ROOM,
    actionsRemaining: ACTIONS_PER_ROUND,
    passed: false,
    connected: true,
    lightWounds: 0,
    hand: [],
    objectives: [],
  }));

  const turnOrder = players.map((p) => p.id);

  return {
    phase: 'player',
    turn: 1,
    rngSeed: seed,
    players,
    turnOrder,
    firstPlayer: turnOrder[0] ?? null,
    activePlayer: turnOrder[0] ?? null,
    rooms: ROOMS.map((room) => ({ id: room.id, explored: room.kind === 'special' })),
    log: [{ turn: 1, text: 'The crew wake in the Cryobay.' }],
    hidden: { unexploredTileFaces: {}, bag: [], deckOrder: [] },
  };
}

export function legalActionsFor(state: GameState, playerId: PlayerId): LegalAction[] {
  if (state.phase !== 'player') return [];
  if (state.activePlayer !== playerId) return [];

  const self = state.players.find((p) => p.id === playerId);
  if (!self || self.passed) return [];

  const actions: LegalAction[] = [{ kind: 'pass' }];
  if (self.actionsRemaining > 0) {
    for (const to of neighboursOf(self.location)) actions.push({ kind: 'move', to });
  }
  return actions;
}

export function applyAction(state: GameState, playerId: PlayerId, action: Action): ApplyResult {
  if (state.phase !== 'player') throw new RuleError('not the player phase');
  if (state.activePlayer !== playerId) throw new RuleError('not your turn');

  const self = state.players.find((p) => p.id === playerId);
  if (!self) throw new RuleError(`no such player: ${playerId}`);
  if (self.passed) throw new RuleError('you have already passed this phase');

  switch (action.kind) {
    case 'move':
      return move(state, self, action.to);
    case 'pass':
      return endRound(state, { ...self, passed: true }, [`${label(self)} passes.`]);
  }
}

function move(state: GameState, self: PlayerState, to: string): ApplyResult {
  if (self.actionsRemaining < 1) throw new RuleError('no actions left this round');
  if (!neighboursOf(self.location).includes(to)) {
    throw new RuleError('that room is not connected to yours');
  }

  const moved: PlayerState = {
    ...self,
    location: to,
    actionsRemaining: self.actionsRemaining - 1,
  };
  const events = [`${label(self)} moves to ${roomName(to)}.`];

  // Spending the last action ends the round; M2 adds noise, exploration and doors.
  return moved.actionsRemaining === 0
    ? endRound(state, moved, events)
    : { state: replacePlayer(state, moved), events };
}

function endRound(state: GameState, self: PlayerState, events: readonly string[]): ApplyResult {
  const rested: PlayerState = { ...self, actionsRemaining: ACTIONS_PER_ROUND };
  let next = replacePlayer(state, rested);

  const active = nextActivePlayer(next, self.id);
  if (active === null) {
    // Everyone has passed, so the turn ends. The Event Phase itself lands in M4;
    // what is faithful already is that the First Player token passes one seat
    // and the next Player Phase starts with its holder — RULES.md §3.1(2).
    const firstPlayer = nextFirstPlayer(next);
    next = {
      ...next,
      turn: next.turn + 1,
      players: next.players.map((p) => ({ ...p, passed: false })),
      firstPlayer,
      activePlayer: firstPlayer,
      log: [...next.log, ...events.map((text) => ({ turn: next.turn, text }))],
    };
    return { state: next, events: [...events, 'All crew have passed. A new turn begins.'] };
  }

  next = {
    ...next,
    activePlayer: active,
    log: [...next.log, ...events.map((text) => ({ turn: next.turn, text }))],
  };
  return { state: next, events };
}

/** The First Player token passes one seat to the left each turn — RULES.md §3.1(2). */
function nextFirstPlayer(state: GameState): PlayerId | null {
  const order = state.turnOrder;
  if (order.length === 0) return null;
  const current = state.firstPlayer === null ? -1 : order.indexOf(state.firstPlayer);
  return order[(current + 1) % order.length] ?? null;
}

function nextActivePlayer(state: GameState, after: PlayerId): PlayerId | null {
  const order = state.turnOrder;
  const start = order.indexOf(after);
  for (let step = 1; step <= order.length; step++) {
    const candidate = order[(start + step) % order.length];
    if (candidate === undefined) continue;
    const player = state.players.find((p) => p.id === candidate);
    if (player && !player.passed) return candidate;
  }
  return null;
}

function replacePlayer(state: GameState, player: PlayerState): GameState {
  return { ...state, players: state.players.map((p) => (p.id === player.id ? player : p)) };
}

function label(player: PlayerState): string {
  return player.role ? `The ${player.role}` : player.name;
}

function roomName(id: string): string {
  return ROOMS.find((r) => r.id === id)?.name ?? id;
}
