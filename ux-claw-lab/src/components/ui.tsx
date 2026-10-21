import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { create } from 'zustand';
import { useSharePreview } from '../lib/share';
import { sfx } from '../lib/sfx';
import { useGame } from '../store/useGame';

export function ToyButton({
  children,
  onClick,
  color = '#FFA9C5',
  className = '',
  disabled,
  label,
  big,
}: {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  big?: boolean;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      onClick={() => {
        if (disabled) return;
        sfx.tap();
        onClick?.();
      }}
      className={`toy-btn rounded-2xl font-bold text-ink ${big ? 'px-6 py-3.5 text-lg' : 'px-4 py-2.5 text-[15px]'} min-h-[44px] disabled:opacity-40 ${className}`}
      style={{ background: color }}
    >
      {children}
    </motion.button>
  );
}

export function Coins({ n }: { n: number }) {
  return (
    <motion.div key={n} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="glass flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold" aria-label={`金幣 ${n}`}>
      <span aria-hidden>🪙</span>
      <span className="font-display tabular-nums">{n}</span>
    </motion.div>
  );
}

export function TopBar({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  const coins = useGame((s) => s.coins);
  const go = useGame((s) => s.go);
  return (
    <div className="flex items-center gap-2 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
      {onBack ? (
        <button aria-label="返回" onClick={() => { sfx.tap(); onBack(); }} className="glass grid h-11 w-11 place-items-center rounded-full text-xl font-bold">
          ‹
        </button>
      ) : null}
      {title ? <h1 className="font-display flex-1 truncate text-xl font-extrabold text-white drop-shadow">{title}</h1> : <div className="flex-1" />}
      {right}
      <Coins n={coins} />
      <button aria-label="設定" onClick={() => { sfx.tap(); go('settings'); }} className="glass grid h-11 w-11 place-items-center rounded-full text-lg">
        ⚙️
      </button>
    </div>
  );
}

const NAV = [
  { id: 'home', icon: '🕹️', label: '遊樂場' },
  { id: 'collection', icon: '📖', label: '圖鑑' },
  { id: 'room', icon: '🛋️', label: '小房間' },
  { id: 'progress', icon: '📈', label: '進度' },
  { id: 'daily', icon: '🌙', label: '下班模式' },
] as const;

export function BottomNav() {
  const screen = useGame((s) => s.screen);
  const go = useGame((s) => s.go);
  return (
    <nav className="glass mx-3 mb-[max(10px,env(safe-area-inset-bottom))] flex justify-around rounded-3xl px-1 py-1.5" aria-label="主選單">
      {NAV.map((n) => {
        const active = screen === n.id;
        return (
          <button
            key={n.id}
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              sfx.tap();
              go(n.id);
            }}
            className={`relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center rounded-2xl px-2 text-[11px] font-bold ${active ? 'text-ink' : 'text-ink/60'}`}
          >
            {active && <motion.span layoutId="navpill" className="absolute inset-0 rounded-2xl bg-butter" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
            <span className="relative text-xl leading-none" aria-hidden>
              {n.icon}
            </span>
            <span className="relative mt-0.5">{n.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-40 flex items-end bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="max-h-[85%] w-full overflow-y-auto rounded-t-[28px] bg-cream p-5 pb-[max(20px,env(safe-area-inset-bottom))]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-ink/20" />
            {title && <h2 className="font-display mb-3 text-xl font-extrabold">{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ToastState {
  msg: { id: number; text: string; icon?: string } | null;
  show: (text: string, icon?: string) => void;
}
export const useToast = create<ToastState>((set) => ({
  msg: null,
  show: (text, icon) => set({ msg: { id: Date.now(), text, icon } }),
}));

export function ToastHost() {
  const msg = useToast((s) => s.msg);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => useToast.setState({ msg: null }), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-16 z-50 flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {msg && (
          <motion.div key={msg.id} initial={{ y: -20, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0 }} className="glass rounded-2xl px-4 py-2.5 text-sm font-bold">
            {msg.icon && <span className="mr-1.5">{msg.icon}</span>}
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LevelPips({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`等級 ${level} / 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`h-2 w-2 rounded-full border border-ink ${i <= level ? 'bg-[#FFC233]' : 'bg-white/60'}`} />
      ))}
    </span>
  );
}

export const LEVEL_NAMES = ['未收集', 'Lv1 認識', 'Lv2 理解', 'Lv3 應用'];

export function SharePreview() {
  const { url, name } = useSharePreview();
  const close = () => {
    if (url) URL.revokeObjectURL(url);
    useSharePreview.setState({ url: null });
  };
  return (
    <AnimatePresence>
      {url && (
        <motion.div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-ink/70 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} role="dialog" aria-label="分享卡片">
          <img src={url} alt={`${name} 收藏卡`} className="max-h-[70%] rounded-3xl border-[3px] border-ink" onClick={(e) => e.stopPropagation()} />
          <p className="text-center text-[14px] font-bold text-white">長按（手機）或右鍵（電腦）另存圖片，就能分享到社群 📤</p>
          <ToyButton color="#FFE49A" onClick={close}>
            關閉
          </ToyButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
