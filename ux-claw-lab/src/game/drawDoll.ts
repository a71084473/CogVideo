import type { BodyShape, DollDef } from '../data/types';

export type Face = 'happy' | 'meh' | 'wow' | 'sleepy' | 'sad';

export interface DollDrawOpts {
  x: number; // bottom-center
  y: number;
  r: number; // half width in px
  squash?: number;
  tilt?: number;
  level?: number;
  face?: Face;
  blink?: boolean;
  silhouette?: boolean; // locked / unknown doll
  bounce?: number; // idle breathing 0..1
}

function bodyPath(ctx: CanvasRenderingContext2D, shape: BodyShape, r: number, h: number) {
  ctx.beginPath();
  switch (shape) {
    case 'ghost': {
      ctx.moveTo(-r, 0);
      ctx.lineTo(-r, -h + r);
      ctx.arc(0, -h + r, r, Math.PI, 0);
      ctx.lineTo(r, 0);
      const waves = 3;
      for (let i = 0; i < waves; i++) {
        const x0 = r - (i * 2 * r) / waves;
        const x1 = r - ((i + 1) * 2 * r) / waves;
        ctx.quadraticCurveTo((x0 + x1) / 2, -r * 0.28, x1, 0);
      }
      break;
    }
    case 'bean': {
      const w = r * 0.86;
      ctx.moveTo(-w, -w);
      ctx.arc(0, -h + w, w, Math.PI, 0);
      ctx.lineTo(w, -w);
      ctx.arc(0, -w, w, 0, Math.PI);
      break;
    }
    case 'drop': {
      ctx.moveTo(0, -h);
      ctx.bezierCurveTo(r * 0.35, -h * 0.8, r * 1.05, -h * 0.55, r, -h * 0.32);
      ctx.bezierCurveTo(r * 0.98, -h * 0.05, r * 0.6, 0, 0, 0);
      ctx.bezierCurveTo(-r * 0.6, 0, -r * 0.98, -h * 0.05, -r, -h * 0.32);
      ctx.bezierCurveTo(-r * 1.05, -h * 0.55, -r * 0.35, -h * 0.8, 0, -h);
      break;
    }
    case 'bun': {
      const hh = h * 0.82;
      ctx.moveTo(-r * 1.05, -r * 0.2);
      ctx.bezierCurveTo(-r * 1.1, -hh, r * 1.1, -hh, r * 1.05, -r * 0.2);
      ctx.quadraticCurveTo(r * 1.05, 0, r * 0.7, 0);
      ctx.lineTo(-r * 0.7, 0);
      ctx.quadraticCurveTo(-r * 1.05, 0, -r * 1.05, -r * 0.2);
      break;
    }
    case 'cat':
    case 'blob':
    default: {
      ctx.moveTo(-r, -r * 0.4);
      ctx.bezierCurveTo(-r * 1.02, -h * 1.02, r * 1.02, -h * 1.02, r, -r * 0.4);
      ctx.bezierCurveTo(r, -r * 0.05, r * 0.7, 0, 0, 0);
      ctx.bezierCurveTo(-r * 0.7, 0, -r, -r * 0.05, -r, -r * 0.4);
      break;
    }
  }
  ctx.closePath();
}

function faceTop(shape: BodyShape, h: number) {
  if (shape === 'bun') return -h * 0.5;
  if (shape === 'drop') return -h * 0.5;
  return -h * 0.62;
}

const INK = '#3E2A1F';

/**
 * Flat "snack ball" style: solid fill, thick brown outline, a soft shade
 * crescent, stubby feet, tiny dot eyes, and a little snack bag to hold.
 */
