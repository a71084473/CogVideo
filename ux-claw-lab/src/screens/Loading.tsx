import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { UXI } from '../components/UXI';
import { PotatoPile } from '../components/Deco';
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
    <div className="arcade-bg relative flex h-full flex-col items-center justify-center gap-4 p-8 pb-36 text-center" onClick={() => go('home')}>
      <motion.div initial={{ y: -200 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 9 }} className="flex flex-col items-center">
        <div className="h-16 w-1 bg-ink/70" />
        <div className="-mt-1 h-6 w-12 rounded-lg border-[3px] border-ink bg-butter" />
        <UXI size={150} face="happy" />
      </motion.div>
      <div>
        <h1 className="font-display text-[44px] font-extrabold leading-none text-[#FFCE55] title-outline drop-shadow-[0_4px_0_#3E2A1F]">UX CLAW LAB</h1>
        <p className="mt-2 text-[15px] font-bold tracking-[0.3em] text-white">UX 夾娃娃研究所</p>
      </div>
      <div className="h-4 w-56 overflow-hidden rounded-full border-[3px] border-ink bg-white/60">
        <motion.div className="h-full bg-sakura" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.7, ease: 'easeInOut' }} />
      </div>
      <p className="glass rounded-full px-3 py-1 text-[13px] font-bold">{tip}</p>
      <p className="text-[12px] font-bold text-white title-outline">「本來只是想夾個娃娃，結果不知不覺學會了 UX。」</p>
      <PotatoPile height={130} className="absolute inset-x-0 bottom-0" />
    </div>
  );
}
