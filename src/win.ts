// YOU WIN overlay + DOM canvas confetti (no outside libraries).
export function showWin() {
  const cv = document.createElement('canvas'); cv.id = 'confetti';
  cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
  const ctx = cv.getContext('2d')!;
  const colors = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb', '#ff9100', '#fff'];
  const bits = Array.from({ length: 400 }, () => ({
    x: cv.width / 2 + (Math.random() - 0.5) * 200, y: cv.height * 0.45,
    vx: (Math.random() - 0.5) * 26, vy: -Math.random() * 24 - 6,
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
    w: 8 + Math.random() * 8, h: 5 + Math.random() * 6, c: colors[(Math.random() * colors.length) | 0],
  }));
  const start = performance.now();
  const tick = (now: number) => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const b of bits) {
      b.vy += 0.45; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillStyle = b.c; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); ctx.restore();
    }
    if (now - start < 6000) requestAnimationFrame(tick); else cv.remove();
  };
  requestAnimationFrame(tick);
  const o = document.createElement('div'); o.id = 'win-overlay';
  o.innerHTML = '<div class="win-box"><div class="win-title">YOU WIN!</div><div class="win-sub">You made 16,384! 🎉</div><button id="keep-playing">Keep playing</button></div>';
  document.body.appendChild(o);
  o.querySelector('button')!.addEventListener('click', () => o.remove());
}
