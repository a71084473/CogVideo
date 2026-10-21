import { useState } from 'react';
import type { ChallengeDef } from '../data/types';
import { sfx } from '../lib/sfx';
import { MOCKS } from './Mocks';
import { CheckButton, ChallengeProps } from './Shell';

type CompareDef = Extract<ChallengeDef, { type: 'compare' }>;

/** Pick the better design, then say *why* (reasons are part of the score). */
export function CompareChallenge({ c, onSubmit, locked }: { c: CompareDef } & ChallengeProps) {
  const [choice, setChoice] = useState<'a' | 'b' | null>(null);
  const [reasons, setReasons] = useState<number[]>([]);
  const A = MOCKS[c.mockA];
  const B = MOCKS[c.mockB];

  const check = () => {
    const choiceOk = choice === c.correct;
    const wrongPicked = reasons.filter((i) => !c.reasons[i].correct).length;
    const rightPicked = reasons.filter((i) => c.reasons[i].correct).length;
    const ok = choiceOk && wrongPicked === 0 && rightPicked > 0;
    onSubmit(
      ok,
      <>
        {choiceOk ? '設計選對了 ✓' : `比較好的是 ${c.correct.toUpperCase()} 版。`} 原因勾對 {rightPicked} 個{wrongPicked ? `，但多勾了 ${wrongPicked} 個迷思` : ''}。
      </>,
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {(['a', 'b'] as const).map((k) => {
          const M = k === 'a' ? A : B;
          const sel = choice === k;
          const mark = locked ? (c.correct === k ? 'ring-4 ring-[#6FA33F]' : '') : sel ? 'ring-4 ring-sakura' : '';
          return (
            <button
              key={k}
              type="button"
              disabled={locked}
              onClick={() => {
                sfx.tap();
                setChoice(k);
              }}
              aria-pressed={sel}
              aria-label={`選擇 ${k.toUpperCase()} 版`}
              className={`rounded-3xl bg-cream/70 p-1.5 pb-2 transition ${mark}`}
            >
              <M />
              <div className={`font-display mt-1.5 text-center text-lg font-extrabold ${sel ? 'text-[#A9454A]' : ''}`}>
                {k.toUpperCase()} 版 {sel ? '✓' : ''}
              </div>
            </button>
          );
        })}
      </div>
      {choice && (
        <div className="rounded-2xl bg-white/70 p-3">
          <div className="mb-2 text-[14px] font-bold">為什麼？（可複選）</div>
          <div className="flex flex-col gap-1.5">
            {c.reasons.map((r, i) => {
              const on = reasons.includes(i);
              const tone = locked ? (r.correct ? 'bg-mint' : on ? 'bg-[#F5C2B8]' : 'bg-white') : on ? 'bg-butter' : 'bg-white';
              return (
                <button
                  key={r.label}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    sfx.tap();
                    setReasons((x) => (on ? x.filter((y) => y !== i) : [...x, i]));
                  }}
                  aria-pressed={on}
                  className={`min-h-[44px] rounded-xl border-2 border-ink px-3 py-2 text-left text-[14px] font-medium ${tone}`}
                >
                  {on ? '☑' : '☐'} {r.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {!locked && <CheckButton disabled={!choice || reasons.length === 0} onClick={check} />}
    </div>
  );
}
