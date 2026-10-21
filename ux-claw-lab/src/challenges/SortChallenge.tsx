import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ChallengeDef } from '../data/types';
import { buzz, sfx } from '../lib/sfx';
import { CheckButton, ChallengeProps } from './Shell';

type SortDef = Extract<ChallengeDef, { type: 'sort' }>;

/** Drag (or tap-then-tap) cards into buckets. */
export function SortChallenge({ c, onSubmit, locked }: { c: SortDef } & ChallengeProps) {
  const [place, setPlace] = useState<Record<string, string | null>>(() => Object.fromEntries(c.items.map((i) => [i.id, null])));
  const [picked, setPicked] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const put = (item: string, bucket: string | null) => {
    if (locked) return;
    setPlace((p) => ({ ...p, [item]: bucket }));
    setPicked(null);
    sfx.pop();
    buzz(8);
  };

  const bucketAt = (x: number, y: number) => {
    const el = document.elementsFromPoint(x, y).find((e) => (e as HTMLElement).dataset?.bucket);
    return (el as HTMLElement | undefined)?.dataset.bucket ?? null;
  };

  const check = () => {
    const right = c.items.filter((i) => place[i.id] === i.bucket).length;
    onSubmit(right >= c.items.length - 1, `你放對了 ${right} / ${c.items.length} 張（綠色✓＝正確，紅色＝建議的位置已標示）。`);
  };

  const pool = c.items.filter((i) => !place[i.id]);
  const card = (id: string, label: string) => {
    const item = c.items.find((i) => i.id === id)!;
    const ok = place[id] === item.bucket;
    const target = c.buckets.find((b) => b.id === item.bucket)!;
    return (
      <motion.button
        key={id}
        layout
        layoutId={`card-${id}`}
        type="button"
        drag={!locked}
        dragSnapToOrigin
        dragElastic={0.6}
        whileDrag={{ scale: 1.08, zIndex: 50, rotate: 3 }}
        onDrag={(_, info) => setHover(bucketAt(info.point.x - window.scrollX, info.point.y - window.scrollY))}
        onDragEnd={(_, info) => {
          setHover(null);
          const b = bucketAt(info.point.x - window.scrollX, info.point.y - window.scrollY);
          if (b) put(id, b === '__pool' ? null : b);
        }}
        onClick={() => {
          if (locked) return;
          sfx.tap();
          setPicked((p) => (p === id ? null : id));
        }}
        className={`relative touch-none rounded-xl border-2 border-ink px-2.5 py-2 text-left text-[13px] font-bold leading-snug shadow-toy ${
          picked === id ? 'bg-butter ring-4 ring-sakura' : 'bg-white'
        } ${locked && place[id] ? (ok ? 'bg-mint' : 'bg-[#FFC9C9]') : ''}`}
        aria-pressed={picked === id}
        aria-label={`${label}${picked === id ? '（已選取，點選分類放入）' : ''}`}
      >
        {label}
        {locked && place[id] && <span className="ml-1">{ok ? '✓' : `→ ${target.emoji}${target.label}`}</span>}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        data-bucket="__pool"
        className="flex min-h-[64px] flex-wrap gap-2 rounded-2xl border-2 border-dashed border-ink/30 bg-white/50 p-2"
        aria-label="待分類卡片"
        onClick={() => picked && put(picked, null)}
      >
        {pool.length === 0 ? <span className="m-auto text-[12px] text-ink/50">全部放好了！</span> : pool.map((i) => card(i.id, i.label))}
      </div>
      <p className="text-center text-[12px] text-ink/60">拖曳卡片到分類，或「點卡片 → 點分類」</p>
      <div className={`grid gap-2 ${c.buckets.length > 3 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {c.buckets.map((b) => (
          <div
            key={b.id}
            data-bucket={b.id}
            role="button"
            tabIndex={0}
            aria-label={`分類：${b.label}`}
            onClick={() => picked && put(picked, b.id)}
            onKeyDown={(e) => e.key === 'Enter' && picked && put(picked, b.id)}
            className={`flex min-h-[120px] flex-col gap-1.5 rounded-2xl border-[3px] p-2 transition-colors ${
              hover === b.id || picked ? 'border-ink bg-butter/60' : 'border-ink/60 bg-cream'
            }`}
          >
            <div className="pointer-events-none text-center text-[13px] font-extrabold">
              {b.emoji} {b.label}
            </div>
            {c.items
              .filter((i) => place[i.id] === b.id)
              .map((i) => card(i.id, i.label))}
          </div>
        ))}
      </div>
      {!locked && <CheckButton disabled={pool.length > 0} onClick={check}>{pool.length > 0 ? `還有 ${pool.length} 張卡片` : '送出答案'}</CheckButton>}
    </div>
  );
}
