import { describe, expect, it } from 'vitest';
import { createRng, next, roll } from './rng.js';

describe('seeded rng', () => {
  it('is deterministic for a given seed', () => {
    const a = next(createRng(1234));
    const b = next(createRng(1234));
    expect(a.value).toBe(b.value);
    expect(a.rng.seed).toBe(b.rng.seed);
  });

  it('advances, so repeated draws differ', () => {
    const first = next(createRng(1234));
    const second = next(first.rng);
    expect(second.value).not.toBe(first.value);
  });

  it('rolls within range', () => {
    let rng = createRng(99);
    for (let i = 0; i < 200; i++) {
      const result = roll(rng, 6);
      expect(result.value).toBeGreaterThanOrEqual(1);
      expect(result.value).toBeLessThanOrEqual(6);
      rng = result.rng;
    }
  });
});
