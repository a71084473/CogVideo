import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DollAvatar } from '../components/DollAvatar';
import { ToyButton, TopBar, useToast } from '../components/ui';
import { UXI } from '../components/UXI';
import { DOLLS, dollById } from '../data/dolls';
import { topicById } from '../data/topics';
import type { TopicId } from '../data/types';
import { CH, CW, renderMachine, Theme } from '../game/render';
import { ClawEngine, DollSpawn, EngineEvent, MissReason } from '../game/physics';
import { moodById } from '../lib/mood';
import { buzz, sfx } from '../lib/sfx';
import { useGame } from '../store/useGame';

const DOLLS_IN_MACHINE = 9;
const engines = new Map<string, ClawEngine>();

export const BRAND = {
  name: 'Mellow Bean Coffee',
  machine: '下班能量補給機',
  coupon: '任一杯飲品折 20 元（示範券）',
};

function themeFor(key: TopicId | 'all' | 'brand'): Theme {
  if (key === 'brand') return { wallTop: '#6b4a3a', wallBottom: '#d9a77f', floor: '#f3dcc0', light: '#ffcf9a', claw: '#FFE49A' };
  if (key === 'all') return { wallTop: '#8a72d8', wallBottom: '#f2b8d6', floor: '#fbe3ef', light: '#FFA9C5', claw: '#FFE49A' };
  const t = topicById(key);
  return { wallTop: '#7a63c9', wallBottom: t.color, floor: '#FFF4F8', light: t.color, claw: '#FFE49A' };
}

function buildSpawns(key: TopicId | 'all' | 'brand', count: number, exclude: string[] = []): DollSpawn[] {
  const s = useGame.getState();
  const mood = moodById(s.daily.mood);
  const owned = s.dolls;
  const rnd = () => Math.random();
  let pool = DOLLS.slice();
  if (key !== 'all' && key !== 'brand') {
    const topical = DOLLS.filter((d) => d.topic === key);
    const rest = DOLLS.filter((d) => d.topic !== key).sort(() => rnd() - 0.5);
    pool = topical.concat(topical, rest); // topic dolls appear twice as often
  } else {
    pool.sort(() => rnd() - 0.5);
  }
  const score = (id: string) => {
    const p = owned[id];
    if (mood.preferNew) return p && p.level > 0 ? 1 : 0;
    if (mood.preferReview) return p && p.level > 0 && (p.nextReview <= Date.now() || !p.lastChallengeOk) ? 0 : 1;
    return 0.5;
  };
  pool = pool.filter((d) => !exclude.includes(d.id));
  const ordered = pool.map((d, i) => ({ d, k: score(d.id) + i * 0.001 })).sort((a, b) => a.k - b.k);
  const picked: DollSpawn[] = [];
  const counts: Record<string, number> = {};
  for (const { d } of ordered) {
    if (picked.length >= count) break;
    if ((counts[d.id] ?? 0) >= 1) continue;
    counts[d.id] = 1;
    picked.push({ dollId: d.id, rarity: d.rarity });
  }
  return picked;
}

type Feedback = { kind: 'win' | 'miss'; title: string; body: string; reason?: MissReason } | null;

