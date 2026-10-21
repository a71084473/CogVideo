import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { ToyButton, TopBar, useToast } from '../components/ui';
import { UXI } from '../components/UXI';
import { MOODS, moodById } from '../lib/mood';
import { sfx } from '../lib/sfx';
import { useGame } from '../store/useGame';

export function Daily() {
  const daily = useGame((s) => s.daily);
  const setMood = useGame((s) => s.setMood);
  const ensureToday = useGame((s) => s.ensureToday);
  const openMachine = useGame((s) => s.openMachine);
  const claim = useGame((s) => s.claimDaily);
  useEffect(() => ensureToday(), [ensureToday]);
  const mood = daily.mood ? moodById(daily.mood) : null;
  const steps = [
    { done: !!daily.mood, label: '選擇今天的心情' },
    { done: daily.played, label: '夾一次娃娃' },
    { done: daily.learned, label: '解鎖一個 UX 知識' },
    { done: daily.challenged, label: '完成一個情境小任務' },
    { done: daily.claimed, label: '領取今日獎勵 🪙20' },
  ];
  const canClaim = daily.played && daily.learned && daily.challenged && !daily.claimed;

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#3d3470] via-[#7a63c9] to-[#f2a9c9]">
      <TopBar title="After Work Mode" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28">
        <div className="flex items-center gap-3">
          <UXI size={92} face={mood?.face ?? 'sleepy'} />
          <div className="glass flex-1 rounded-3xl rounded-bl-md p-3 text-[14px] font-bold leading-snug">
            {mood ? mood.plan : '下班了！今天感覺怎麼樣？選一個，我幫你安排 3–5 分鐘的玩法。'}
          </div>
        </div>

        <h2 className="mb-2 mt-4 text-[15px] font-extrabold text-white">今天的心情</h2>
        <div className="grid grid-cols-1 gap-2">
          {MOODS.map((m) => {
            const on = daily.mood === m.id;
            return (
              <motion.button
                key={m.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  sfx.pop();
                  setMood(m.id);
                }}
                aria-pressed={on}
                className={`flex min-h-[52px] items-center gap-3 rounded-2xl border-[3px] px-3 py-2 text-left ${on ? 'border-ink bg-butter' : 'border-transparent bg-white/75'}`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="flex-1 text-[15px] font-extrabold">{m.label}</span>
                {on && <span className="text-[12px] font-bold">✓ 已選擇</span>}
              </motion.button>
            );
          })}
        </div>

        <section className="glass mt-4 rounded-3xl p-4">
          <h2 className="font-display text-lg font-extrabold">今日下班任務・約 3–5 分鐘</h2>
          <ol className="mt-2 flex flex-col gap-1.5">
            {steps.map((s, i) => (
              <li key={s.label} className="flex items-center gap-2 text-[14px]">
                <span className={`grid h-7 w-7 place-items-center rounded-full border-2 border-ink text-[12px] font-bold ${s.done ? 'bg-mint' : 'bg-white'}`}>{s.done ? '✓' : i + 1}</span>
                <span className={s.done ? 'line-through opacity-60' : 'font-bold'}>{s.label}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-col gap-2">
            <AnimatePresence>
              {canClaim && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <ToyButton
                    big
                    color="#FFE49A"
                    className="w-full"
                    onClick={() => {
                      claim();
                      sfx.coin();
                      useToast.getState().show('今日獎勵 +20 金幣！明天見，或想來就來 ☁️', '🪙');
                    }}
                  >
                    領取今日獎勵 🎁
                  </ToyButton>
                </motion.div>
              )}
            </AnimatePresence>
            {!daily.claimed && (
              <ToyButton big color="#FFA9C5" className="w-full" onClick={() => openMachine('all')}>
                {daily.played ? '繼續今天的任務 🕹️' : '開始今天的 3 分鐘 🕹️'}
              </ToyButton>
            )}
            {daily.claimed && <p className="text-center text-[14px] font-bold">今天的任務完成了！好好休息，想玩隨時回來 💤</p>}
          </div>
        </section>
        <p className="mt-3 text-center text-[12px] text-white/90">沒有連續登入懲罰、沒有倒數計時。想來就來，累了就走 ☁️</p>
      </div>
    </div>
  );
}
