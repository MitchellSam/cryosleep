import { describe, expect, it } from 'vitest';
import type { GameState, PlayerState } from './state.js';
import { projectFor } from './view.js';

/**
 * Sentinels: strings that exist ONLY inside secret state. If any of them appears
 * anywhere in another player's serialised view, that secret is on the wire.
 */
const ALICE_OBJECTIVE = 'SECRET-alice-objective-kill-bob';
const ALICE_CARD = 'SECRET-alice-hand-card';
const BOB_OBJECTIVE = 'SECRET-bob-objective-reach-earth';
const BOB_CARD = 'SECRET-bob-hand-card';
const TILE_FACE = 'SECRET-unexplored-tile-face';
const BAG_TOKEN = 'SECRET-bag-token';
const DECK_CARD = 'SECRET-deck-order-card';

function player(id: string, overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id,
    name: id,
    role: 'scout',
    location: 'cryobay',
    actionsRemaining: 2,
    passed: false,
    connected: true,
    lightWounds: 0,
    hand: [],
    objectives: [],
    ...overrides,
  };
}

function state(): GameState {
  return {
    phase: 'player',
    round: 1,
    rngSeed: 42,
    players: [
      player('alice', { hand: [ALICE_CARD], objectives: [ALICE_OBJECTIVE], lightWounds: 1 }),
      player('bob', { hand: [BOB_CARD, BOB_CARD], objectives: [BOB_OBJECTIVE] }),
    ],
    turnOrder: ['alice', 'bob'],
    firstPlayer: 'alice',
    activePlayer: 'alice',
    rooms: [{ id: 'cryobay', explored: true }],
    log: [],
    hidden: {
      unexploredTileFaces: { 'room-a': TILE_FACE },
      bag: [BAG_TOKEN],
      deckOrder: [DECK_CARD],
    },
  };
}

describe('projectFor', () => {
  it("never leaks another player's secrets", () => {
    const wire = JSON.stringify(projectFor('alice', state()));

    expect(wire).not.toContain(BOB_OBJECTIVE);
    expect(wire).not.toContain(BOB_CARD);
  });

  it('never leaks server-only state to anyone', () => {
    for (const id of ['alice', 'bob']) {
      const wire = JSON.stringify(projectFor(id, state()));

      expect(wire).not.toContain(TILE_FACE);
      expect(wire).not.toContain(BAG_TOKEN);
      expect(wire).not.toContain(DECK_CARD);
    }
  });

  it('gives a player their own hand and objectives', () => {
    const view = projectFor('alice', state());

    expect(view.you.hand).toEqual([ALICE_CARD]);
    expect(view.you.objectives).toEqual([ALICE_OBJECTIVE]);
  });

  it('exposes hand SIZE but not cards, because it decides who gets attacked', () => {
    const view = projectFor('alice', state());
    const bob = view.crew.find((c) => c.id === 'bob');

    expect(bob?.handSize).toBe(2);
    expect(JSON.stringify(bob)).not.toContain(BOB_CARD);
  });

  it('exposes wounds, which are public on the character board', () => {
    const view = projectFor('bob', state());

    expect(view.crew.find((c) => c.id === 'alice')?.lightWounds).toBe(1);
  });

  it('omits the viewer from their own crew list', () => {
    expect(projectFor('alice', state()).crew.map((c) => c.id)).toEqual(['bob']);
  });

  it('throws rather than projecting for an unknown player', () => {
    expect(() => projectFor('mallory', state())).toThrow(/no such player/);
  });

  it('carries no key from GameState that is not declared on PlayerView', () => {
    // Guards against someone "fixing" projectFor with a spread of state.
    const view = projectFor('alice', state()) as Record<string, unknown>;

    expect(Object.keys(view).sort()).toEqual(
      [
        'activePlayer',
        'crew',
        'firstPlayer',
        'legalActions',
        'log',
        'phase',
        'round',
        'rooms',
        'turnOrder',
        'you',
      ].sort(),
    );
  });
});