export function Machine() {
  const key = useGame((s) => s.machineTopic);
  const go = useGame((s) => s.go);
  const mood = moodById(useGame((s) => s.daily.mood));
  const missStreak = useGame((s) => s.missStreak);
  const seenIntro = useGame((s) => s.seenIntro);
  const reduced = useGame((s) => s.settings.reducedMotion);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef({ x: 0, z: 0 });
  const keysRef = useRef({ x: 0, z: 0 });
  const [phase, setPhase] = useState('ready');
  const [grip, setGrip] = useState<{ grip: number; need: number } | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [reveal, setReveal] = useState<string[] | null>(null);
  const [coach, setCoach] = useState(!seenIntro);
  const mercy = Math.min(0.24, missStreak * 0.08);
  const theme = useMemo(() => themeFor(key), [key]);
  const title = key === 'all' ? 'UX 綜合夾娃娃機' : key === 'brand' ? BRAND.machine : `${topicById(key).zh}機`;

  // one engine per machine, kept while you go read knowledge cards
  const engine = useMemo(() => {
    let e = engines.get(key);
    if (!e) {
      e = new ClawEngine(buildSpawns(key, DOLLS_IN_MACHINE), Math.floor(Math.random() * 1e9));
      engines.set(key, e);
    } else {
      const left = e.dolls.filter((d) => d.state !== 'won');
      if (left.length < DOLLS_IN_MACHINE) e.restock(buildSpawns(key, DOLLS_IN_MACHINE - left.length, left.map((d) => d.dollId)), Date.now() & 0xffff);
      e.reset();
    }
    return e;
  }, [key]);

  useEffect(() => {
    // `?debug` exposes the engine for automated play-testing
    if (new URLSearchParams(location.search).has('debug')) (window as unknown as { __claw: ClawEngine }).__claw = engine;
  }, [engine]);

  useEffect(() => {
    engine.strength = mood.strength;
    engine.mercy = mercy;
  }, [engine, mood.strength, mercy]);

  useEffect(() => {
    if (key === 'brand') useGame.getState().brandEvent('impressions');
  }, [key]);

  // engine events → juice + feedback
  useEffect(() => {
    return engine.on((e: EngineEvent) => {
      switch (e.type) {
        case 'touch':
          sfx.bump();
          buzz(15);
          break;
        case 'grab':
          sfx.grab();
          buzz([20, 30, 20]);
          setGrip({ grip: e.grip, need: engine.claw.need });
          break;
        case 'miss-close':
          sfx.soft();
          if (e.uid != null) setGrip({ grip: engine.claw.grip, need: engine.claw.need });
          break;
        case 'slip':
          sfx.slip();
          buzz(60);
          break;
        case 'land':
          if (e.impact > 160) sfx.bump();
          break;
        case 'win':
          sfx.pop();
          break;
        case 'round-end': {
          const st = useGame.getState();
          st.registerPlay(key === 'brand');
          if (e.won.length) {
            const rare = e.won.some((id) => dollById(id)?.rarity !== 'common');
            rare ? sfx.rare() : sfx.win();
            buzz([30, 40, 30, 40, 80]);
            setReveal(e.won);
          } else {
            st.registerMiss();
            const g = engine.claw;
            const msg = missCopy(e.reason ?? 'empty', g.grip, g.need);
            setFeedback({ kind: 'miss', ...msg, reason: e.reason ?? 'empty' });
          }
          break;
        }
      }
    });
  }, [engine, key]);

  // render + physics loop
  useEffect(() => {
    const cv = canvasRef.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = CW * dpr;
    cv.height = CH * dpr;
    const ctx = cv.getContext('2d')!;
    let last = performance.now();
    let raf = 0;
    let lastPhase = '';
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const ix = inputRef.current.x || keysRef.current.x;
      const iz = inputRef.current.z || keysRef.current.z;
      engine.step(dt, { x: ix, z: iz });
      if (engine.claw.phase !== lastPhase) {
        lastPhase = engine.claw.phase;
        setPhase(lastPhase);
        if (lastPhase === 'done') engine.reset();
      }
      if (engine.claw.heldUid != null && (engine.claw.phase === 'lift' || engine.claw.phase === 'carry')) {
        setGrip({ grip: engine.claw.grip, need: engine.claw.need });
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const lv: Record<string, number> = {};
      for (const [k, v] of Object.entries(useGame.getState().dolls)) lv[k] = Math.max(1, v.level);
      renderMachine(ctx, engine, theme, reduced ? 0 : now / 1000, { aim: mood.aim, levels: lv });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine, theme, mood.aim, reduced]);

  const doDrop = useCallback(() => {
    if (feedback || reveal) return;
    if (engine.drop()) {
      sfx.drop();
      buzz(10);
      setGrip(null);
      setCoach(false);
      useGame.getState().markIntro();
    }
  }, [engine, feedback, reveal]);

  // keyboard controls (desktop + accessibility)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'a') keysRef.current.x = -1;
      else if (k === 'ArrowRight' || k === 'd') keysRef.current.x = 1;
      else if (k === 'ArrowUp' || k === 'w') keysRef.current.z = -1;
      else if (k === 'ArrowDown' || k === 's') keysRef.current.z = 1;
      else if (k === ' ' || k === 'Enter') {
        if ((e.target as HTMLElement)?.tagName === 'BUTTON') return;
        doDrop();
      } else return;
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key;
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(k)) keysRef.current.x = 0;
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(k)) keysRef.current.z = 0;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [doDrop]);

  const openCard = () => {
    if (!reveal) return;
    const [first, ...rest] = reveal;
    const st = useGame.getState();
    if (rest.length) {
      st.bonusCatch(rest);
      useToast.getState().show(`一次夾到 ${reveal.length} 隻！其他已放進圖鑑`, '🎉');
    }
    setReveal(null);
    st.catchDoll(first, key, key === 'brand' ? BRAND.name : undefined);
  };

  const ready = phase === 'ready' && !feedback && !reveal;

  return (
    <div className="arcade-bg relative flex h-full flex-col">
      <TopBar title={title} onBack={() => go('home')} />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-3 pb-3">
        {/* cabinet */}
        <div className="relative w-full max-w-[400px] rounded-[30px] border-[3px] border-ink p-2 shadow-soft" style={{ background: key === 'brand' ? '#c98d63' : '#FFA9C5' }}>
          <div className="mb-1.5 flex items-center justify-between rounded-2xl bg-ink px-3 py-1.5">
            <span className="font-display neon text-lg font-extrabold tracking-wide text-white">UX CLAW LAB</span>
            <div className="flex gap-1.5">
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white">
                {mood.emoji} 力道 {Math.round(mood.strength * 100)}%
              </span>
              {mercy > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-ink" title="連續沒夾到時，夾爪會變穩一點（公開規則）">
                  💗 暖心 +{Math.round(mercy * 100)}%
                </motion.span>
              )}
            </div>
          </div>
          {key === 'brand' && <div className="mb-1 rounded-lg bg-white/70 px-2 py-0.5 text-center text-[11px] font-bold">贊助內容｜{BRAND.name} 品牌機台</div>}
          <div className="relative mx-auto overflow-hidden rounded-2xl border-[3px] border-ink" style={{ width: 'min(100%, calc(60dvh * 360 / 440))' }}>
            <canvas
              ref={canvasRef}
              className="block h-auto w-full touch-none select-none"
              style={{ aspectRatio: `${CW} / ${CH}` }}
              aria-label="夾娃娃機內部。用搖桿或方向鍵移動夾爪，空白鍵放下夾爪。"
              role="img"
            />
            <GripMeter grip={grip} phase={phase} />
            <AnimatePresence>
              {coach && phase === 'ready' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-3 top-3 rounded-2xl bg-ink/80 p-3 text-[13px] leading-relaxed text-white">
                  <b>玩法：</b>拖曳左下搖桿移動夾爪（左右＝位置、上下＝深度），看地上的<b>影子圈</b>對準娃娃中心，按 <b>GO!</b> 放下夾爪。
                  <br />
                  <span className="text-butter">規則公開：對得越正抓力越強；夾爪晃動越大越容易滑落。</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* control panel */}
          <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-cream/90 px-3 py-2">
            <Joystick inputRef={inputRef} disabled={!ready} />
            <div className="flex-1 text-center text-[12px] font-medium leading-snug text-ink/80" aria-live="polite">
              {phaseText(phase)}
            </div>
            <motion.button
              type="button"
              onClick={doDrop}
              disabled={!ready}
              whileTap={{ scale: 0.88 }}
              animate={ready && !reduced ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={ready ? { duration: 1.4, repeat: Infinity } : undefined}
              className="toy-btn font-display grid h-[84px] w-[84px] place-items-center rounded-full bg-[#FF6F9C] text-2xl font-extrabold text-white disabled:opacity-50"
              aria-label="放下夾爪"
            >
              GO!
            </motion.button>
          </div>
        </div>
      </div>

      {/* miss feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div className="absolute inset-0 z-30 flex items-end bg-ink/30 p-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} className="glass w-full rounded-3xl p-4" role="dialog" aria-label="夾取結果">
              <div className="flex items-start gap-3">
                <UXI size={64} face={feedback.reason === 'slip' ? 'wow' : 'meh'} outfit="none" />
                <div className="flex-1">
                  <h2 className="font-display text-lg font-extrabold">{feedback.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed">{feedback.body}</p>
                  <p className="mt-2 rounded-xl bg-sky/50 px-2.5 py-1.5 text-[12px] leading-relaxed">
                    💡 <b>UX 小彩蛋：</b>失敗時告訴你「為什麼」與「下一步」，就是好的<b>錯誤回饋設計</b>。
                  </p>
                </div>
              </div>
              <ToyButton className="mt-3 w-full" color="#FFE49A" onClick={() => setFeedback(null)} big>
                再夾一次！
              </ToyButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* reward reveal */}
      <AnimatePresence>{reveal && <Reveal ids={reveal} onOpen={openCard} reduced={reduced} />}</AnimatePresence>
    </div>
  );
}

