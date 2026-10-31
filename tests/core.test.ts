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
