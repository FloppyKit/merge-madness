import Phaser from 'phaser';
import { BoardScene } from './scenes/BoardScene';
import { load, save } from './core/save';
import { buy, spawn, resetGame, checkWin, ShopId } from './core/game';
import { SHOP, tierValue, MATH_REWARD } from './config';
import { showWin } from './win';
import { makeQuestion, checkAnswer, LETTERS } from './core/math';

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

$('new-game-btn').onclick = () => {
  if (document.getElementById('confirm-overlay')) return;
  const o = document.createElement('div'); o.id = 'confirm-overlay';
  o.innerHTML = '<div class="confirm-box"><div class="confirm-text">Start over? Your orbs and coins will go away.</div><button id="confirm-yes">Yes, start over</button><button id="confirm-no">No, keep playing</button></div>';
  document.body.appendChild(o);
  $('confirm-no').onclick = () => o.remove();
  $('confirm-yes').onclick = () => { o.remove(); document.getElementById('win-overlay')?.remove(); resetGame(state); scene.redraw(); msg('New game! Tap Spawn to begin ✨'); refresh(); };
};

$('math-sub').textContent = `free! +${MATH_REWARD} coins`;
$('math-btn').onclick = () => {
  if (document.getElementById('math-overlay')) return;
  const o = document.createElement('div'); o.id = 'math-overlay'; document.body.appendChild(o);
  const ask = () => {
    const q = makeQuestion(); (window as any).__math = q;
    o.innerHTML = `<div class="math-box"><div class="math-title">Math Challenge 🧮</div><div id="math-q">${q.text}</div><div id="math-choices"></div><div id="math-result"></div><div id="math-nav"></div></div>`;
    q.choices.forEach((c, i) => {
      const b = document.createElement('button'); b.className = 'math-choice'; b.id = `math-choice-${LETTERS[i]}`; b.dataset.value = String(c);
      b.innerHTML = `<b>${LETTERS[i]}</b> ${c}`;
      b.onclick = () => {
        o.querySelectorAll<HTMLButtonElement>('.math-choice').forEach(x => { x.disabled = true; if (Number(x.dataset.value) === q.answer) x.classList.add('right'); });
        const won = checkAnswer(q, c); state.coins += won;
        const r = $('math-result'); r.className = won ? 'good' : 'bad';
        r.textContent = won ? `Correct! +${won} coins 🎉` : `Oops! The answer was ${q.answer}`;
        if (!won) b.classList.add('wrong');
        $('math-nav').innerHTML = '<button id="math-next">Next question ➡️</button><button id="math-close">Close</button>';
        $('math-next').onclick = ask; $('math-close').onclick = () => o.remove();
        refresh();
      };
      $('math-choices').appendChild(b);
    });
  };
  ask();
};

scene = new BoardScene(state, refresh);
new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 600, height: 600, backgroundColor: '#1d2440', scene });
refresh();
(window as any).__state = state;
