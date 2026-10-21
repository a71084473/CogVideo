import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { ToyButton } from '../components/ui';
import { UXI } from '../components/UXI';

export interface ChallengeProps {
  onSubmit: (ok: boolean, detail?: ReactNode) => void;
  locked: boolean; // true after submit: freeze inputs, show marks
}

/** Shared frame: title + prompt, then a friendly verdict panel after submit. */
export function Shell({
  title,
  prompt,
  children,
  verdict,
  explain,
  onContinue,
  onRetry,
}: {
  title: string;
  prompt: string;
  children: ReactNode;
  verdict: { ok: boolean; detail?: ReactNode } | null;
  explain: string;
  onContinue: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-[12px] font-bold text-ink/60">🎮 UX 情境小挑戰・約 20 秒</div>
        <h2 className="font-display text-2xl font-extrabold leading-tight">{title}</h2>
        <p className="mt-1 text-[15px] leading-relaxed">{prompt}</p>
      </div>
      {children}
      <AnimatePresence>
        {verdict && (
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className={`rounded-3xl border-[3px] border-ink p-4 ${verdict.ok ? 'bg-mint' : 'bg-butter'}`}
            role="status"
          >
            <div className="flex items-start gap-3">
              <UXI size={60} face={verdict.ok ? 'love' : 'meh'} bob={false} />
              <div className="flex-1">
                <h3 className="font-display text-xl font-extrabold">{verdict.ok ? '漂亮！完全正確 🎉' : '差一點！看看為什麼 👀'}</h3>
                {verdict.detail && <div className="mt-1 text-[13px] leading-relaxed">{verdict.detail}</div>}
                <p className="mt-2 text-[14px] leading-relaxed">{explain}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {!verdict.ok && (
                <ToyButton color="#FFF4E0" className="flex-1" onClick={onRetry}>
                  再練一次
                </ToyButton>
              )}
              <ToyButton color="#E9A29B" className="flex-1" onClick={onContinue}>
                {verdict.ok ? '收下娃娃 →' : '先這樣，繼續 →'}
              </ToyButton>
            </div>
            {!verdict.ok && <p className="mt-2 text-center text-[12px] text-ink/70">沒關係！娃娃還是你的，之後會提醒你複習，答對就能升級。</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CheckButton({ disabled, onClick, children = '送出答案' }: { disabled?: boolean; onClick: () => void; children?: ReactNode }) {
  return (
    <ToyButton big color="#FFCE55" className="w-full" disabled={disabled} onClick={onClick}>
      {children}
    </ToyButton>
  );
}
