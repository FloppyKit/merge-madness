import { MAX_TIER } from '../config';
import { GameState, newGame } from './game';
const KEY = 'miles-merge-v0';
export interface Store { getItem(k: string): string | null; setItem(k: string, v: string): void; }
export function save(s: GameState, st: Store = localStorage) { st.setItem(KEY, JSON.stringify(s)); }
export function load(st: Store = localStorage): GameState {
  try {
    const raw = st.getItem(KEY);
    if (!raw) return newGame();
    const d = JSON.parse(raw) as GameState;
    const base = newGame();
    if (!Array.isArray(d.cells) || d.cells.length !== base.cells.length) return base;
    // Old 8-tier saves: same tier numbers, just add missing fields; drop junk values.
    const cells = d.cells.map(c => (typeof c === 'number' && Number.isInteger(c) && c >= 1 && c <= MAX_TIER ? c : null));
    return {
      ...base,
      coins: typeof d.coins === 'number' && isFinite(d.coins) ? d.coins : base.coins,
      boostMerges: typeof d.boostMerges === 'number' ? d.boostMerges : 0,
      won: d.won === true,
      cells,
    };
  } catch { return newGame(); }
}
