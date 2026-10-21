import { useEffect, useRef } from 'react';
import { dollById } from '../data/dolls';
import { drawDoll, Face } from '../game/drawDoll';

/** Renders a doll with the exact same drawing code used inside the machine. */
export function DollAvatar({
  id,
  size = 72,
  level = 1,
  face = 'happy',
  silhouette = false,
  animate = false,
}: {
  id: string;
  size?: number;
  level?: number;
  face?: Face;
  silhouette?: boolean;
  animate?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const def = dollById(id);
    const cv = ref.current;
    if (!def || !cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr;
    cv.height = size * dpr;
    const ctx = cv.getContext('2d')!;
    let raf = 0;
    const paint = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      drawDoll(ctx, def, {
        x: size / 2,
        y: size * 0.92,
        r: size * 0.3,
        level,
        face,
        silhouette,
        bounce: animate ? (t / 1800) % 1 : 0,
        blink: animate && Math.sin(t / 700) > 0.97,
      });
      if (animate) raf = requestAnimationFrame(paint);
    };
    paint(0);
    return () => cancelAnimationFrame(raf);
  }, [id, size, level, face, silhouette, animate]);
  const def = dollById(id);
  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size }}
      role="img"
      aria-label={silhouette ? '尚未收集的娃娃' : `${def?.zh ?? ''}娃娃 等級 ${level}`}
    />
  );
}
