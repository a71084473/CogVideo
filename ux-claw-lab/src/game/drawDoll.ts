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
  if (shape === 'bun') return -h * 0.42;
  if (shape === 'drop') return -h * 0.42;
  return -h * 0.56;
}

export function drawDoll(ctx: CanvasRenderingContext2D, def: DollDef, o: DollDrawOpts) {
  const r = o.r;
  const sq = o.squash ?? 0;
  const breathe = Math.sin((o.bounce ?? 0) * Math.PI * 2) * 0.025;
  const h = r * 1.9;
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.tilt ?? 0);
  ctx.scale(1 + sq * 0.25 - breathe, 1 - sq * 0.3 + breathe);

  const fill = o.silhouette ? '#cfc6e6' : def.color;
  const level = o.level ?? 1;

  // legendary aura
  if (!o.silhouette && def.rarity === 'legendary') {
    const g = ctx.createRadialGradient(0, -h / 2, r * 0.5, 0, -h / 2, r * 1.8);
    g.addColorStop(0, 'rgba(255,240,170,0.55)');
    g.addColorStop(1, 'rgba(255,240,170,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, -h / 2, r * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // cat ears (behind body)
  if (def.body === 'cat') {
    ctx.fillStyle = fill;
    ctx.strokeStyle = '#35465C';
    ctx.lineWidth = Math.max(1.2, r * 0.08);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.85, -h * 0.62);
      ctx.lineTo(s * r * 0.75, -h * 1.08);
      ctx.lineTo(s * r * 0.2, -h * 0.88);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // body with soft 3D shading
  bodyPath(ctx, def.body, r, h);
  const grad = ctx.createLinearGradient(-r, -h, r, 0);
  grad.addColorStop(0, o.silhouette ? '#ddd6ef' : lighten(fill, 0.35));
  grad.addColorStop(0.55, fill);
  grad.addColorStop(1, o.silhouette ? '#b9afd6' : darken(fill, 0.12));
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = Math.max(1.4, r * 0.09);
  ctx.strokeStyle = '#35465C';
  ctx.stroke();

  // glossy highlight
  ctx.save();
  bodyPath(ctx, def.body, r, h);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.45, -h * 0.72, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (o.silhouette) {
    ctx.fillStyle = '#8f84b5';
    ctx.font = `900 ${r * 0.9}px "Baloo 2", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, -h * 0.5);
    ctx.restore();
    return;
  }

  // belly badge
  ctx.fillStyle = 'rgba(255,249,240,0.92)';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.2, r * 0.36, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `${r * 0.38}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(def.mark, 0, -h * 0.19);

  // face
  const fy = faceTop(def.body, h);
  const ex = r * 0.36;
  const face = o.face ?? 'happy';
  ctx.fillStyle = '#35465C';
  ctx.strokeStyle = '#35465C';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.4, r * 0.09);
  for (const s of [-1, 1]) {
    const cx = s * ex;
    if (o.blink || face === 'sleepy') {
      ctx.beginPath();
      ctx.arc(cx, fy, r * 0.12, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else if (face === 'meh') {
      ctx.beginPath();
      ctx.arc(cx, fy, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = darken(def.color, 0.05);
      ctx.fillRect(cx - r * 0.2, fy - r * 0.2, r * 0.4, r * 0.17);
      ctx.fillStyle = '#35465C';
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.19, fy - r * 0.03);
      ctx.lineTo(cx + r * 0.19, fy - r * 0.03);
      ctx.stroke();
    } else {
      const er = face === 'wow' ? r * 0.17 : r * 0.14;
      ctx.beginPath();
      ctx.arc(cx, fy, er, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx - er * 0.35, fy - er * 0.4, er * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#35465C';
    }
  }
  // mouth
  ctx.beginPath();
  if (face === 'wow') {
    ctx.ellipse(0, fy + r * 0.3, r * 0.1, r * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (face === 'sad') {
    ctx.arc(0, fy + r * 0.38, r * 0.12, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else if (face === 'meh') {
    ctx.moveTo(-r * 0.1, fy + r * 0.28);
    ctx.lineTo(r * 0.1, fy + r * 0.26);
    ctx.stroke();
  } else {
    ctx.moveTo(-r * 0.12, fy + r * 0.2);
    ctx.quadraticCurveTo(-r * 0.06, fy + r * 0.32, 0, fy + r * 0.22);
    ctx.quadraticCurveTo(r * 0.06, fy + r * 0.32, r * 0.12, fy + r * 0.2);
    ctx.stroke();
  }
  // blush
  ctx.fillStyle = 'rgba(255,120,150,0.4)';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * r * 0.62, fy + r * 0.2, r * 0.15, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lv2: scarf
  if (level >= 2) {
    ctx.fillStyle = def.accent;
    ctx.strokeStyle = '#35465C';
    ctx.lineWidth = Math.max(1, r * 0.06);
    const sy = fy + r * 0.5;
    ctx.beginPath();
    ctx.roundRect(-r * 0.78, sy, r * 1.56, r * 0.2, r * 0.1);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(r * 0.3, sy + r * 0.1, r * 0.2, r * 0.4, r * 0.08);
    ctx.fill();
    ctx.stroke();
  }
  // Lv3: tiny crown
  if (level >= 3) {
    const cy = def.body === 'drop' ? -h * 0.9 : def.body === 'bun' ? -h * 0.78 : -h * 0.98;
    ctx.fillStyle = '#FFD45E';
    ctx.strokeStyle = '#35465C';
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.beginPath();
    const cw = r * 0.5;
    ctx.moveTo(-cw, cy);
    ctx.lineTo(-cw, cy - r * 0.32);
    ctx.lineTo(-cw * 0.45, cy - r * 0.14);
    ctx.lineTo(0, cy - r * 0.42);
    ctx.lineTo(cw * 0.45, cy - r * 0.14);
    ctx.lineTo(cw, cy - r * 0.32);
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