export function drawDoll(ctx: CanvasRenderingContext2D, def: DollDef, o: DollDrawOpts) {
  const r = o.r;
  const sq = o.squash ?? 0;
  const breathe = Math.sin((o.bounce ?? 0) * Math.PI * 2) * 0.025;
  const h = r * 1.9;
  const lw = Math.max(1.6, r * 0.11);
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.tilt ?? 0);
  ctx.scale(1 + sq * 0.25 - breathe, 1 - sq * 0.3 + breathe);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const fill = o.silhouette ? '#E6D3BE' : def.color;
  const level = o.level ?? 1;

  // legendary aura
  if (!o.silhouette && def.rarity === 'legendary') {
    const g = ctx.createRadialGradient(0, -h / 2, r * 0.5, 0, -h / 2, r * 1.8);
    g.addColorStop(0, 'rgba(255,214,90,0.6)');
    g.addColorStop(1, 'rgba(255,214,90,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -h / 2, r * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // stubby feet
  ctx.fillStyle = darken(fill, 0.08);
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw * 0.85;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * r * 0.38, r * 0.02, r * 0.17, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // cat ears (behind body)
  if (def.body === 'cat') {
    ctx.fillStyle = fill;
    ctx.lineWidth = lw;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.85, -h * 0.62);
      ctx.lineTo(s * r * 0.75, -h * 1.06);
      ctx.lineTo(s * r * 0.2, -h * 0.88);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // flat body + shade crescent
  bodyPath(ctx, def.body, r, h);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.save();
  bodyPath(ctx, def.body, r, h);
  ctx.clip();
  ctx.fillStyle = 'rgba(62,42,31,0.13)';
  ctx.beginPath();
  ctx.ellipse(r * 0.35, -h * 0.25, r * 1.1, h * 0.55, -0.3, 0, Math.PI * 2);
  ctx.ellipse(r * 0.05, -h * 0.55, r * 1.05, h * 0.6, -0.3, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.5, -h * 0.74, r * 0.13, r * 0.08, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  bodyPath(ctx, def.body, r, h);
  ctx.lineWidth = lw;
  ctx.strokeStyle = INK;
  ctx.stroke();

  if (o.silhouette) {
    ctx.fillStyle = '#A58B70';
    ctx.font = `900 ${r * 0.9}px "Baloo 2", Huninn, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, -h * 0.5);
    ctx.restore();
    return;
  }

  // face: tiny dots, close together (deadpan cute)
  const fy = faceTop(def.body, h);
  const ex = r * 0.24;
  const face = o.face ?? 'happy';
  const eye = r * 0.085;
  ctx.fillStyle = '#2A1A12';
  ctx.strokeStyle = '#2A1A12';
  ctx.lineWidth = Math.max(1.3, r * 0.075);
  for (const sd of [-1, 1]) {
    const cx = sd * ex;
    if (o.blink || face === 'sleepy') {
      ctx.beginPath();
      ctx.moveTo(cx - eye * 1.2, fy);
      ctx.lineTo(cx + eye * 1.2, fy);
      ctx.stroke();
    } else if (face === 'wow') {
      ctx.beginPath();
      ctx.arc(cx, fy, eye * 1.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx - eye * 0.4, fy - eye * 0.5, eye * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2A1A12';
    } else {
      ctx.beginPath();
      ctx.ellipse(cx, fy, eye, eye * 1.25, 0, 0, Math.PI * 2);
      ctx.fill();
      if (face === 'meh' || face === 'sad') {
        // flat, slightly tilted brows = 不太快樂
        ctx.beginPath();
        const tilt = face === 'sad' ? sd * r * 0.06 : 0;
        ctx.moveTo(cx - eye * 1.6, fy - eye * 2.3 - tilt);
        ctx.lineTo(cx + eye * 1.6, fy - eye * 2.3 + tilt);
        ctx.stroke();
      }
    }
  }
  // mouth
  ctx.beginPath();
  const my = fy + r * 0.2;
  if (face === 'wow') {
    ctx.ellipse(0, my + r * 0.03, r * 0.06, r * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (face === 'sad' || face === 'meh') {
    ctx.moveTo(-r * 0.07, my);
    ctx.lineTo(r * 0.07, my);
    ctx.stroke();
  } else {
    ctx.moveTo(-r * 0.09, my - r * 0.02);
    ctx.quadraticCurveTo(-r * 0.045, my + r * 0.06, 0, my);
    ctx.quadraticCurveTo(r * 0.045, my + r * 0.06, r * 0.09, my - r * 0.02);
    ctx.stroke();
  }
  // soft blush
  ctx.fillStyle = 'rgba(214,96,90,0.28)';
  for (const sd of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(sd * r * 0.55, fy + r * 0.17, r * 0.13, r * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lv2: scarf
  if (level >= 2) {
    ctx.fillStyle = def.accent;
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1, r * 0.07);
    const sy = fy + r * 0.42;
    ctx.beginPath();
    ctx.roundRect(-r * 0.8, sy, r * 1.6, r * 0.2, r * 0.1);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-r * 0.55, sy + r * 0.1, r * 0.2, r * 0.38, r * 0.08);
    ctx.fill();
    ctx.stroke();
  }

  // the little snack bag it hugs, printed with its UX mark
  const bx = r * 0.32;
  const by = -h * 0.32;
  const bw = r * 0.62;
  const bh = r * 0.7;
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(0.12);
  ctx.fillStyle = '#FFFDF7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.beginPath();
  ctx.moveTo(-bw / 2, -bh / 2);
  ctx.lineTo(bw / 2, -bh / 2);
  ctx.lineTo(bw / 2 + r * 0.04, bh / 2);
  ctx.lineTo(-bw / 2 - r * 0.04, bh / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // zig-zag top seal
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) ctx.lineTo(-bw / 2 + (i * bw) / 6, -bh / 2 - (i % 2 ? r * 0.06 : 0));
  ctx.stroke();
  ctx.font = `${r * 0.36}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(def.mark, 0, r * 0.04);
  // tiny hand
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(-bw / 2, r * 0.05, r * 0.1, r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Lv3: tiny crown
  if (level >= 3) {
    const cy = def.body === 'drop' ? -h * 0.9 : def.body === 'bun' ? -h * 0.78 : -h * 0.98;
    ctx.fillStyle = '#FFC233';
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1, r * 0.07);
    ctx.beginPath();
    const cw = r * 0.45;
    ctx.moveTo(-cw, cy);
    ctx.lineTo(-cw, cy - r * 0.3);
    ctx.lineTo(-cw * 0.45, cy - r * 0.13);
    ctx.lineTo(0, cy - r * 0.4);
    ctx.lineTo(cw * 0.45, cy - r * 0.13);
    ctx.lineTo(cw, cy - r * 0.3);
    ctx.lineTo(cw, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function lighten(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${r + (255 - r) * a | 0},${g + (255 - g) * a | 0},${b + (255 - b) * a | 0})`;
}
export function darken(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${r * (1 - a) | 0},${g * (1 - a) | 0},${b * (1 - a) | 0})`;
}
