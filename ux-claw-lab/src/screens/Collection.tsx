import { motion } from 'framer-motion';
import { useState } from 'react';
import { DollAvatar } from '../components/DollAvatar';
import { LEVEL_NAMES, LevelPips, Sheet, ToyButton, TopBar, useToast } from '../components/ui';
import { UXI } from '../components/UXI';
import { DOLLS, dollById } from '../data/dolls';
import { topicById } from '../data/topics';
import { shareDollCard } from '../lib/share';
import { OUTFITS, collectedCount, useGame } from '../store/useGame';

export function Collection() {
  const dolls = useGame((s) => s.dolls);
  const [open, setOpen] = useState<string | null>(null);
  const count = collectedCount(dolls);
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#A9D9F8] to-cream">
      <TopBar title="UX 娃娃圖鑑" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28">
        <div className="glass mb-3 flex items-center gap-3 rounded-3xl p-3">
          <div className="font-display text-3xl font-extrabold">
            {count}
            <span className="text-lg text-ink/50">/{DOLLS.length}</span>
          </div>
          <div className="flex-1">
            <div className="h-3 overflow-hidden rounded-full border-2 border-ink bg-white">
              <motion.div className="h-full bg-sakura" initial={{ width: 0 }} animate={{ width: `${(count / DOLLS.length) * 100}%` }} />
            </div>
            <div className="mt-1 text-[12px] font-bold text-ink/70">點娃娃看知識、複習升級、放進展示櫃</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {DOLLS.map((d, i) => {
            const p = dolls[d.id];
            const lv = p?.level ?? 0;
            const due = lv > 0 && (p!.nextReview <= Date.now() || !p!.lastChallengeOk);
            return (
              <motion.button
                key={d.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setOpen(d.id)}
                className={`relative flex flex-col items-center rounded-3xl border-[3px] border-ink p-1.5 ${lv ? 'bg-white' : 'bg-white/50'}`}
                aria-label={lv ? `${d.zh}，${LEVEL_NAMES[lv]}` : `未收集：${topicById(d.topic).zh}`}
              >
                {due && <span className="absolute right-1 top-1 rounded-full bg-sky px-1.5 text-[10px] font-bold">複習</span>}
                <DollAvatar id={d.id} size={78} level={lv} silhouette={!lv} />
                <div className="mt-0.5 text-[13px] font-extrabold">{lv ? d.zh : '？？？'}</div>
                <div className="text-[10px] font-bold text-ink/60">{lv ? d.en : topicById(d.topic).zh}</div>
                {lv > 0 && <LevelPips level={lv} />}
              </motion.button>
            );
          })}
        </div>

        <h2 className="font-display mb-2 mt-5 text-lg font-extrabold">UXI 的衣櫃</h2>
        <p className="mb-2 text-[12px] text-ink/70">造型只會因為「真的學會」而解鎖，不是靠玩很多次。</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {OUTFITS.map((o) => {
            const ok = o.test(dolls);
            return (
              <div key={o.id} className={`flex w-[104px] shrink-0 flex-col items-center rounded-3xl border-[3px] border-ink p-2 text-center ${ok ? 'bg-white' : 'bg-white/40'}`}>
                <div className={ok ? '' : 'opacity-40 grayscale'}>
                  <UXI size={64} outfit={o.id} face={ok ? 'happy' : 'sleepy'} bob={false} />
                </div>
                <div className="text-[12px] font-extrabold">{o.label}</div>
                <div className="text-[10px] text-ink/60">{ok ? '已解鎖' : o.need}</div>
              </div>
            );
          })}
        </div>
      </div>
      <DollSheet id={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function DollSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const def = id ? dollById(id) : null;
  const p = useGame((s) => (id ? s.dolls[id] : undefined));
  const startReview = useGame((s) => s.startReview);
  const setShelf = useGame((s) => s.setShelf);
  const shelf = useGame((s) => s.room.shelf);
  const openMachine = useGame((s) => s.openMachine);
  const lv = p?.level ?? 0;
  return (
    <Sheet open={!!def} onClose={onClose} title={def ? (lv ? `${def.dollName}・${def.zh}` : '尚未收集的娃娃') : ''}>
      {def && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-3xl border-2 border-ink bg-white p-1">
              <DollAvatar id={def.id} size={96} level={lv} silhouette={!lv} animate={!!lv} />
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-bold text-ink/60">
                {topicById(def.topic).emoji} {topicById(def.topic).zh}・{def.rarity === 'legendary' ? '★★★ 傳說' : def.rarity === 'rare' ? '★★ 稀有' : '★ 一般'}
              </div>
              {lv ? (
                <>
                  <div className="font-display text-xl font-extrabold">{def.en}</div>
                  <div className="flex items-center gap-2 text-[13px] font-bold">
                    <LevelPips level={lv} /> {LEVEL_NAMES[lv]}
                  </div>
                </>
              ) : (
                <p className="text-[14px] font-bold">去「{topicById(def.topic).zh}」或綜合機台把它夾回來吧！</p>
              )}
            </div>
          </div>
          {lv > 0 && p && (
            <>
              <div className="rounded-2xl bg-white p-3 text-[14px] leading-relaxed">
                <b>💡 </b>
                {def.oneLiner}
                <div className="mt-2 text-[13px] text-ink/75">
                  <b>💼 </b>
                  {def.atWork}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="生活辨識" v={`${p.spotOk}/${p.spotTries}`} />
                <Stat label="情境挑戰" v={`${p.chOk}/${p.chTries}`} />
                <Stat label="下次複習" v={p.nextReview <= Date.now() ? '現在！' : `${Math.max(1, Math.round((p.nextReview - Date.now()) / 3_600_000))} 小時後`} />
              </div>
              <div className="text-[12px] text-ink/70">
                {lv < 3 ? '升級方式：' + (lv < 2 ? '答對生活案例任務 → Lv2；' : '') + '通過情境挑戰 → Lv3。' : '已達 Lv3！定期複習可以保持熟練。'}
              </div>
              <div className="flex gap-2">
                <ToyButton
                  color="#FFA9C5"
                  className="flex-1"
                  onClick={() => {
                    onClose();
                    startReview(def.id);
                  }}
                >
                  {lv < 3 ? '複習升級 🎯' : '再挑戰一次'}
                </ToyButton>
                <ToyButton color="#A9D9F8" className="flex-1" onClick={() => void shareDollCard(def, lv)}>
                  分享 📤
                </ToyButton>
              </div>
              <div>
                <div className="mb-1 text-[13px] font-bold">放進展示櫃：</div>
                <div className="grid grid-cols-6 gap-1.5">
                  {shelf.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`展示櫃第 ${i + 1} 格${s ? `（目前：${dollById(s)?.zh}）` : ''}`}
                      onClick={() => {
                        setShelf(i, def.id);
                        useToast.getState().show(`${def.dollName} 已放進展示櫃第 ${i + 1} 格`, '🛋️');
                      }}
                      className={`grid h-11 place-items-center rounded-xl border-2 border-ink text-[12px] font-bold ${s === def.id ? 'bg-butter' : 'bg-white'}`}
                    >
                      {s === def.id ? '★' : i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {!lv && (
            <ToyButton
              color="#FFE49A"
              onClick={() => {
                onClose();
                openMachine(def.topic);
              }}
            >
              前往 {topicById(def.topic).zh} 機台 🕹️
            </ToyButton>
          )}
        </div>
      )}
    </Sheet>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-2xl bg-white p-2">
      <div className="font-display text-lg font-extrabold">{v}</div>
      <div className="text-[11px] font-bold text-ink/60">{label}</div>
    </div>
  );
}
