import { useGame } from '../store/useGame';

/** Tiny synthesized sound kit (no audio files needed). */
let ctx: AudioContext | null = null;
const ac = () => {
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.25, slideTo?: number, delay = 0) {
  const v = useGame.getState().settings.sfx;
  if (v <= 0) return;
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol * v, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  tap: () => tone(660, 0.07, 'triangle', 0.18),
  pop: () => tone(520, 0.12, 'sine', 0.22, 880),
  drop: () => tone(420, 0.5, 'triangle', 0.12, 180),
  grab: () => {
    tone(300, 0.08, 'square', 0.08);
    tone(240, 0.1, 'square', 0.06, undefined, 0.07);
  },
  bump: () => tone(140, 0.1, 'sine', 0.25, 90),
  slip: () => tone(500, 0.35, 'sawtooth', 0.06, 160),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.2, undefined, i * 0.09)),
  rare: () => [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.22, 'sine', 0.18, undefined, i * 0.07)),
  good: () => [660, 990].forEach((f, i) => tone(f, 0.14, 'triangle', 0.2, undefined, i * 0.08)),
  soft: () => tone(330, 0.2, 'sine', 0.15, 260),
  coin: () => [988, 1319].forEach((f, i) => tone(f, 0.09, 'square', 0.07, undefined, i * 0.06)),
};

export function buzz(pattern: number | number[]) {
  if (!useGame.getState().settings.haptics) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