function phaseText(p: string) {
  switch (p) {
    case 'ready':
      return '移動夾爪，對準影子圈';
    case 'drop':
      return '夾爪下降中…';
    case 'close':
      return '收爪！';
    case 'lift':
      return '往上拉…撐住！';
    case 'carry':
      return '運送到出口 →';
    case 'release':
      return '放開～';
    default:
      return '回到起點';
  }
}

function missCopy(reason: MissReason, grip: number, need: number) {
  if (reason === 'empty') return { title: '夾到空氣了～', body: '夾爪下方沒有娃娃。看地上的影子圈：它就是夾爪真正會落下的位置，把它對準娃娃中心再按 GO!' };
  if (reason === 'weak')
    return { title: '只碰到邊邊！', body: `對準程度不夠，抓力只有 ${Math.round(grip * 100)}%（需要 ${Math.round(need * 100)}%）。影子圈越靠近娃娃中心，抓力越強。` };
  return { title: '差一點點就到了！', body: `運送時夾爪晃動，需求升到 ${Math.round(need * 100)}%，抓力 ${Math.round(grip * 100)}% 撐不住。對得更正，或等夾爪停止搖晃再放下。稀有娃娃比較重喔！` };
}

function GripMeter({ grip, phase }: { grip: { grip: number; need: number } | null; phase: string }) {
  if (!grip || phase === 'ready' || phase === 'drop') return null;
  const ok = grip.grip >= grip.need;
  return (
    <div className="absolute right-2 top-2 w-32 rounded-xl bg-ink/75 p-2 text-[11px] text-white" aria-live="polite">
      <div className="flex justify-between font-bold">
        <span>抓力</span>
        <span>{Math.round(grip.grip * 100)}%</span>
      </div>
      <div className="relative mt-1 h-2.5 rounded-full bg-white/25">
        <div className={`h-full rounded-full ${ok ? 'bg-mint' : 'bg-sakura'}`} style={{ width: `${grip.grip * 100}%` }} />
        <div className="absolute top-[-3px] h-4 w-0.5 bg-butter" style={{ left: `${Math.min(100, grip.need * 100)}%` }} title="需要的抓力" />
      </div>
      <div className="mt-1 text-white/80">黃線＝需要 {Math.round(grip.need * 100)}%</div>
    </div>
  );
}

