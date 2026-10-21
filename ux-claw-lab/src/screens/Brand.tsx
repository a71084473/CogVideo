import { motion } from 'framer-motion';
import { TopBar } from '../components/ui';
import { useGame } from '../store/useGame';
import { BRAND } from './Machine';

/** P2 preview: sponsor-facing campaign report (local demo data). */
export function Brand() {
  const s = useGame((x) => x.brandStats);
  const go = useGame((x) => x.go);
  const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : '—');
  const funnel = [
    { label: '機台曝光', v: s.impressions },
    { label: '開始遊玩', v: s.plays },
    { label: '完成學習互動', v: s.completions },
    { label: '自願領取優惠', v: s.couponsClaimed },
    { label: '優惠核銷', v: s.couponsRedeemed },
  ];
  const max = Math.max(1, ...funnel.map((f) => f.v));
  return (
    <div className="flex h-full flex-col bg-[#f4f1fb]">
      <TopBar title="品牌活動後台" onBack={() => go('settings')} />
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
        <div className="rounded-3xl border-[3px] border-ink bg-white p-4">
          <div className="text-[12px] font-bold text-ink/60">活動中・示範資料</div>
          <h2 className="font-display text-xl font-extrabold">☕ {BRAND.machine}</h2>
          <div className="mt-1 text-[13px]">贊助品牌：{BRAND.name}</div>
          <div className="text-[13px]">獎勵：{BRAND.coupon}</div>
          <div className="text-[13px]">學習主題：同理心・認知負荷・希克定律・使用者旅程</div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            ['參與率', pct(s.plays, s.impressions)],
            ['互動完成率', pct(s.completions, s.plays)],
            ['核銷率', pct(s.couponsRedeemed, s.couponsClaimed)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border-2 border-ink bg-white p-2 text-center">
              <div className="font-display text-xl font-extrabold">{v}</div>
              <div className="text-[11px] font-bold text-ink/60">{k}</div>
            </div>
          ))}
        </div>

        <section className="mt-3 rounded-3xl border-2 border-ink bg-white p-4">
          <h3 className="mb-2 text-[15px] font-extrabold">互動漏斗</h3>
          {funnel.map((f) => (
            <div key={f.label} className="mb-2">
              <div className="flex justify-between text-[13px] font-bold">
                <span>{f.label}</span>
                <span className="tabular-nums">{f.v.toLocaleString()}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-ink/10">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(f.v / max) * 100}%` }} className="h-full rounded-full bg-[#c98d63]" />
              </div>
            </div>
          ))}
        </section>

        <section className="mt-3 rounded-3xl bg-white/70 p-4 text-[12px] leading-relaxed">
          <b>品牌合作原則</b>
          <ul className="ml-4 mt-1 list-disc">
            <li>所有品牌機台、獎勵皆標示「贊助」。</li>
            <li>優惠券僅在玩家完成學習後「自願」領取，不強迫觀看廣告。</li>
            <li>品牌關卡仍必須教授真實的 UX 概念，由內容團隊審核。</li>
            <li>只提供彙總數據，不提供個人學習紀錄給品牌。</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
