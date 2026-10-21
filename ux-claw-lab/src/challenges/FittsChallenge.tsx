import { motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { buzz, sfx } from '../lib/sfx';
import { CheckButton, ChallengeProps } from './Shell';

interface Trial {
  kind: 'big' | 'small';
  x: number; // % of arena
  y: number;
  size: number;
}

const TRIALS: Trial[] = [
  { kind: 'small', x: 88, y: 8, size: 22 },
  { kind: 'big', x: 50, y: 78, size: 68 },
  { kind: 'small', x: 10, y: 10, size: 22 },
  { kind: 'big', x: 40, y: 80, size: 68 },
  { kind: 'small', x: 86, y: 14, size: 22 },
  { kind: 'big', x: 60, y: 76, size: 68 },
];

/** A real reaction-time experiment: players feel Fitts's Law with their own thumb. */
export function FittsChallenge({ onSubmit, locked }: ChallengeProps) {
  const [i, setI] = useState(-1);
  const [times, setTimes] = useState<{ kind: string; ms: number; misses: number }[]>([]);
  const [answer, setAnswer] = useState<'near' | 'far' | null>(null);
  const shownAt = useRef(0);
  const misses = useRef(0);
  const done = times.length === TRIALS.length;

  const next = () => {
    setI((v) => v + 1);
    shownAt.current = performance.now();
    misses.current = 0;
  };
  const hit = () => {
    const t = TRIALS[i];
    sfx.pop();
    buzz(10);
    setTimes((x) => [...x, { kind: t.kind, ms: performance.now() - shownAt.current, misses: misses.current }]);
    if (i + 1 < TRIALS.length) next();
    else setI(TRIALS.length);
  };

  const avg = useMemo(() => {
    const a = (k: string) => {
      const xs = times.filter((t) => t.kind === k);
      return xs.length ? xs.reduce((s, t) => s + t.ms, 0) / xs.length : 0;
    };
    const m = (k: string) => times.filter((t) => t.kind === k).reduce((s, t) => s + t.misses, 0);
    return { big: a('big'), small: a('small'), missBig: m('big'), missSmall: m('small') };
  }, [times]);
  const max = Math.max(avg.big, avg.small, 1);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative h-[300px] overflow-hidden rounded-3xl border-[3px] border-ink bg-white"
        onPointerDown={(e) => {
          if (i >= 0 && i < TRIALS.length && e.target === e.currentTarget) {
            misses.current += 1;
            sfx.soft();
          }
        }}
      >
        {/* thumb zone hint */}
        <div className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-mint/40" />
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-bold text-ink/50">👍 拇指舒適區</div>
        {i === -1 && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <p className="mb-3 text-[14px]">目標會出現 6 次，有大有小、有近有遠。盡快點到它！</p>
              <CheckButton onClick={next}>開始實驗 ▶</CheckButton>
            </div>
          </div>
        )}
        {i >= 0 && i < TRIALS.length && (
          <motion.button
            key={i}
            type="button"
            aria-label={`目標 ${i + 1}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 20 }}
            onClick={hit}
            className="absolute rounded-full border-2 border-ink bg-[#FF6F9C] shadow-toy"
            style={{ left: `${TRIALS[i].x}%`, top: `${TRIALS[i].y}%`, width: TRIALS[i].size, height: TRIALS[i].size, marginLeft: -TRIALS[i].size / 2, marginTop: -TRIALS[i].size / 2 }}
          />
        )}
        {done && (
          <div className="absolute inset-0 flex flex-col justify-center gap-3 bg-white/90 p-5">
            <div className="text-center text-[14px] font-extrabold">你的實驗結果</div>
            {[
              { k: '大而近', v: avg.big, m: avg.missBig, c: '#B7E8D0' },
              { k: '小而遠', v: avg.small, m: avg.missSmall, c: '#FFA9C5' },
            ].map((r) => (
              <div key={r.k}>
                <div className="flex justify-between text-[13px] font-bold">
                  <span>{r.k}</span>
                  <span>
                    {Math.round(r.v)} ms・失誤 {r.m}
                  </span>
                </div>
                <div className="h-4 rounded-full bg-ink/10">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(r.v / max) * 100}%` }} className="h-full rounded-full border-2 border-ink" style={{ background: r.c }} />
                </div>
              </div>
            ))}
            <p className="text-center text-[12px] text-ink/70">
              {avg.small > avg.big ? `小而遠的目標平均慢了 ${Math.round(avg.small - avg.big)} ms！` : '你的手超快！但多數人點小而遠的目標會更慢、更容易失誤。'}
            </p>
          </div>
        )}
      </div>

      {done && (
        <div className="rounded-2xl bg-white/70 p-3">
          <div className="mb-2 text-[14px] font-bold">應用題：外送 App 的「確認付款」按鈕應該怎麼設計？</div>
          {(
            [
              ['near', '👍 寬大的按鈕，放在畫面下方拇指好按的位置'],
              ['far', '↗️ 精緻的小按鈕，放在右上角跟其他圖示一起'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              disabled={locked}
              aria-pressed={answer === k}
              onClick={() => {
                sfx.tap();
                setAnswer(k);
              }}
              className={`mb-1.5 min-h-[44px] w-full rounded-xl border-2 border-ink px-3 py-2 text-left text-[14px] ${
                locked ? (k === 'near' ? 'bg-mint' : answer === k ? 'bg-[#FFC9C9]' : 'bg-white') : answer === k ? 'bg-butter' : 'bg-white'
              }`}
            >
              {label}
            </button>
          ))}
          {!locked && <CheckButton disabled={!answer} onClick={() => onSubmit(answer === 'near', `大而近 ${Math.round(avg.big)} ms vs 小而遠 ${Math.round(avg.small)} ms。`)} />}
        </div>
      )}
    </div>
  );
}
