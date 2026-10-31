import Phaser from 'phaser';
import { BoardScene } from './scenes/BoardScene';
import { load, save } from './core/save';
import { buy, spawn, ShopId } from './core/game';
import { SHOP } from './config';

const state = load();
const $ = (id: string) => document.getElementById(id)!;
let scene: BoardScene;

function refresh() {
  save(state);
  $('coin-count').textContent = String(state.coins);
  $('boost').textContent = state.boostMerges > 0 ? `⚡ 2x coins: ${state.boostMerges} merges left` : '';
  document.querySelectorAll<HTMLButtonElement>('.shop-item').forEach(b => { b.disabled = state.coins < SHOP[b.dataset.id as ShopId].price; });
}
const msg = (t: string) => { $('msg').textContent = t; };

(Object.keys(SHOP) as ShopId[]).forEach(id => {
  const b = document.createElement('button'); b.className = 'shop-item'; b.dataset.id = id; b.id = `shop-${id}`;
  b.innerHTML = `${SHOP[id].name} — 🪙${SHOP[id].price}<small>${SHOP[id].description}</small>`;
  b.onclick = () => { const r = buy(state, id); msg(r.ok ? `Bought ${SHOP[id].name}!` : r.reason!); if (r.ok) scene.redraw(r.cell); refresh(); };
  $('shop').appendChild(b);
});
$('spawn-btn').onclick = () => { const i = spawn(state); if (i < 0) msg('Board is full!'); else scene.redraw(i); refresh(); };

scene = new BoardScene(state, refresh);
new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 600, height: 600, backgroundColor: '#1d2440', scene });
refresh();
(window as any).__state = state;
