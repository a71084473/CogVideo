import { motion } from 'framer-motion';
import { DollAvatar } from '../components/DollAvatar';
import { ToyButton, TopBar } from '../components/ui';
import { DOLLS, dollById } from '../data/dolls';
import { TOPICS } from '../data/topics';
import { dueForReview, today, useGame } from '../store/useGame';

const DAY = 86_400_000;

export function Progress() {
  const dolls = useGame((s) => s.dolls);
  const attempts = useGame((s) => s.attempts);
  const startReview = useGame((s) => s.startReview);
  const vals = Object.values(dolls).filter((p) => p.level > 0);
  const understood = vals.filter((p) => p.level >= 2).length;
  const applied = vals.filter((p) => p.level >= 3);
  const ch = attempts.filter((a) => a.kind === 'challenge');
  const sp = attempts.filter((a) => a.kind === 'spot');
  const rate = (xs: typeof attempts) => (xs.length ? Math.round((xs.filter((a) => a.ok).length / xs.length) * 100) : 0);
  const due = dueForReview(dolls);

  const week = Array.from({ length: 7 }).map((_, i) => {
    const t = Date.now() - (6 - i) * DAY;
    const key = today(t);
    const day = attempts.filter((a) => today(a.at) === key);
    return { key, label: ['日', '一', '二', '三', '四', '五', '六'][new Date(t).getDay()], ok: day.filter((a) => a.ok).length, all: day.length };
  });
  const maxDay = Math.max(1, ...week.map((w) => w.all));

  const topics = TOPICS.map((t) => {
    const ds = DOLLS.filter((d) => d.topic === t.id);
    const pts = ds.reduce((s, d) => s + (dolls[d.id]?.level ?? 0), 0);
    return { t, total: ds.length, pct: ds.length ? pts / (ds.length * 3) : 0 };
  }).filter((x) => x.total > 0);

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#B7E8D0] to-cream">
      <TopBar title="UX 學習進度" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28">
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi big={`${understood}`} unit={`/ ${DOLLS.length}`} label="已理解的 UX 概念" sub="Lv2 以上：能在生活中認出" />
          <Kpi big={`${applied.length}`} unit={`/ ${DOLLS.length}`} label="能實際應用" sub="Lv3：通過情境挑戰" />
          <Kpi big={`${rate(ch)}%`} label="情境任務正確率" sub={`共 ${ch.length} 次挑戰`} />
          <Kpi big={`${rate(sp)}%`} label="生活辨識正確率" sub={`共 ${sp.length} 次作答`} />
        </div>

        <Card title="📅 本週學習">
          <div className="flex h-28 items-end justify-between gap-1.5" role="img" aria-label={`本週每日作答：${week.map((w) => `${w.label} ${w.ok}/${w.all}`).join('，')}`}>
            {week.map((w) => (
              <div key={w.key} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative flex h-20 w-full items-end">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(w.all / maxDay) * 100}%` }} className="flex w-full flex-col justify-end overflow-hidden rounded-t-lg border-2 border-ink bg-sky">
                    <div className="w-full bg-[#7fcfa6]" style={{ height: `${w.all ? (w.ok / w.all) * 100 : 0}%` }} />
                  </motion.div>
                </div>
                <span className="text-[11px] font-bold">{w.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3 text-[11px] font-bold text-ink/70">
            <span>🟩 答對</span>
            <span>🟦 作答次數</span>
          </div>
        </Card>

        <Card title="🗂️ 知識分類掌握度">
          {topics.map(({ t, pct }) => (
            <div key={t.id} className="mb-2">
              <div className="flex justify-between text-[13px] font-bold">
                <span>
                  {t.emoji} {t.zh}
                </span>
                <span>{Math.round(pct * 100)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border-2 border-ink bg-white">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} className="h-full" style={{ background: t.color }} />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-ink/60">掌握度＝該分類娃娃等級總和 ÷ 滿級。等級完全由答題表現決定。</p>
        </Card>

        <Card title="🔁 需要複習的主題">
          {due.length === 0 ? (
            <p className="text-[13px]">目前沒有到期的複習 🎉 間隔複習會在適當的時間提醒你。</p>
          ) : (
            due.map((p) => {
              const d = dollById(p.dollId)!;
              return (
                <div key={p.dollId} className="mb-2 flex items-center gap-2 rounded-2xl bg-white p-2">
                  <DollAvatar id={d.id} size={44} level={p.level} />
                  <div className="flex-1">
                    <div className="text-[14px] font-extrabold">{d.zh}</div>
                    <div className="text-[11px] text-ink/60">{!p.lastChallengeOk ? '情境挑戰尚未通過' : '已到複習時間（間隔複習）'}</div>
                  </div>
                  <ToyButton color="#FFE49A" onClick={() => startReview(d.id)}>
                    複習
                  </ToyButton>
                </div>
              );
            })
          )}
        </Card>

        <Card title="🛠️ 已具備的 UX 應用技能">
          {applied.length === 0 ? (
            <p className="text-[13px]">通過任一個情境挑戰，這裡就會出現你能在工作中使用的技能。</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {applied.map((p) => {
                const d = dollById(p.dollId)!;
                return (
                  <li key={d.id} className="rounded-2xl bg-white p-2.5 text-[13px] leading-relaxed">
                    <b>
                      {d.mark} {d.zh}：
                    </b>
                    {d.atWork}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Kpi({ big, unit, label, sub }: { big: string; unit?: string; label: string; sub: string }) {
  return (
    <div className="glass rounded-3xl p-3">
      <div className="font-display text-3xl font-extrabold leading-none">
        {big}
        {unit && <span className="text-base text-ink/50"> {unit}</span>}
      </div>
      <div className="mt-1 text-[13px] font-extrabold">{label}</div>
      <div className="text-[11px] text-ink/60">{sub}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass mt-3 rounded-3xl p-3.5">
      <h2 className="mb-2 text-[15px] font-extrabold">{title}</h2>
      {children}
    </section>
  );
}
