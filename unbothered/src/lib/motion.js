export const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 'scrub' (desktop, full motion) | 'autoplay' (mobile) | 'static' (reduced motion). */
export function resolveMotionMode({ isDesktop, reducedMotion }) {
  if (reducedMotion) return 'static';
  return isDesktop ? 'scrub' : 'autoplay';
}

/** Scroll progress (0..1) → video time, stopping a hair before the end so the last frame stays painted. */
export function progressToTime(progress, duration) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return clamp01(progress) * Math.max(0, duration - 0.05);
}

/** Normalises `progress` into a sub-range [start, end] of a timeline. */
export function segmentProgress(progress, start, end) {
  return clamp01((progress - start) / (end - start));
}

/** Which of `count` steps is active, after an intro segment that ends at `introEnd`. */
export function stepFromProgress(progress, { count, introEnd = 0 }) {
  const p = segmentProgress(progress, introEnd, 1);
  return Math.min(count - 1, Math.floor(p * count));
}
