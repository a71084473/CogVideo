import { useState } from 'react';
import type { ChallengeDef } from '../data/types';
import { sfx } from '../lib/sfx';
import { CheckButton, ChallengeProps } from './Shell';

type QuotesDef = Extract<ChallengeDef, { type: 'quotes' }>;

/** Read interview snippets and tap the lines that reveal real pain points. */
export function QuotesChallenge({ c, onSubmit, locked }: { c: QuotesDef } & ChallengeProps) {
  const [sel, setSel] = useState<string[]>([]);
  const all = c.people.flatMap((p) => p.lines);
  const check = () => {
    const right = sel.filter((id) => all.find((l) => l.id === id)?.pain).length;
    onSubmit(right === c.need, `你找到 ${right} / ${c.need} 個真正的痛點。`);
  };
  return (
    <div className="flex flex-col gap-3">
      {c.people.map((p) => (
        <div key={p.name} className="rounded-2xl bg-white/70 p-3">
          <div className="mb-2 flex items-center gap-2 text-[14px] font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-sky text-xl">{p.avatar}</span>
            {p.name}
          </div>
          <div className="flex flex-col gap-1.5">
            {p.lines.map((l) => {
              const on = sel.includes(l.id);
              const tone = locked ? (l.pain ? 'bg-mint' : on ? 'bg-[#F5C2B8]' : 'bg-cream') : on ? 'bg-butter' : 'bg-cream';
              return (
                <button
                  key={l.id}
                  type="button"
                  disabled={locked}
                  aria-pressed={on}
                  onClick={() => {
                    sfx.tap();
                    setSel((s) => (on ? s.filter((x) => x !== l.id) : s.length >= c.need ? s : [...s, l.id]));
                  }}
                  className={`relative min-h-[44px] rounded-2xl rounded-tl-sm border-2 border-ink px-3 py-2 text-left text-[14px] leading-relaxed ${tone}`}
                >
                  「{l.text}」{on && !locked && <span className="ml-1">📌</span>}
                  {locked && (on || l.pain) && <div className="mt-1 text-[12px] text-ink/75">{l.pain ? '✓ 痛點：' : '✗ '}{l.why}</div>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!locked && (
        <CheckButton disabled={sel.length !== c.need} onClick={check}>
          {sel.length !== c.need ? `已標記 ${sel.length} / ${c.need}` : '送出答案'}
        </CheckButton>
      )}
    </div>
  );
}
