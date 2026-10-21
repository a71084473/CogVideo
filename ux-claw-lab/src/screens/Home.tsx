import { motion } from 'framer-motion';
import { PotatoPile } from '../components/Deco';
import { DollAvatar } from '../components/DollAvatar';
import { TopBar } from '../components/ui';
import { UXI } from '../components/UXI';
import { DOLLS } from '../data/dolls';
import { TOPICS } from '../data/topics';
import type { TopicId } from '../data/types';
import { moodById } from '../lib/mood';
import { sfx } from '../lib/sfx';
import { bestOutfit, collectedCount, dueForReview, useGame } from '../store/useGame';
import { BRAND } from './Machine';

function Cabinet({
  color,
  glow,
  title,
  sub,
  dolls,
  onClick,
  big,
  locked,
  badge,
}: {
  color: string;
  glow: string;
  title: string;
  sub: string;
  dolls: string[];
  onClick?: () => void;
  big?: boolean;
  locked?: boolean;
  badge?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => {
        if (locked) return;
        sfx.pop();
        onClick?.();
      }}
      whileTap={locked ? undefined : { scale: 0.95 }}
      whileHover={locked ? undefined : { y: -4 }}
      aria-label={`${title}${locked ? '（補貨中）' : ''}`}
      aria-disabled={locked}
      className={`relative flex flex-col rounded-[26px] border-[3px] border-ink p-2 text-left shadow-soft ${big ? 'w-full' : 'w-[150px] shrink-0'} ${locked ? 'opacity-70' : ''}`}
      style={{ background: color }}
    >
      {badge && <span className="absolute -right-2 -top-2 z-10 rotate-6 rounded-full border-2 border-ink bg-white px-2 py-0.5 text-[10px] font-extrabold">{badge}</span>}
      <div className="rounded-xl bg-ink px-2 py-1 text-center">
        <span className={`font-display font-extrabold text-white ${big ? 'text-lg' : 'text-[13px]'} neon`}>{big ? 'UX CLAW LAB' : title}</span>
      </div>
      <div
        className={`relative mt-1.5 overflow-hidden rounded-xl border-[3px] border-ink ${big ? 'h-[150px]' : 'h-[96px]'}`}
        style={{ background: `linear-gradient(180deg, #B5676B 0%, ${glow} 140%)` }}
      >
        <div className="absolute left-1/2 top-0 h-6 w-0.5 bg-ink/60" />
        <div className="absolute left-1/2 top-5 h-4 w-6 -translate-x-1/2 rounded-md border-2 border-ink bg-butter" />
        <div className="absolute inset-x-1 bottom-0 flex items-end justify-center">
          {locked ? (
            <div className="mb-6 text-center text-[11px] font-bold text-white">🔒 補貨中</div>
          ) : (
            dolls.slice(0, big ? 5 : 3).map((d, i) => (
              <div key={d + i} style={{ marginLeft: i ? (big ? -14 : -18) : 0, transform: `translateY(${(i % 2) * 6}px)` }}>
                <DollAvatar id={d} size={big ? 72 : 52} />
              </div>
            ))
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
      </div>
      <div className="mt-1.5 px-1">
        {big && <div className="font-display text-lg font-extrabold">{title}</div>}
        <div className={`font-bold text-ink/80 ${big ? 'text-[13px]' : 'text-[11px] leading-tight'}`}>{sub}</div>
      </div>
      {big && (
        <div className="mt-2 flex items-center justify-between rounded-2xl bg-white/70 px-3 py-2">
          <span className="text-[13px] font-bold">12 隻 UX 知識娃娃等你帶回家</span>
          <span className="font-display rounded-full bg-[#C75B5F] px-3 py-1 text-sm font-extrabold text-white">PLAY ▶</span>
        </div>
      )}
    </motion.button>
  );
}

export function Home() {
  const openMachine = useGame((s) => s.openMachine);
  const go = useGame((s) => s.go);
  const dolls = useGame((s) => s.dolls);
  const daily = useGame((s) => s.daily);
  const mood = daily.mood ? moodById(daily.mood) : null;
  const due = dueForReview(dolls);
  const count = collectedCount(dolls);
  const hour = new Date().getHours();
  const greet = mood
    ? `${mood.emoji} ${mood.label}？${mood.plan.split('。')[0]}。`
    : hour >= 17 || hour < 4
      ? '下班辛苦了…要不要夾一隻娃娃再走？'
      : '嗨～今天想夾哪一台？';

  const topicDolls = (id: TopicId) => DOLLS.filter((d) => d.topic === id).map((d) => d.id);

  return (
    <div className="arcade-bg flex h-full flex-col">
      <TopBar />
      <div className="no-scrollbar flex-1 overflow-y-auto pb-28">
        {/* hero */}
        <div className="px-4">
          <h1 className="font-display text-center text-[34px] font-extrabold leading-none text-[#FFCE55] title-outline drop-shadow-[0_3px_0_#3E2A1F]">UX CLAW LAB</h1>
          <p className="font-display title-outline mt-1 text-center text-[16px] tracking-[0.2em] text-white">UX 夾娃娃研究所</p>
          <div className="mt-3 flex items-end gap-2">
            <UXI size={86} face={mood?.face ?? 'meh'} outfit={bestOutfit(dolls)} />
            <motion.button
              type="button"
              onClick={() => go('daily')}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mb-6 ml-2 flex-1 rounded-[22px] border-[3px] border-ink bg-cream p-3 text-left text-[14px] font-bold leading-snug shadow-toy"
            >
              <span aria-hidden className="absolute -left-[14px] bottom-1 h-3.5 w-3.5 rounded-full border-[3px] border-ink bg-cream" />
              <span aria-hidden className="absolute -left-[24px] -bottom-2 h-2.5 w-2.5 rounded-full border-[2.5px] border-ink bg-cream" />
              {greet}
              <span className="mt-1 block text-[12px] text-[#A9454A]">{mood ? '查看今日下班任務 ›' : '選擇今天的心情 ›'}</span>
            </motion.button>
          </div>
        </div>

        {due.length > 0 && (
          <button type="button" onClick={() => go('collection')} className="glass mx-4 mb-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl p-2.5 text-left">
            <div className="flex -space-x-4">
              {due.slice(0, 3).map((p) => (
                <DollAvatar key={p.dollId} id={p.dollId} size={40} level={p.level} face="sad" />
              ))}
            </div>
            <div className="flex-1 text-[13px] font-bold">有 {due.length} 隻娃娃想你了，複習一下讓它升級吧！</div>
            <span className="text-lg">›</span>
          </button>
        )}

        <div className="px-4">
          <Cabinet big color="#E9A29B" glow="#FFCE55" title="UX 綜合夾娃娃機" sub={`已收集 ${count} / ${DOLLS.length}・每次都能學到一個 UX 概念`} dolls={DOLLS.map((d) => d.id).slice(0, 5)} onClick={() => openMachine('all')} />
        </div>

        <h2 className="font-display mb-2 mt-5 px-4 text-lg font-extrabold text-white title-outline">主題機台</h2>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-3 pt-2">
          {TOPICS.map((t) => {
            const ids = topicDolls(t.id);
            const got = ids.filter((id) => (dolls[id]?.level ?? 0) > 0).length;
            return (
              <Cabinet
                key={t.id}
                color={t.color}
                glow={t.glow}
                title={`${t.emoji} ${t.en}`}
                sub={ids.length ? `${t.zh}・${got}/${ids.length}` : t.zh}
                dolls={ids.length ? ids.concat(DOLLS.filter((d) => d.topic !== t.id).map((d) => d.id)) : []}
                locked={ids.length === 0}
                onClick={() => openMachine(t.id)}
              />
            );
          })}
        </div>

        <h2 className="font-display mb-2 mt-3 px-4 text-lg font-extrabold text-white title-outline">期間限定</h2>
        <div className="px-4">
          <Cabinet
            big
            color="#d9a77f"
            glow="#ffcf9a"
            title={`☕ ${BRAND.machine}`}
            sub={`贊助內容｜${BRAND.name} 示範品牌機台。完成挑戰可自由選擇是否領取優惠。`}
            dolls={['empathy', 'cogload', 'hick', 'journey', 'usability']}
            badge="贊助 AD"
            onClick={() => openMachine('brand')}
          />
        </div>
        <PotatoPile height={120} className="mt-4" />
      </div>
    </div>
  );
}
