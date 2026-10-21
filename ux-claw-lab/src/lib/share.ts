import { create } from 'zustand';
import type { DollDef } from '../data/types';
import { drawDoll } from '../game/drawDoll';

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxW) {
      ctx.fillText(line, x, y);
      line = ch;
      y += lh;
    } else line += ch;
  }
  ctx.fillText(line, x, y);
  return y;
}

export const useSharePreview = create<{ url: string | null; name: string }>(() => ({ url: null, name: '' }));

/** Render a collectible card image and share it (or preview it in-page as fallback). */
export async function shareDollCard(def: DollDef, level: number) {
  const W = 600;
  const H = 800;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#B5676B');
  g.addColorStop(1, '#FFE3B8');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#FFF4E0';
  ctx.strokeStyle = '#3E2A1F';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(40, 40, W - 80, H - 80, 40);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.arc(W / 2, 250, 150, 0, Math.PI * 2);
  ctx.fill();
  drawDoll(ctx, def, { x: W / 2, y: 370, r: 95, level, face: 'happy' });
  ctx.fillStyle = '#3E2A1F';
  ctx.textAlign = 'center';
  ctx.font = '800 44px "Baloo 2", "Noto Sans TC", sans-serif';
  ctx.fillText(`${def.dollName}・${def.zh}`, W / 2, 470);
  ctx.font = '700 28px "Baloo 2", sans-serif';
  ctx.fillText(`${def.en}  ·  Lv${level}`, W / 2, 512);
  ctx.font = '500 26px "Noto Sans TC", sans-serif';
  wrap(ctx, def.oneLiner, W / 2, 570, W - 160, 38);
  ctx.font = '800 24px "Baloo 2", sans-serif';
  ctx.fillStyle = '#C75B5F';
  ctx.fillText('UX CLAW LAB｜UX 夾娃娃研究所', W / 2, H - 80);

  const blob: Blob | null = await new Promise((r) => cv.toBlob(r, 'image/png'));
  if (!blob) return;
  const file = new File([blob], `ux-claw-${def.id}.png`, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  try {
    if (nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: `我在 UX CLAW LAB 收集到 ${def.zh}！`, text: def.oneLiner });
      return;
    }
  } catch {
    /* user cancelled → fall back silently */
    return;
  }
  // downloads can be blocked (e.g. sandboxed hosting), so show the card in-page: long-press / right-click to save
  useSharePreview.setState({ url: URL.createObjectURL(blob), name: def.zh });
}
