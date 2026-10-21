import { motion } from 'framer-motion';

const INK = '#3E2A1F';

/** A heap of little potato balls peeking up — yellow on the left, purple-potato on the right. */
export function PotatoPile({ height = 110, className = '' }: { height?: number; className?: string }) {
  const balls: { x: number; y: number; r: number; face: number }[] = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 9; i++) {
      const r = 26 + rnd() * 8;
      balls.push({ x: i * 46 + (row % 2) * 23 - 10 + rnd() * 8, y: 40 + row * 34 + rnd() * 6, r, face: Math.floor(rnd() * 3) });
    }
  }
  return (
    <svg viewBox="0 0 400 130" preserveAspectRatio="xMidYMax slice" width="100%" height={height} className={`pointer-events-none ${className}`} aria-hidden>
      {balls.map((b, i) => {
        const left = b.x < 200;
        const fill = left ? '#FFC94A' : '#B87A80';
        const eye = left ? '#2A1A12' : '#3A1F22';
        return (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={b.r} fill={fill} stroke={INK} strokeWidth="3" />
            <path d={`M${b.x + b.r * 0.2} ${b.y + b.r} A ${b.r} ${b.r} 0 0 0 ${b.x + b.r} ${b.y}`} stroke="rgba(62,42,31,0.15)" strokeWidth={b.r * 0.35} fill="none" />
            <circle cx={b.x - 6} cy={b.y - 4} r="2.4" fill={eye} />
            <circle cx={b.x + 6} cy={b.y - 4} r="2.4" fill={eye} />
            {b.face === 0 && <path d={`M${b.x - 9} ${b.y - 11} h7 M${b.x + 2} ${b.y - 11} h7`} stroke={eye} strokeWidth="2" strokeLinecap="round" />}
            {b.face === 1 ? <path d={`M${b.x - 3} ${b.y + 3} q 1.5 2.5 3 0 q 1.5 2.5 3 0`} stroke={eye} strokeWidth="1.8" fill="none" /> : <path d={`M${b.x - 2.5} ${b.y + 3} h5`} stroke={eye} strokeWidth="1.8" strokeLinecap="round" />}
          </g>
        );
      })}
    </svg>
  );
}

/** HP-style gauge with a heart cap, like a fighting-game health bar. */
export function HeartBar({ value, color = '#FFCE55', label, className = '' }: { value: number; color?: string; label?: string; className?: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className={`relative flex items-center ${className}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)} aria-label={label}>
      <div className="relative h-4 flex-1 overflow-hidden rounded-full border-[3px] border-ink bg-[#FFF4E0]">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        <span className="absolute inset-0 grid place-items-center text-[9px] font-extrabold leading-none text-ink/70">{Math.round(pct * 100)}%</span>
      </div>
      <svg width="26" height="24" viewBox="0 0 26 24" className="-ml-2 shrink-0" aria-hidden>
        <path d="M13 22 L3 12 A5.5 5.5 0 0 1 13 4.5 A5.5 5.5 0 0 1 23 12 Z" fill={pct >= 1 ? '#D6605A' : '#FFF4E0'} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