function Joystick({ inputRef, disabled }: { inputRef: React.MutableRefObject<{ x: number; z: number }>; disabled: boolean }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const base = useRef<HTMLDivElement>(null);
  const R = 34;
  const update = (cx: number, cy: number) => {
    const b = base.current!.getBoundingClientRect();
    let dx = cx - (b.left + b.width / 2);
    let dy = cy - (b.top + b.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > R) {
      dx = (dx / len) * R;
      dy = (dy / len) * R;
    }
    setKnob({ x: dx, y: dy });
    const dead = (v: number) => (Math.abs(v) < 0.12 ? 0 : v);
    inputRef.current = { x: dead(dx / R), z: dead(dy / R) };
  };
  const release = () => {
    setKnob({ x: 0, y: 0 });
    inputRef.current = { x: 0, z: 0 };
  };
  useEffect(() => {
    if (disabled) release();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);
  return (
    <div
      ref={base}
      className={`relative grid h-[96px] w-[96px] shrink-0 touch-none place-items-center rounded-full border-[3px] border-ink bg-sky/70 ${disabled ? 'opacity-50' : ''}`}
      onPointerDown={(e) => {
        if (disabled) return;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (disabled || !(e.buttons || e.pointerType === 'touch')) return;
        update(e.clientX, e.clientY);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      role="application"
      aria-label="搖桿：拖曳移動夾爪，也可以用方向鍵"
    >
      <span className="pointer-events-none absolute top-0.5 text-[10px] font-bold text-ink/60">後</span>
      <span className="pointer-events-none absolute bottom-0.5 text-[10px] font-bold text-ink/60">前</span>
      <span className="pointer-events-none absolute left-1 text-[10px] font-bold text-ink/60">左</span>
      <span className="pointer-events-none absolute right-1 text-[10px] font-bold text-ink/60">右</span>
      <div
        className="pointer-events-none h-11 w-11 rounded-full border-[3px] border-ink bg-[#FF6F9C] shadow-toy"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}

function Reveal({ ids, onOpen, reduced }: { ids: string[]; onOpen: () => void; reduced: boolean }) {
  const def = dollById(ids[0])!;
  const owned = useGame.getState().dolls[def.id];
  const isNew = !owned || owned.caught === 0;
  const rare = def.rarity !== 'common';
  return (
    <motion.div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-ink/70 p-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {rare && !reduced && (
        <motion.div
          className="absolute h-[420px] w-[420px] rounded-full"
          style={{ background: `conic-gradient(from 0deg, ${def.rarity === 'legendary' ? '#FFD45E55, transparent, #FFA9C555, transparent, #A9D9F855, transparent, #FFD45E55' : '#ffffff40, transparent, #ffffff40, transparent, #ffffff40'})` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {!reduced &&
        Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-xl"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{ x: Math.cos((i / 14) * Math.PI * 2) * 160, y: Math.sin((i / 14) * Math.PI * 2) * 160, opacity: 0, scale: 1.2 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          >
            {['✨', '⭐', '💖', '🌸'][i % 4]}
          </motion.span>
        ))}
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.15 }} className="relative">
        <div className="relative rounded-[36px] border-[3px] border-ink bg-cream p-4 shadow-soft">
          {isNew && <span className="font-display absolute -right-3 -top-3 rotate-12 rounded-full bg-[#FF6F9C] px-3 py-1 text-sm font-extrabold text-white">NEW!</span>}
          <DollAvatar id={def.id} size={160} level={Math.max(1, owned?.level ?? 1)} face="happy" animate={!reduced} />
        </div>
      </motion.div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="relative mt-4 text-white">
        <div className="text-sm font-bold text-butter">{def.rarity === 'legendary' ? '★★★ 傳說娃娃' : def.rarity === 'rare' ? '★★ 稀有娃娃' : '★ 娃娃'}</div>
        <h2 className="font-display mt-1 text-3xl font-extrabold">{def.dollName}</h2>
        <p className="mt-1 text-lg font-bold">
          {def.zh}｜{def.en}
        </p>
        <p className="mt-1 text-sm text-white/80">{isNew ? '打開知識卡，完成小任務後正式加入圖鑑！' : '又見面了！趁機複習一下，讓它升級吧。'}</p>
      </motion.div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="relative mt-5">
        <ToyButton big color="#FFE49A" onClick={onOpen}>
          打開知識卡 🃏
        </ToyButton>
      </motion.div>
    </motion.div>
  );
}
