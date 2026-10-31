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
    return { ...base, ...d };
  } catch { return newGame(); }
}
