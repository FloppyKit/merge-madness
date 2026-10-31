import { describe, it, expect } from 'vitest';
import { makeQuestion, checkAnswer } from '../src/core/math';
import { MATH_CHOICES, MATH_REWARD, SHOP } from '../src/config';

function seeded(seed: number) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; }; }

describe('math challenge', () => {
  const qs = Array.from({ length: 2000 }, (_, i) => makeQuestion(seeded(i + 1)));
  it('has MATH_CHOICES (4) distinct choices including the correct answer', () => {
    expect(MATH_CHOICES).toBe(4);
    for (const q of qs) {
      expect(q.choices).toHaveLength(MATH_CHOICES);
      expect(new Set(q.choices).size).toBe(MATH_CHOICES);
      expect(q.choices[q.correctIndex]).toBe(q.answer);
    }
  });
  it('answers are correct, division exact, nothing negative', () => {
    for (const q of qs) {
      const real = q.op === '+' ? q.a + q.b : q.op === '-' ? q.a - q.b : q.op === '×' ? q.a * q.b : q.a / q.b;
      expect(q.answer).toBe(real);
      if (q.op === '÷') expect(q.a % q.b).toBe(0);
      expect(Number.isInteger(q.answer)).toBe(true);
      for (const c of q.choices) expect(c).toBeGreaterThanOrEqual(0);
      if (q.op === '×' || q.op === '÷') { expect(Math.max(q.op === '×' ? q.a : q.answer, q.b)).toBeLessThanOrEqual(12); }
    }
  });
  it('all four operations appear', () => {
    expect(new Set(qs.map(q => q.op))).toEqual(new Set(['+', '-', '×', '÷']));
  });
  it('correct pays MATH_REWARD, wrong pays 0', () => {
    const q = qs[0]; expect(checkAnswer(q, q.answer)).toBe(MATH_REWARD);
    expect(checkAnswer(q, q.choices.find(c => c !== q.answer)!)).toBe(0);
  });
  it('shop prices doubled', () => {
    expect([SHOP.luckySpawn.price, SHOP.coinBoost.price, SHOP.magicUpgrade.price, SHOP.luckyChance.price]).toEqual([30, 50, 80, 100]);
  });
});
