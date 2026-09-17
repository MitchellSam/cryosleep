import { describe, expect, it } from 'vitest';
import { neighboursOf, STARTING_ROOM } from '@cryosleep/shared';
import { ACTIONS_PER_ROUND, RuleError, applyAction, createGame, legalActionsFor } from './game.js';

const seats = [
  { id: 'p1', name: 'one', role: 'captain' as const },
  { id: 'p2', name: 'two', role: 'scout' as const },
];

describe('createGame', () => {
  it('wakes the whole crew in the Cryobay', () => {
    const state = createGame(seats, 1);

    expect(state.players.map((p) => p.location)).toEqual([STARTING_ROOM, STARTING_ROOM]);
    expect(state.activePlayer).toBe('p1');
    expect(state.phase).toBe('player');
  });

  it('starts every special room explored and every other room not', () => {
    const state = createGame(seats, 1);

    expect(state.rooms.find((r) => r.id === 'cryobay')?.explored).toBe(true);
    expect(state.rooms.find((r) => r.id === 'room-a')?.explored).toBe(false);
  });
});

describe('legalActionsFor', () => {
  it('offers only the connected rooms, plus passing', () => {
    const state = createGame(seats, 1);
    const legal = legalActionsFor(state, 'p1');

    const destinations = legal.flatMap((a) => (a.kind === 'move' ? [a.to] : []));
    expect(destinations.sort()).toEqual(neighboursOf(STARTING_ROOM).sort());
    expect(legal.some((a) => a.kind === 'pass')).toBe(true);
  });

  it('offers nothing to a player who is not active', () => {
    expect(legalActionsFor(createGame(seats, 1), 'p2')).toEqual([]);
  });
});

describe('applyAction: move', () => {
  it('moves the crew member and spends one action', () => {
    const { state, events } = applyAction(createGame(seats, 1), 'p1', {
      kind: 'move',
      to: 'cockpit',
    });

    const p1 = state.players.find((p) => p.id === 'p1');
    expect(p1?.location).toBe('cockpit');
    expect(p1?.actionsRemaining).toBe(ACTIONS_PER_ROUND - 1);
    expect(events[0]).toContain('Cockpit');
  });

  it('passes the turn once both actions are spent', () => {
    let state = createGame(seats, 1);
    state = applyAction(state, 'p1', { kind: 'move', to: 'cockpit' }).state;
    expect(state.activePlayer).toBe('p1');

    state = applyAction(state, 'p1', { kind: 'move', to: 'cryobay' }).state;
    expect(state.activePlayer).toBe('p2');
    expect(state.players.find((p) => p.id === 'p1')?.actionsRemaining).toBe(ACTIONS_PER_ROUND);
  });

  it('refuses a room that is not connected', () => {
    expect(() => applyAction(createGame(seats, 1), 'p1', { kind: 'move', to: 'room-c' })).toThrow(
      RuleError,
    );
  });

  it('refuses to act out of turn', () => {
    expect(() => applyAction(createGame(seats, 1), 'p2', { kind: 'move', to: 'cockpit' })).toThrow(
      /not your turn/,
    );
  });
});

describe('applyAction: pass', () => {
  it('hands the turn to the next player', () => {
    const { state } = applyAction(createGame(seats, 1), 'p1', { kind: 'pass' });

    expect(state.activePlayer).toBe('p2');
    expect(state.players.find((p) => p.id === 'p1')?.passed).toBe(true);
  });

  it('refuses a second action after passing', () => {
    let state = applyAction(createGame(seats, 1), 'p1', { kind: 'pass' }).state;
    state = applyAction(state, 'p2', { kind: 'pass' }).state;
    // Round rolled over, so p1 is active again and no longer passed.
    expect(state.round).toBe(2);
    expect(state.players.every((p) => !p.passed)).toBe(true);
  });

  it('starts a new round once every player has passed', () => {
    let state = createGame(seats, 1);
    state = applyAction(state, 'p1', { kind: 'pass' }).state;
    const result = applyAction(state, 'p2', { kind: 'pass' });

    expect(result.state.round).toBe(2);
    expect(result.state.activePlayer).toBe('p1');
    expect(result.events).toContain('All crew have passed. A new round begins.');
  });
});
