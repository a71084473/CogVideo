import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { ABTestChallenge } from '../challenges/ABTestChallenge';
import { CompareChallenge } from '../challenges/CompareChallenge';
import { ContrastChallenge } from '../challenges/ContrastChallenge';
import { FittsChallenge } from '../challenges/FittsChallenge';
import { HotspotChallenge } from '../challenges/HotspotChallenge';
import { QuotesChallenge } from '../challenges/QuotesChallenge';
import { Shell } from '../challenges/Shell';
import { SortChallenge } from '../challenges/SortChallenge';
import { DollAvatar } from '../components/DollAvatar';
import { LEVEL_NAMES, LevelPips, ToyButton, TopBar, useToast } from '../components/ui';
import { UXI } from '../components/UXI';
import { dollById } from '../data/dolls';
import { topicById } from '../data/topics';
import type { DollDef } from '../data/types';
import { moodById } from '../lib/mood';
import { shareDollCard } from '../lib/share';
import { buzz, sfx } from '../lib/sfx';
import { useGame } from '../store/useGame';
import { BRAND } from './Machine';

type Stage = 'card' | 'challenge' | 'result';

export function Learn() {
  const learn = useGame((s) => s.learn)!;
  const def = dollById(learn.dollId)!;
  const progress = useGame((s) => s.dolls[learn.dollId]);
  const mood = moodById(useGame((s) => s.daily.mood));
  const [stage, setStage] = useState<Stage>('card');
  const [startLevel] = useState(progress?.level ?? 0);
  const [spotResult, setSpotResult] = useState<boolean | null>(null);
  const [chResult, setChResult] = useState<boolean | null>(null);
  const endLearn = useGame((s) => s.endLearn);

  return (
    <div className="relative flex h-full flex-col potato-bg">
      <TopBar title={stage === 'card' ? 'UX 知識卡' : stage === 'challenge' ? '情境挑戰' : '學習成果'} onBack={endLearn} />
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {stage === 'card' && (
            <motion.div key="card" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }}>
              <KnowledgeCard
                def={def}
                brief={mood.brief}
                isReview={learn.isReview}
                answered={spotResult}
                onAnswer={(ok) => {
                  setSpotResult(ok);
                  useGame.getState().answerSpot(ok);
                }}
                onNext={() => setStage('challenge')}
                onSkip={mood.challengeOptional ? () => setStage('result') : undefined}
              />
            </motion.div>
          )}
          {stage === 'challenge' && (
            <motion.div key="ch" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}>
              <ChallengeRunner
                def={def}
                onFirstResult={(ok) => {
                  setChResult(ok);
                  useGame.getState().finishChallenge(ok);
                }}
                onDone={() => setStage('result')}
              />
            </motion.div>
          )}
          {stage === 'result' && (
            <motion.div key="res" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Result def={def} startLevel={startLevel} spot={spotResult} ch={chResult} brand={learn.brand} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function KnowledgeCard({
  def,
  brief,
  isReview,
  answered,
  onAnswer,
  onNext,
  onSkip,
}: {
  def: DollDef;
  brief: boolean;
  isReview: boolean;
  answered: boolean | null;
  onAnswer: (ok: boolean) => void;
  onNext: () => void;
  onSkip?: () => void;
}) {
  const [pick, setPick] = useState<number | null>(null);
  const [showCase, setShowCase] = useState(!brief);
  const topic = topicById(def.topic);
  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-[32px] border-[3px] border-ink bg-cream p-4 shadow-soft">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60" style={{ background: def.color }} />
        <div className="relative flex items-center gap-3">
          <div className="rounded-3xl border-2 border-ink bg-white/80 p-1">
            <DollAvatar id={def.id} size={92} level={1} animate />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-bold text-ink/60">
              {topic.emoji} {topic.zh}
              {isReview && <span className="ml-1 rounded-full bg-sky px-1.5">複習</span>}
            </div>
            <h2 className="font-display text-2xl font-extrabold leading-tight">{def.en}</h2>
            <div className="text-lg font-bold">｜{def.zh}</div>
          </div>
        </div>
        <Section icon="💡" label="一句話理解">
          <p className="text-[17px] font-bold leading-relaxed">{def.oneLiner}</p>
        </Section>
        {showCase ? (
          <>
            <Section icon="🏙️" label="生活案例">
              <p className="text-[15px] leading-relaxed">{def.example}</p>
            </Section>
            <Section icon="💼" label="明天上班就能用">
              <p className="text-[15px] leading-relaxed">{def.atWork}</p>
            </Section>
          </>
        ) : (
          <button type="button" onClick={() => setShowCase(true)} className="relative mt-3 min-h-[44px] w-full rounded-2xl border-2 border-dashed border-ink/40 text-[14px] font-bold text-ink/70">
            ＋ 看生活案例（精簡模式已收起）
          </button>
        )}
      </div>

      <div className="rounded-[28px] border-[3px] border-ink bg-white/80 p-4">
        <div className="text-[12px] font-bold text-ink/60">🎯 互動任務</div>
        <p className="mb-2 text-[16px] font-bold leading-snug">{def.spot.prompt}</p>
        <div className="flex flex-col gap-2">
          {def.spot.options.map((o, i) => {
            const chosen = pick === i;
            const show = pick !== null;
            const tone = show ? (o.correct ? 'bg-mint' : chosen ? 'bg-[#F5C2B8]' : 'bg-white opacity-70') : 'bg-white';
            return (
              <motion.button
                key={o.label}
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={show}
                onClick={() => {
                  setPick(i);
                  if (answered === null) onAnswer(o.correct);
                  if (o.correct) {
                    sfx.good();
                    buzz(20);
                  } else sfx.soft();
                }}
                className={`min-h-[48px] rounded-2xl border-2 border-ink px-3 py-2.5 text-left text-[15px] leading-snug ${tone}`}
              >
                {o.label}
                {show && (chosen || o.correct) && <div className="mt-1 text-[13px] text-ink/75">{o.why}</div>}
              </motion.button>
            );
          })}
        </div>
        {pick !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-2">
            <UXI size={52} face={def.spot.options[pick].correct ? 'happy' : 'meh'} bob={false} />
            <p className="flex-1 text-[13px] font-bold">{def.spot.options[pick].correct ? '答對！你已經能在生活中認出它了 ✨' : '沒關係～正確答案已標成綠色，記住它就好！'}</p>
          </motion.div>
        )}
      </div>

      {pick !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
          <ToyButton big color="#E9A29B" className="w-full" onClick={onNext}>
            進入情境挑戰 🎮
          </ToyButton>
          {onSkip && (
            <button type="button" onClick={onSkip} className="min-h-[44px] text-[14px] font-bold text-ink/60 underline">
              今天先不挑戰，直接收下娃娃
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

function Section({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
  return (
    <div className="relative mt-3 rounded-2xl bg-white/70 p-3">
      <div className="mb-1 text-[12px] font-extrabold text-ink/60">
        {icon} {label}
      </div>
      {children}
    </div>
  );
}

function ChallengeRunner({ def, onFirstResult, onDone }: { def: DollDef; onFirstResult: (ok: boolean) => void; onDone: () => void }) {
  const [verdict, setVerdict] = useState<{ ok: boolean; detail?: ReactNode } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const c = def.challenge;
  const submit = (ok: boolean, detail?: ReactNode) => {
    setVerdict({ ok, detail });
    if (ok) {
      sfx.win();
      buzz([20, 30, 40]);
    } else sfx.soft();
    if (!recorded) {
      setRecorded(true);
      onFirstResult(ok);
    } else if (ok) {
      useToast.getState().show('練習成功！下次複習時答對就能升級', '💪');
    }
  };
  const props = { onSubmit: submit, locked: !!verdict };
  let body: ReactNode = null;
  switch (c.type) {
    case 'sort':
      body = <SortChallenge key={attempt} c={c} {...props} />;
      break;
    case 'compare':
      body = <CompareChallenge key={attempt} c={c} {...props} />;
      break;
    case 'quotes':
      body = <QuotesChallenge key={attempt} c={c} {...props} />;
      break;
    case 'hotspot':
      body = <HotspotChallenge key={attempt} c={c} {...props} />;
      break;
    case 'contrast':
      body = <ContrastChallenge key={attempt} {...props} />;
      break;
    case 'fitts':
      body = <FittsChallenge key={attempt} {...props} />;
      break;
    case 'abtest':
      body = <ABTestChallenge key={attempt} {...props} />;
      break;
  }
  return (
    <Shell
      title={c.title}
      prompt={c.prompt}
      verdict={verdict}
      explain={c.explain}
      onContinue={onDone}
      onRetry={() => {
        setVerdict(null);
        setAttempt((a) => a + 1);
      }}
    >
      {body}
    </Shell>
  );
}

function Result({ def, startLevel, spot, ch, brand }: { def: DollDef; startLevel: number; spot: boolean | null; ch: boolean | null; brand?: string }) {
  const p = useGame((s) => s.dolls[def.id]);
  const endLearn = useGame((s) => s.endLearn);
  const go = useGame((s) => s.go);
  const claimCoupon = useGame((s) => s.claimCoupon);
  const [couponDone, setCouponDone] = useState<null | 'yes' | 'no'>(null);
  const level = p?.level ?? 1;
  const up = level > startLevel;
  return (
    <div className="flex flex-col items-center gap-3 pt-2 text-center">
      <div className="relative">
        {up && (
          <motion.div className="font-display absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#C75B5F] px-3 py-1 text-sm font-extrabold text-white" initial={{ y: 10, scale: 0 }} animate={{ y: 0, scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
            LEVEL UP！
          </motion.div>
        )}
        <div className="rounded-[36px] border-[3px] border-ink bg-cream p-3 shadow-soft">
          <DollAvatar id={def.id} size={150} level={level} face="happy" animate />
        </div>
      </div>
      <div>
        <h2 className="font-display text-2xl font-extrabold">{def.dollName}・{def.zh}</h2>
        <div className="mt-1 flex items-center justify-center gap-2 text-[15px] font-bold">
          <LevelPips level={level} /> {LEVEL_NAMES[level]}
        </div>
      </div>
      <div className="w-full rounded-3xl border-[3px] border-ink bg-white/80 p-4 text-left">
        <Row ok={true} label="Lv1 認識" text="讀完知識卡，娃娃加入圖鑑" />
        <Row ok={!!p && p.spotOk > 0} label="Lv2 理解" text={spot === null ? '在生活案例中認出它' : spot ? '這次在生活案例中認出它了' : '這次還沒認出來，下次再試'} />
        <Row ok={level >= 3} label="Lv3 應用" text={ch === null ? '完成情境挑戰即可解鎖' : ch ? '成功在產品情境中應用！' : '情境挑戰還差一點，複習時再來'} />
        <div className="mt-3 rounded-2xl bg-butter/70 p-3 text-[14px] leading-relaxed">
          <b>🧠 帶走這一句：</b>
          {def.oneLiner}
        </div>
      </div>

      {brand && couponDone === null && (
        <div className="w-full rounded-3xl border-2 border-dashed border-ink bg-[#fff1e3] p-3 text-left">
          <div className="text-[11px] font-bold text-ink/60">贊助內容・由 {brand} 提供（可自由選擇）</div>
          <p className="mt-1 text-[14px] font-bold">要順便領一張「{BRAND.coupon}」嗎？</p>
          <div className="mt-2 flex gap-2">
            <ToyButton
              color="#FFCE55"
              className="flex-1"
              onClick={() => {
                claimCoupon({ brand, title: BRAND.coupon, code: `MELLOW-${Math.random().toString(36).slice(2, 7).toUpperCase()}` });
                setCouponDone('yes');
                sfx.coin();
              }}
            >
              領取 ☕
            </ToyButton>
            <ToyButton color="#FFF4E0" className="flex-1" onClick={() => setCouponDone('no')}>
              不用了
            </ToyButton>
          </div>
        </div>
      )}
      {couponDone === 'yes' && <p className="text-[13px] font-bold">☕ 已放進「小房間 → 優惠券」</p>}

      <div className="flex w-full gap-2">
        <ToyButton color="#F3D3A8" className="flex-1" onClick={() => void shareDollCard(def, level)}>
          分享卡片 📤
        </ToyButton>
        <ToyButton color="#BFDDA0" className="flex-1" onClick={() => go('collection')}>
          看圖鑑 📖
        </ToyButton>
      </div>
      <ToyButton big color="#E9A29B" className="w-full" onClick={endLearn}>
        回到夾娃娃機 🕹️
      </ToyButton>
    </div>
  );
}

function Row({ ok, label, text }: { ok: boolean; label: string; text: string }) {
  return (
    <div className="flex items-center gap-2 py-1 text-[14px]">
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-ink text-[12px] ${ok ? 'bg-mint' : 'bg-white'}`}>{ok ? '✓' : ''}</span>
      <b className="w-[72px] shrink-0">{label}</b>
      <span className="text-ink/80">{text}</span>
    </div>
  );
}
