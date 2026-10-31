import * as C from '../config';

export type Cell = number | null; // tier, or empty
export interface GameState { cols: number; rows: number; cells: Cell[]; coins: number; boostMerges: number; won: boolean; }
export type ShopId = keyof typeof C.SHOP;
export type MoveResult = { kind: 'merge'; tier: number; coins: number } | { kind: 'move' } | { kind: 'swap' } | { kind: 'none' };

export function newGame(): GameState {
  return { cols: C.BOARD_COLS, rows: C.BOARD_ROWS, cells: Array(C.BOARD_COLS * C.BOARD_ROWS).fill(null), coins: C.STARTING_COINS, boostMerges: 0, won: false };
}
export const idx = (s: GameState, x: number, y: number) => y * s.cols + x;
export const emptyCells = (s: GameState) => s.cells.map((c, i) => (c === null ? i : -1)).filter(i => i >= 0);

export function placeAt(s: GameState, tier: number, rand = Math.random): number {
  const e = emptyCells(s);
  if (!e.length) return -1;
  const i = e[Math.floor(rand() * e.length)];
  s.cells[i] = tier;
  return i;
}

export function spawn(s: GameState, rand = Math.random): number {
  if (s.coins < C.SPAWN_COST || !emptyCells(s).length) return -1;
  s.coins -= C.SPAWN_COST;
  return placeAt(s, rand() < C.SPAWN_TIER2_CHANCE ? 2 : 1, rand);
}

export function moveItem(s: GameState, from: number, to: number): MoveResult {
  const a = s.cells[from], b = s.cells[to];
  if (from === to || a === null) return { kind: 'none' };
  if (b === null) { s.cells[to] = a; s.cells[from] = null; return { kind: 'move' }; }
  if (a === b && a < C.MAX_TIER) {
    const tier = a + 1;
    let coins = C.TIER_COIN_VALUES[tier] ?? 0;
    if (s.boostMerges > 0) { coins *= C.SHOP.coinBoost.multiplier; s.boostMerges--; }
    s.cells[to] = tier; s.cells[from] = null; s.coins += coins;
    return { kind: 'merge', tier, coins };
  }
  s.cells[to] = a; s.cells[from] = b;
  return { kind: 'swap' };
}

// Pick a key using relative weights. rand() must return [0, 1).
export function weightedPick(weights: Record<number, number>, rand = Math.random): number {
  const entries = Object.entries(weights).map(([k, w]) => [Number(k), Math.max(0, w)] as const).sort((a, b) => a[0] - b[0]);
  const total = entries.reduce((t, [, w]) => t + w, 0);
  let r = rand() * total;
  for (const [k, w] of entries) { if (w > 0 && r < w) return k; r -= w; }
  return entries.filter(([, w]) => w > 0).pop()![0];
}

export function buy(s: GameState, id: ShopId, rand = Math.random): { ok: boolean; reason?: string; cell?: number; tier?: number } {
  const item = C.SHOP[id];
  if (s.coins < item.price) return { ok: false, reason: 'Not enough coins' };
  let cell: number | undefined;
  if (id === 'luckySpawn') {
    if (!emptyCells(s).length) return { ok: false, reason: 'Board is full' };
    cell = placeAt(s, 2, rand);
  } else if (id === 'luckyChance') {
    if (!emptyCells(s).length) return { ok: false, reason: 'Board is full' };
    const tier = weightedPick(C.LUCKY_CHANCE_WEIGHTS, rand);
    cell = placeAt(s, tier, rand);
    s.coins -= item.price;
    return { ok: true, cell, tier };
  } else if (id === 'coinBoost') {
    s.boostMerges += C.SHOP.coinBoost.merges;
  } else {
    let best = -1;
    s.cells.forEach((c, i) => { if (c !== null && c < C.MAX_TIER && (best < 0 || c < (s.cells[best] as number))) best = i; });
    if (best < 0) return { ok: false, reason: 'No gem to upgrade' };
    s.cells[best] = (s.cells[best] as number) + 1; cell = best;
  }
  s.coins -= item.price;
  return { ok: true, cell };
}

// True exactly once per save: the first time an orb of WIN_TIER (or bigger) is on the board.
export function checkWin(s: GameState): boolean {
  if (s.won || !s.cells.some(c => c !== null && c >= C.WIN_TIER)) return false;
  s.won = true;
  return true;
}
