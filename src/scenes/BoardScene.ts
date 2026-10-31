import Phaser from 'phaser';
import { GameState, moveItem } from '../core/game';
import { TIER_COLORS, tierValue } from '../config';

const CELL = 96, PAD = 12;
export class BoardScene extends Phaser.Scene {
  private items = new Map<number, Phaser.GameObjects.Container>();
  constructor(private s: GameState, private onChange: () => void) { super('board'); }
  private pos(i: number) { return { x: PAD + (i % this.s.cols) * CELL + CELL / 2, y: PAD + Math.floor(i / this.s.cols) * CELL + CELL / 2 }; }
  create() {
    const g = this.add.graphics();
    for (let i = 0; i < this.s.cells.length; i++) { const p = this.pos(i); g.fillStyle(0x2c3560).fillRoundedRect(p.x - 44, p.y - 44, 88, 88, 14); }
    this.redraw();
    this.input.on('dragstart', (_: any, o: any) => { this.children.bringToTop(o); o.setScale(1.15); });
    this.input.on('drag', (_: any, o: any, x: number, y: number) => o.setPosition(x, y));
    this.input.on('dragend', (_: any, o: any) => {
      const from = o.getData('i') as number;
      const cx = Math.floor((o.x - PAD) / CELL), cy = Math.floor((o.y - PAD) / CELL);
      const inside = cx >= 0 && cy >= 0 && cx < this.s.cols && cy < this.s.rows;
      const r = inside ? moveItem(this.s, from, cy * this.s.cols + cx) : { kind: 'none' as const };
      const to = cy * this.s.cols + cx;
      this.redraw(r.kind === 'merge' ? to : undefined);
      if (r.kind === 'merge') this.floatText(to, `+${r.coins}`);
      this.onChange();
    });
  }
  redraw(pop?: number) {
    if (!this.add) return;
    this.items.forEach(c => c.destroy()); this.items.clear();
    this.s.cells.forEach((t, i) => {
      if (t === null) return;
      const p = this.pos(i);
      const c = this.add.container(p.x, p.y);
      const gfx = this.add.graphics();
      gfx.fillStyle(0x000000, 0.25).fillCircle(3, 5, 34);
      gfx.fillStyle(TIER_COLORS[t]).fillCircle(0, 0, 34);
      gfx.fillStyle(0xffffff, 0.35).fillCircle(-11, -12, 10);
      const label = String(tierValue(t)); const fs = [0, 34, 34, 28, 22, 18][label.length] ?? 16;
      const txt = this.add.text(0, 0, label, { fontSize: `${fs}px`, fontStyle: 'bold', color: '#fff', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5);
      c.add([gfx, txt]); c.setSize(76, 76).setData('i', i);
      c.setInteractive({ draggable: true, useHandCursor: true });
      this.items.set(i, c);
      if (i === pop) { c.setScale(0.3); this.tweens.add({ targets: c, scale: 1, duration: 350, ease: 'Back.easeOut' }); }
    });
  }
  private floatText(i: number, s: string) {
    const p = this.pos(i);
    const t = this.add.text(p.x, p.y - 20, s, { fontSize: '30px', fontStyle: 'bold', color: '#ffd700', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: p.y - 90, alpha: 0, duration: 1200, onComplete: () => t.destroy() });
  }
}
