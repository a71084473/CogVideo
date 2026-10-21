import { useState } from 'react';
import type { ChallengeDef, MockEl } from '../data/types';
import { sfx } from '../lib/sfx';
import { CheckButton, ChallengeProps } from './Shell';

type HotspotDef = Extract<ChallengeDef, { type: 'hotspot' }>;

function El({ el }: { el: MockEl }) {
  switch (el.kind) {
    case 'title':
      return <div className="text-[20px] font-extrabold">{el.label}</div>;
    case 'text':
      return <div className="text-[14px] text-ink/80">{el.label}</div>;
    case 'button':
      return <div className="rounded-xl border-2 border-ink bg-[#DE8A86] py-2.5 text-center text-[15px] font-bold shadow-toy">{el.label}</div>;
    case 'ghost-button':
      return <div className="rounded-xl bg-[#f1eef6] py-2.5 text-center text-[15px] font-bold text-[#c8c2d4]">{el.label}</div>;
    case 'link':
      return <div className="text-center text-[13px] font-bold text-[#3b7dd8] underline">{el.label}</div>;
    case 'input':
      return (
        <div>
          <div className="mb-0.5 text-[12px] font-bold">{el.label}</div>
          <div className="h-9 rounded-lg border-2 border-ink/30 bg-white" />
        </div>
      );
    case 'image':
      return <div className="grid h-20 place-items-center rounded-xl bg-sky/60 text-[24px]">{el.label}</div>;
    case 'chip':
      return <span className="inline-block rounded-full border-2 border-ink bg-butter px-3 py-1 text-[13px] font-bold shadow-toy">{el.label}</span>;
    case 'error':
      return <div className="text-[12px] font-bold text-[#d23b3b]">{el.label}</div>;
    default:
      return <div className="rounded-lg bg-sakura/40 p-2 text-[13px]">{el.label}</div>;
  }
}

/** Tap problem areas on a phone mock. */
export function HotspotChallenge({ c, onSubmit, locked }: { c: HotspotDef } & ChallengeProps) {
  const [sel, setSel] = useState<string[]>([]);
  const need = c.els.filter((e) => e.correct).length;
  const check = () => {
    const right = sel.filter((id) => c.els.find((e) => e.id === id)?.correct).length;
    onSubmit(right === need, `你找到 ${right} / ${need} 個問題。`);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="mx-auto w-full max-w-[300px] rounded-[30px] border-[3px] border-ink bg-white p-2.5 shadow-soft">
        <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-ink/80" />
        <div className="flex flex-col gap-2.5 rounded-[20px] bg-[#FFFBF3] p-3">
          {c.els.map((el) => {
            const on = sel.includes(el.id);
            const ring = locked ? (el.correct ? 'ring-4 ring-[#6FA33F]' : on ? 'ring-4 ring-[#f08080]' : '') : on ? 'ring-4 ring-sakura' : '';
            return (
              <button
                key={el.id}
                type="button"
                disabled={locked}
                aria-pressed={on}
                aria-label={`畫面元素：${el.label}`}
                onClick={() => {
                  sfx.tap();
                  setSel((s) => (on ? s.filter((x) => x !== el.id) : s.length >= need ? s : [...s, el.id]));
                }}
                className={`relative rounded-xl p-1 text-left transition ${ring}`}
              >
                <El el={el} />
                {on && !locked && <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-sakura text-[12px]">🔎</span>}
                {locked && (on || el.correct) && <div className="mt-1 rounded-lg bg-cream p-1.5 text-[12px] leading-relaxed">{el.correct ? '✓ ' : '✗ '}{el.why}</div>}
              </button>
            );
          })}
        </div>
      </div>
      {!locked && (
        <CheckButton disabled={sel.length !== need} onClick={check}>
          {sel.length !== need ? `已標記 ${sel.length} / ${need}` : '送出答案'}
        </CheckButton>
      )}
    </div>
  );
}
