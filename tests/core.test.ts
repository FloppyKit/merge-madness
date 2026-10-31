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
    s.cells[7] = 14; s.cells[8] = 14; expect(moveItem(s, 7, 8).kind).toBe('swap');
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

import { weightedPick, checkWin } from '../src/core/game';
import { LUCKY_CHANCE_WEIGHTS, MAX_TIER, WIN_TIER, tierValue, TIER_COLORS } from '../src/config';
describe('2048 numbers', () => {
  it('tier n shows 2^n up to 16384', () => {
    expect(MAX_TIER).toBe(14); expect(WIN_TIER).toBe(14);
    expect([1, 2, 3, 8, 13, 14].map(tierValue)).toEqual([2, 4, 8, 256, 8192, 16384]);
  });
  it('every tier has a unique color and growing coins', () => {
    const cols = Object.values(TIER_COLORS); expect(cols.length).toBe(14); expect(new Set(cols).size).toBe(14);
    for (let t = 2; t <= 14; t++) expect(TIER_COIN_VALUES[t]).toBeGreaterThan(TIER_COIN_VALUES[t - 1]);
  });
  it('8 + 8 merges into 16 (tier 8 -> 9 now allowed); 8192+8192 -> 16384', () => {
    const s = newGame(); s.cells[0] = 8; s.cells[1] = 8; expect(moveItem(s, 0, 1).kind).toBe('merge'); expect(s.cells[1]).toBe(9);
    s.cells[2] = 13; s.cells[3] = 13; expect(moveItem(s, 2, 3)).toMatchObject({ kind: 'merge', tier: 14 });
  });
  it('win triggers once per save, persists', () => {
    const m = new Map<string, string>(); const st = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
    const s = newGame(); expect(checkWin(s)).toBe(false);
    s.cells[0] = 13; s.cells[1] = 13; moveItem(s, 0, 1);
    expect(checkWin(s)).toBe(true); expect(checkWin(s)).toBe(false);
    save(s, st); const l = load(st); expect(l.won).toBe(true); expect(checkWin(l)).toBe(false);
  });
  it('win via Magic Upgrade too', () => {
    const s = newGame(); s.coins = 100; s.cells[0] = 13; expect(buy(s, 'magicUpgrade').ok).toBe(true);
    expect(s.cells[0]).toBe(14); expect(checkWin(s)).toBe(true);
  });
  it('old 8-tier save loads with same tiers, won=false', () => {
    const c = Array(36).fill(null); c[0] = 8; c[1] = 3;
    const st = { getItem: () => JSON.stringify({ cols: 6, rows: 6, cells: c, coins: 77, boostMerges: 2 }), setItem: () => {} };
    const l = load(st); expect(l.cells[0]).toBe(8); expect(l.cells[1]).toBe(3); expect(l.coins).toBe(77); expect(l.boostMerges).toBe(2); expect(l.won).toBe(false);
  });
});
describe('Lucky Chance', () => {
  const W = { 1: 50, 2: 40, 3: 30, 4: 25, 5: 20, 6: 10, 7: 1, 8: 0.1 }; // total 176.1
  const at = (x: number) => () => x / 176.1;
  it('config matches Miles numbers', () => { expect(LUCKY_CHANCE_WEIGHTS).toEqual(W); expect(SHOP.luckyChance.price).toBe(50); });
  it('weighted pick respects boundaries (incl. decimal 0.1)', () => {
    expect(weightedPick(W, at(0))).toBe(1);
    expect(weightedPick(W, at(49.999))).toBe(1);
    expect(weightedPick(W, at(50))).toBe(2);
    expect(weightedPick(W, at(90))).toBe(3);
    expect(weightedPick(W, at(125))).toBe(4);
    expect(weightedPick(W, at(145))).toBe(5);
    expect(weightedPick(W, at(165))).toBe(6);
    expect(weightedPick(W, at(175))).toBe(7);
    expect(weightedPick(W, at(175.99))).toBe(7);
    expect(weightedPick(W, at(176.01))).toBe(8);
    expect(weightedPick(W, () => 0.999999)).toBe(8);
  });
  it('frequencies roughly follow weights', () => {
    let seed = 1; const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const n = 1761000, counts: Record<number, number> = {};
    for (let i = 0; i < n; i++) { const t = weightedPick(W, rng); counts[t] = (counts[t] ?? 0) + 1; }
    for (const [t, w] of Object.entries(W)) expect(Math.abs(counts[+t] / 10000 - w)).toBeLessThan(Math.max(0.05, w * 0.05));
  });
  it('zero weight never picked', () => { expect(weightedPick({ 1: 0, 2: 1 }, () => 0)).toBe(2); });
  it('buy deducts 50 and places the picked tier', () => {
    const s = newGame(); s.coins = 60;
    const r = buy(s, 'luckyChance', at(125));
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
