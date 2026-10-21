import { dollById } from '../data/dolls';
import { drawDoll, lighten } from './drawDoll';
import { CHUTE, ClawEngine, D, DollBody, RAIL_Y, W, dollHeight } from './physics';

export const CW = 360;
export const CH = 440;
const FLOOR_BACK = 245;
const FLOOR_FRONT = 395;

export interface Theme {
  wallTop: string;
  wallBottom: string;
  floor: string;
  light: string;
  claw: string;
}

export const scaleAt = (z: number) => 0.72 + 0.28 * (z / D);
export const floorY = (z: number) => FLOOR_BACK + (z / D) * (FLOOR_FRONT - FLOOR_BACK);
export function project(x: number, y: number, z: number) {
  const s = scaleAt(z);
  return { sx: CW / 2 + (x - W / 2) * 1.1 * s, sy: floorY(z) - y * s * 0.85, s };
}

/** Screen → world on the floor plane (used for tap-to-aim). */
export function unprojectFloor(sx: number, sy: number) {
  const z = Math.max(0, Math.min(D, ((sy - FLOOR_BACK) / (FLOOR_FRONT - FLOOR_BACK)) * D));
  const s = scaleAt(z);
  const x = W / 2 + (sx - CW / 2) / (1.1 * s);
  return { x: Math.max(0, Math.min(W, x)), z };
}

function quad(ctx: CanvasRenderingContext2D, pts: { sx: number; sy: number }[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0].sx, pts[0].sy);
  for (const p of pts.slice(1)) ctx.lineTo(p.sx, p.sy);
  ctx.closePath();
}

