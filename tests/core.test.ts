import { describe, it, expect } from 'vitest';
import { newGame, moveItem, spawn, buy } from '../src/core/game';
import { save, load } from '../src/core/save';
import { TIER_COIN_VALUES, SHOP, STARTING_COINS } from '../src/config';

describe('core rules', () => {
  it('spawn drops tier 1 in empty cell', () => {
    const s = newGame(); const i = spawn(s, () => 0);
    expect(s.cells[i]).toBe(1);
  });
  it('merge same tier -> next tier + coins', () => {
    const s = newGame(); s.cells[0] = 3; s.cells[1] = 3;
    const r = moveItem(s, 0, 1);
    expect(r.kind).toBe('merge'); expect(s.cells[1]).toBe(4); expect(s.cells[0]).toBeNull();
    expect(s.coins).toBe(STARTING_COINS + TIER_COIN_VALUES[4]);
  });
  it('move to empty, swap on mismatch, max tier does not merge', () => {
    const s = newGame(); s.cells[0] = 1;
    expect(moveItem(s, 0, 5).kind).toBe('move'); expect(s.cells[5]).toBe(1);
    s.cells[6] = 2; expect(moveItem(s, 5, 6).kind).toBe('swap'); expect(s.cells[5]).toBe(2); expect(s.cells[6]).toBe(1);
    s.cells[7] = 8; s.cells[8] = 8; expect(moveItem(s, 7, 8).kind).toBe('swap');
  });
  it('shop: costs coins, rejects when poor, coin boost doubles', () => {
    const s = newGame(); s.coins = SHOP.coinBoost.price;
    expect(buy(s, 'coinBoost').ok).toBe(true); expect(s.coins).toBe(0);
    expect(buy(s, 'luckySpawn').ok).toBe(false);
    s.cells[0] = 1; s.cells[1] = 1; moveItem(s, 0, 1);
    expect(s.coins).toBe(TIER_COIN_VALUES[2] * 2); expect(s.boostMerges).toBe(SHOP.coinBoost.merges - 1);
  });
  it('save/load round-trips', () => {
    const m = new Map<string, string>(); const st = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
    const s = newGame(); s.cells[3] = 5; s.coins = 99; save(s, st);
    expect(load(st)).toEqual(s);
  });
});

import { weightedPick } from '../src/core/game';
import { LUCKY_CHANCE_WEIGHTS } from '../src/config';
describe('Lucky Chance', () => {
  const W = { 1: 80, 2: 50, 3: 40, 4: 30, 5: 20, 6: 10, 7: 5, 8: 1 }; // total 236
  const at = (x: number) => () => x / 236;
  it('config matches Miles numbers', () => { expect(LUCKY_CHANCE_WEIGHTS).toEqual(W); expect(SHOP.luckyChance.price).toBe(50); });
  it('weighted pick respects boundaries', () => {
    expect(weightedPick(W, at(0))).toBe(1);
    expect(weightedPick(W, at(79.999))).toBe(1);
    expect(weightedPick(W, at(80))).toBe(2);
    expect(weightedPick(W, at(129.999))).toBe(2);
    expect(weightedPick(W, at(130))).toBe(3);
    expect(weightedPick(W, at(170))).toBe(4);
    expect(weightedPick(W, at(200))).toBe(5);
    expect(weightedPick(W, at(220))).toBe(6);
    expect(weightedPick(W, at(230))).toBe(7);
    expect(weightedPick(W, at(234.999))).toBe(7);
    expect(weightedPick(W, at(235))).toBe(8);
    expect(weightedPick(W, () => 0.999999)).toBe(8);
  });
  it('frequencies roughly follow weights', () => {
    let seed = 1; const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const n = 236000, counts: Record<number, number> = {};
    for (let i = 0; i < n; i++) { const t = weightedPick(W, rng); counts[t] = (counts[t] ?? 0) + 1; }
    for (const [t, w] of Object.entries(W)) expect(Math.abs(counts[+t] / 1000 - w)).toBeLessThan(Math.max(3, w * 0.1));
  });
  it('zero weight never picked', () => { expect(weightedPick({ 1: 0, 2: 1 }, () => 0)).toBe(2); });
  it('buy deducts 50 and places the picked tier', () => {
    const s = newGame(); s.coins = 60;
    const r = buy(s, 'luckyChance', at(170));
    expect(r.ok).toBe(true); expect(r.tier).toBe(4); expect(s.coins).toBe(10);
    expect(s.cells[r.cell!]).toBe(4); expect(s.cells.filter(c => c !== null).length).toBe(1);
  });
  it('refuses when full board, coins unchanged', () => {
    const s = newGame(); s.coins = 100; s.cells.fill(1);
    expect(buy(s, 'luckyChance', at(0))).toEqual({ ok: false, reason: 'Board is full' }); expect(s.coins).toBe(100);
  });
  it('refuses when coins < 50', () => {
    const s = newGame(); s.coins = 49;
    expect(buy(s, 'luckyChance').ok).toBe(false); expect(s.coins).toBe(49); expect(s.cells.every(c => c === null)).toBe(true);
  });
});
