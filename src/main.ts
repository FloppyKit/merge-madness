import Phaser from 'phaser';
import { BoardScene } from './scenes/BoardScene';
import { load, save } from './core/save';
import { buy, spawn, checkWin, ShopId } from './core/game';
import { SHOP, tierValue } from './config';
import { showWin } from './win';

const state = load();
const $ = (id: string) => document.getElementById(id)!;
let scene: BoardScene;

function refresh() {
  if (checkWin(state)) showWin();
  save(state);
  $('coin-count').textContent = String(state.coins);
  $('boost').textContent = state.boostMerges > 0 ? `⚡ 2x coins: ${state.boostMerges} merges left` : '';
  document.querySelectorAll<HTMLButtonElement>('.shop-item').forEach(b => { const p = SHOP[b.dataset.id as ShopId].price; b.disabled = state.coins < p; b.title = b.disabled ? `Need ${p} coins. Keep merging! 🪙` : ''; });
}
const friendly = (r: string) => r === 'Board is full' ? 'Board is full! Merge some orbs to make room 🙂' : r === 'Not enough coins' ? 'Not enough coins yet. Keep merging! 🪙' : r;
const msg = (t: string) => { $('msg').textContent = t; };

(Object.keys(SHOP) as ShopId[]).forEach(id => {
  const b = document.createElement('button'); b.className = 'shop-item'; b.dataset.id = id; b.id = `shop-${id}`;
  b.innerHTML = `${SHOP[id].name} — 🪙${SHOP[id].price}<small>${SHOP[id].description}</small>`;
  b.onclick = () => { const r = buy(state, id); msg(r.ok ? (r.tier ? `${SHOP[id].name} gave you a ${tierValue(r.tier)} orb! 🍀` : `Bought ${SHOP[id].name}!`) : friendly(r.reason!)); if (r.ok) scene.redraw(r.cell); refresh(); };
  $('shop').appendChild(b);
});
$('spawn-btn').onclick = () => { const i = spawn(state); if (i < 0) msg('Board is full!'); else scene.redraw(i); refresh(); };

scene = new BoardScene(state, refresh);
new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 600, height: 600, backgroundColor: '#1d2440', scene });
refresh();
(window as any).__state = state;
