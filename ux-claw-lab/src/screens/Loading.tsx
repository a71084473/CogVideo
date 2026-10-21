import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { UXI } from '../components/UXI';
import { useGame } from '../store/useGame';

const TIPS = ['正在幫娃娃們梳毛…', '把夾爪擦得亮晶晶…', '今天也辛苦了 ☁️', 'UXI 正在假裝不想上班…'];

export function Loading() {
  const go = useGame((s) => s.go);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  useEffect(() => {
    const t = setTimeout(() => go('home'), 1900);
    return () => clearTimeout(t);
  }, [go]);
  return (
    <div className="arcade-bg flex h-full flex-col items-center justify-center gap-4 p-8 text-center" onClick={() => go('home')}>
      <motion.div initial={{ y: -200 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 9 }} className="flex flex-col items-center">
        <div className="h-16 w-1 bg-ink/70" />
        <div className="-mt-1 h-6 w-12 rounded-lg border-[3px] border-ink bg-butter" />
        <UXI size={150} face="happy" />
      </motion.div>
      <div>
        <h1 className="font-display text-[44px] font-extrabold leading-none text-[#FFE49A] drop-shadow-[0_4px_0_#35465C]">UX CLAW LAB</h1>
        <p className="mt-2 text-[15px] font-bold tracking-[0.3em] text-white">UX 夾娃娃研究所</p>
      </div>
      <div className="h-4 w-56 overflow-hidden rounded-full border-[3px] border-ink bg-white/60">
        <motion.div className="h-full bg-sakura" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.7, ease: 'easeInOut' }} />
      </div>
      <p className="text-[13px] font-bold text-white/90">{tip}</p>
      <p className="absolute bottom-8 text-[12px] text-white/70">「本來只是想夾個娃娃，結果不知不覺學會了 UX。」</p>
    </div>
  );
}
