/**
 * Seeded RNG carried *in* game state, so every game is deterministic and
 * replayable from its seed plus its action log. The engine performs no I/O and
 * never calls Math.random.
 */
export interface Rng {
  readonly seed: number;
}

export function createRng(seed: number): Rng {
  return { seed: seed >>> 0 };
}

/** mulberry32: returns the next value in [0, 1) and the advanced generator. */
export function next(rng: Rng): { value: number; rng: Rng } {
  let t = (rng.seed + 0x6d2b79f5) >>> 0;
  const advanced = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, rng: { seed: advanced } };
}

/** Rolls an n-sided die, 1-indexed. */
export function roll(rng: Rng, sides: number): { value: number; rng: Rng } {
  const { value, rng: advanced } = next(rng);
  return { value: Math.floor(value * sides) + 1, rng: advanced };
}
