import { useState } from 'react';
import { sfx } from '../lib/sfx';
import { CheckButton, ChallengeProps } from './Shell';

type Variant = { headline: 0 | 1; cta: 0 | 1; color: 0 | 1; image: 0 | 1 };
const OPTS = {
  headline: ['UX 工作坊報名中', '下班 2 小時，學會使用者訪談'],
  cta: ['送出', '免費保留我的位子'],
  color: ['#DE8A86', '#7ED3A8'],
  image: ['🎨', '👩‍💻'],
};
const LABEL: Record<keyof Variant, string> = { headline: '標題', cta: '按鈕文案', color: '按鈕顏色', image: '主視覺' };

function Card({ v, tag }: { v: Variant; tag: string }) {
  return (
    <div className="rounded-2xl border-[3px] border-ink bg-white p-2.5">
      <div className="mb-1 text-[11px] font-extrabold text-ink/50">{tag}</div>
      <div className="grid h-12 place-items-center rounded-lg bg-sky/50 text-2xl">{OPTS.image[v.image]}</div>
      <div className="mt-1.5 min-h-[34px] text-[12px] font-bold leading-tight">{OPTS.headline[v.headline]}</div>
      <div className="mt-1.5 rounded-lg border-2 border-ink py-1.5 text-center text-[11px] font-bold" style={{ background: OPTS.color[v.color] }}>
        {OPTS.cta[v.cta]}
      </div>
    </div>
  );
}

/** Design a clean experiment, then resist peeking at early results. */
export function ABTestChallenge({ onSubmit, locked }: ChallengeProps) {
  const A: Variant = { headline: 0, cta: 0, color: 0, image: 0 };
  const [B, setB] = useState<Variant>({ ...A });
  const [step, setStep] = useState<1 | 2>(1);
  const [designOk, setDesignOk] = useState<boolean | null>(null);
  const [decision, setDecision] = useState<'now' | 'wait' | null>(null);
  const changed = (Object.keys(A) as (keyof Variant)[]).filter((k) => A[k] !== B[k]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Card v={A} tag="A 版（原本）" />
        <Card v={B} tag="B 版（你設計的）" />
      </div>

      {step === 1 && (
        <div className="rounded-2xl bg-white/70 p-3">
          <div className="mb-2 text-[14px] font-bold">步驟 1：調整 B 版（點擊切換）</div>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(A) as (keyof Variant)[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={B[k] !== A[k]}
                onClick={() => {
                  sfx.tap();
                  setB((b) => ({ ...b, [k]: b[k] ? 0 : 1 }));
                }}
                className={`min-h-[44px] rounded-xl border-2 border-ink px-2 text-[13px] font-bold ${B[k] !== A[k] ? 'bg-butter' : 'bg-white'}`}
              >
                {B[k] !== A[k] ? '✏️ 已改' : '　'} {LABEL[k]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-ink/70">目前改了 {changed.length} 個變數：{changed.map((k) => LABEL[k]).join('、') || '無'}</p>
          <CheckButton
            disabled={changed.length === 0}
            onClick={() => {
              setDesignOk(changed.length === 1 && changed[0] === 'cta');
              setStep(2);
            }}
          >
            開始實驗 🧪
          </CheckButton>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl bg-white/70 p-3">
          <div className={`mb-2 rounded-xl p-2 text-[13px] ${designOk ? 'bg-mint' : 'bg-butter'}`}>
            {designOk ? '✓ 實驗設計乾淨：只改了按鈕文案。' : `⚠️ 你改了「${changed.map((k) => LABEL[k]).join('、')}」。要驗證文案，應該「只改按鈕文案」，否則結果無法歸因。`}
          </div>
          <div className="mb-1 text-[14px] font-bold">步驟 2：第 2 天的數據出來了</div>
          <table className="mb-2 w-full text-center text-[13px]">
            <thead>
              <tr className="text-ink/60">
                <th />
                <th>訪客</th>
                <th>報名</th>
                <th>轉換率</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              <tr>
                <td>A</td>
                <td>80</td>
                <td>7</td>
                <td>8.8%</td>
              </tr>
              <tr>
                <td>B</td>
                <td>80</td>
                <td>10</td>
                <td className="text-[#A9454A]">12.5%</td>
              </tr>
            </tbody>
          </table>
          <div className="mb-2 text-[13px]">老闆說：「B 贏了，馬上全面上線！」你會？</div>
          {(
            [
              ['now', '🚀 好！B 領先 3.7%，立刻宣布勝出'],
              ['wait', '⏳ 樣本太小，先跑到預定樣本數（每組約 1,000 人）再判斷'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              disabled={locked}
              aria-pressed={decision === k}
              onClick={() => {
                sfx.tap();
                setDecision(k);
              }}
              className={`mb-1.5 min-h-[44px] w-full rounded-xl border-2 border-ink px-3 py-2 text-left text-[14px] ${
                locked ? (k === 'wait' ? 'bg-mint' : decision === k ? 'bg-[#F5C2B8]' : 'bg-white') : decision === k ? 'bg-butter' : 'bg-white'
              }`}
            >
              {label}
            </button>
          ))}
          {locked && <p className="text-[12px] text-ink/70">第 14 天（每組 1,200 人）：A 9.8% vs B 12.1%，差異達統計顯著。這時候下結論才可靠！</p>}
          {!locked && (
            <CheckButton
              disabled={!decision}
              onClick={() =>
                onSubmit(!!designOk && decision === 'wait', <>實驗設計 {designOk ? '✓' : '✗'}・判斷時機 {decision === 'wait' ? '✓' : '✗（只有 80 人時，3.7% 的差距很可能只是巧合）'}</>)
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