export function renderMachine(ctx: CanvasRenderingContext2D, eng: ClawEngine, theme: Theme, t: number, opts: { aim: boolean; levels: Record<string, number> }) {
  ctx.clearRect(0, 0, CW, CH);

  // back wall
  const bg = ctx.createLinearGradient(0, 0, 0, FLOOR_BACK);
  bg.addColorStop(0, theme.wallTop);
  bg.addColorStop(1, theme.wallBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CW, CH);

  // twinkly back-wall pattern
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 18; i++) {
    const px = (i * 73) % CW;
    const py = 20 + ((i * 41) % (FLOOR_BACK - 50));
    const tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
    ctx.globalAlpha = 0.25 + tw * 0.5;
    star(ctx, px, py, 2 + (i % 3));
  }
  ctx.globalAlpha = 1;

  // floor
  const fl = [project(0, 0, 0), project(W, 0, 0), project(W, 0, D), project(0, 0, D)];
  quad(ctx, fl);
  const fg = ctx.createLinearGradient(0, FLOOR_BACK, 0, FLOOR_FRONT);
  fg.addColorStop(0, lighten(theme.floor, 0.2));
  fg.addColorStop(1, theme.floor);
  ctx.fillStyle = fg;
  ctx.fill();
  // side walls
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  quad(ctx, [{ sx: 0, sy: 0 }, project(0, RAIL_Y + 30, 0), fl[0], fl[3], { sx: 0, sy: CH }]);
  ctx.fill();
  quad(ctx, [{ sx: CW, sy: 0 }, project(W, RAIL_Y + 30, 0), fl[1], fl[2], { sx: CW, sy: CH }]);
  ctx.fill();
  // floor dots
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let x = 20; x < W; x += 40)
    for (let z = 10; z < D; z += 30) {
      const p = project(x + ((z / 30) % 2) * 20, 0, z);
      ctx.beginPath();
      ctx.ellipse(p.sx, p.sy, 3 * p.s, 1.6 * p.s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

  // chute hole
  const hole = [project(CHUTE.x0 + 4, 0, CHUTE.z0), project(CHUTE.x1, 0, CHUTE.z0), project(CHUTE.x1, 0, CHUTE.z1), project(CHUTE.x0 + 4, 0, CHUTE.z1)];
  quad(ctx, hole);
  const hg = ctx.createLinearGradient(0, hole[0].sy, 0, hole[2].sy);
  hg.addColorStop(0, '#2a2140');
  hg.addColorStop(1, '#4a3a70');
  ctx.fillStyle = hg;
  ctx.fill();
  // chute back + side acrylic walls
  const wallH = CHUTE.wall;
  ctx.fillStyle = 'rgba(200,235,255,0.35)';
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.5;
  quad(ctx, [project(CHUTE.x0 + 4, 0, CHUTE.z0), project(CHUTE.x1, 0, CHUTE.z0), project(CHUTE.x1, wallH, CHUTE.z0), project(CHUTE.x0 + 4, wallH, CHUTE.z0)]);
  ctx.fill();
  ctx.stroke();
  quad(ctx, [project(CHUTE.x1, 0, CHUTE.z0), project(CHUTE.x1, 0, CHUTE.z1), project(CHUTE.x1, wallH, CHUTE.z1), project(CHUTE.x1, wallH, CHUTE.z0)]);
  ctx.fill();
  ctx.stroke();

  const tip = eng.tip();
  const c = eng.claw;

  // shadows
  const items: ({ kind: 'doll'; d: DollBody } | { kind: 'claw' })[] = [];
  for (const d of eng.dolls) {
    if (d.state === 'won') continue;
    if (d.state !== 'chute') {
      const p = project(d.x, 0, d.z);
      const lift = Math.max(0, d.y);
      ctx.fillStyle = `rgba(53,70,92,${0.22 * Math.max(0.25, 1 - lift / 200)})`;
      ctx.beginPath();
      ctx.ellipse(p.sx, p.sy, d.r * p.s * (1.05 - Math.min(0.5, lift / 400)), d.r * p.s * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    items.push({ kind: 'doll', d });
  }
  // claw shadow / aim marker
  {
    const p = project(tip.x, 0, tip.z);
    const hgt = Math.max(0, tip.y);
    ctx.fillStyle = `rgba(53,70,92,${0.12 + 0.2 * (1 - hgt / 260)})`;
    ctx.beginPath();
    ctx.ellipse(p.sx, p.sy, 18 * p.s * (0.7 + hgt / 600), 6 * p.s, 0, 0, Math.PI * 2);
    ctx.fill();
    if (opts.aim && c.phase === 'ready') {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      const top = project(tip.x, tip.y - 20, tip.z);
      ctx.beginPath();
      ctx.moveTo(top.sx, top.sy);
      ctx.lineTo(p.sx, p.sy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#FFA9C5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.sx, p.sy, 10 * p.s, 3.5 * p.s, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  items.push({ kind: 'claw' });
  const zOf = (it: (typeof items)[number]) => (it.kind === 'claw' ? tip.z + 0.5 : it.d.z);
  items.sort((a, b) => zOf(a) - zOf(b));

  for (const it of items) {
    if (it.kind === 'claw') {
      drawClaw(ctx, eng, theme, t);
      continue;
    }
    const d = it.d;
    const def = dollById(d.dollId);
    if (!def) continue;
    const p = project(d.x, d.y, d.z);
    ctx.save();
    if (d.state === 'chute') {
      // disappears into the hole
      const front = project(d.x, 0, CHUTE.z1);
      ctx.beginPath();
      ctx.rect(0, 0, CW, front.sy);
      ctx.clip();
    }
    const blink = Math.sin(t * 1.3 + d.uid * 7) > 0.985;
    drawDoll(ctx, def, {
      x: p.sx,
      y: p.sy,
      r: d.r * 1.1 * p.s,
      squash: d.squash,
      tilt: d.tilt + (d.state === 'rest' ? Math.sin(d.wobble) * 0.02 : 0),
      level: opts.levels[d.dollId] ?? 1,
      face: d.state === 'held' ? 'wow' : d.state === 'falling' ? 'wow' : d.uid % 3 === 0 ? 'meh' : 'happy',
      blink,
      bounce: d.state === 'rest' ? (t * 0.4 + d.uid * 0.13) % 1 : 0,
    });
    if (d.rarity !== 'common' && d.state === 'rest') {
      ctx.fillStyle = d.rarity === 'legendary' ? '#FFD45E' : '#fff';
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 4 + d.uid);
      star(ctx, p.sx + d.r * p.s * 0.9, p.sy - dollHeight(d) * p.s, 4);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // chute front acrylic wall (drawn over dolls behind it)
  ctx.fillStyle = 'rgba(200,235,255,0.28)';
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  quad(ctx, [project(CHUTE.x0 + 4, wallH, CHUTE.z1), project(CHUTE.x1, wallH, CHUTE.z1), project(CHUTE.x1, 0, CHUTE.z1), project(CHUTE.x0 + 4, 0, CHUTE.z1)]);
  ctx.fill();
  ctx.stroke();
  const lab = project((CHUTE.x0 + CHUTE.x1) / 2, wallH * 0.45, CHUTE.z1);
  ctx.fillStyle = '#fff';
  ctx.font = '800 11px "Baloo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PRIZE ⬇', lab.sx, lab.sy + 4);

  // cabinet front lip
  const lip = ctx.createLinearGradient(0, FLOOR_FRONT, 0, CH);
  lip.addColorStop(0, 'rgba(255,255,255,0.7)');
  lip.addColorStop(0.08, theme.light);
  lip.addColorStop(1, lighten(theme.light, 0.3));
  ctx.fillStyle = lip;
  ctx.fillRect(0, FLOOR_FRONT, CW, CH - FLOOR_FRONT);
  // bulbs
  for (let i = 0; i < 12; i++) {
    const on = Math.floor(t * 4 + i) % 3 === 0;
    ctx.fillStyle = on ? '#FFF6C8' : 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(15 + i * 30, FLOOR_FRONT + 22, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // glass reflection
  const gl = ctx.createLinearGradient(0, 0, CW, CH);
  gl.addColorStop(0, 'rgba(255,255,255,0.18)');
  gl.addColorStop(0.3, 'rgba(255,255,255,0)');
  gl.addColorStop(0.65, 'rgba(255,255,255,0)');
  gl.addColorStop(0.7, 'rgba(255,255,255,0.12)');
  gl.addColorStop(0.78, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, CW, FLOOR_FRONT);
}

function drawClaw(ctx: CanvasRenderingContext2D, eng: ClawEngine, theme: Theme, t: number) {
  const c = eng.claw;
  const tip = eng.tip();
  // gantry rail across the machine at the claw's depth
  const r0 = project(0, RAIL_Y, c.z);
  const r1 = project(W, RAIL_Y, c.z);
  ctx.strokeStyle = 'rgba(53,70,92,0.55)';
  ctx.lineWidth = 4 * r0.s;
  ctx.beginPath();
  ctx.moveTo(r0.sx, r0.sy);
  ctx.lineTo(r1.sx, r1.sy);
  ctx.stroke();
  const anchor = project(c.x, RAIL_Y, c.z);
  ctx.fillStyle = '#35465C';
  ctx.beginPath();
  ctx.roundRect(anchor.sx - 12 * anchor.s, anchor.sy - 6 * anchor.s, 24 * anchor.s, 12 * anchor.s, 4);
  ctx.fill();

  const body = project(tip.x, tip.y + 44, tip.z);
  const s = body.s;
  // cable
  ctx.strokeStyle = '#8a7d6b';
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.moveTo(anchor.sx, anchor.sy);
  ctx.lineTo(body.sx, body.sy - 10 * s);
  ctx.stroke();

  ctx.save();
  ctx.translate(body.sx, body.sy);
  ctx.rotate(-c.swingX * 0.6);
  // prongs
  const open = c.open;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 10 * s, 8 * s);
    ctx.rotate(-side * (0.05 + open * 0.5));
    ctx.strokeStyle = '#35465C';
    ctx.lineWidth = 2 * s;
    ctx.fillStyle = '#c9c4d6';
    ctx.beginPath();
    ctx.moveTo(-3 * s, 0);
    ctx.quadraticCurveTo(side * 10 * s, 18 * s, side * 2 * s, 32 * s);
    ctx.lineTo(-side * 3 * s, 30 * s);
    ctx.quadraticCurveTo(side * 4 * s, 18 * s, 3 * s, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  // body (cute claw head like the reference)
  ctx.fillStyle = theme.claw;
  ctx.strokeStyle = '#35465C';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.roundRect(-17 * s, -12 * s, 34 * s, 24 * s, 8 * s);
  ctx.fill();
  ctx.stroke();
  // eyes
  const look = c.phase === 'ready' ? Math.sin(t * 1.5) * 1.5 : 0;
  for (const side of [-1, 1]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(side * 8 * s, -2 * s, 6 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#35465C';
    ctx.beginPath();
    ctx.arc(side * 8 * s + look * s, -1 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  // bolt
  ctx.fillStyle = '#FFA9C5';
  ctx.beginPath();
  ctx.arc(0, 8 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 === 0 ? r : r * 0.35;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}
