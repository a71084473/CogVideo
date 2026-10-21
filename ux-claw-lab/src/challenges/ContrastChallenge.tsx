import { useState } from 'react';
import { sfx } from '../lib/sfx';
import { CheckButton, ChallengeProps } from './Shell';

const BG = '#FF9EBB';
const TEXTS = ['#FFFFFF', '#FFE6EE', '#B04A6A', '#5A2238', '#35465C'];

/** WCAG relative luminance + contrast ratio. */
export function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Tune a button until it is readable and tappable for everyone. */
export function ContrastChallenge({ onSubmit, locked }: ChallengeProps) {
  const [size, setSize] = useState(30);
  const [text, setText] = useState(TEXTS[0]);
  const [iconLabel, setIconLabel] = useState(false);
  const [sun, setSun] = useState(false);
  const [cvd, setCvd] = useState(false);
  const ratio = contrast(text, BG);
  const okRatio = ratio >= 4.5;
  const okSize = size >= 44;

  const check = () => {
    onSubmit(
      okRatio && okSize && iconLabel,
      <ul className="list-none">
        <li>{okRatio ? '✓' : '✗'} 文字對比 {ratio.toFixed(1)}:1（需要 ≥ 4.5:1）</li>
        <li>{okSize ? '✓' : '✗'} 按鈕高度 {size}px（建議 ≥ 44px）</li>
        <li>{iconLabel ? '✓' : '✗'} 錯誤提示不只靠顏色</li>
      </ul>,
    );
  };

  const filter = [sun ? 'brightness(1.35) contrast(0.6)' : '', cvd ? 'grayscale(1)' : ''].join(' ').trim() || 'none';

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl border-[3px] border-ink bg-white p-4" style={{ filter }}>
        <div className="mb-2 text-[13px] font-bold">預約看診</div>
        <div className="mb-1 rounded-lg border-2 border-[#e05a5a] bg-white px-2 py-1.5 text-[13px] text-ink/50">0912-xxx</div>
        <div className="mb-3 h-5 text-[12px] font-bold text-[#e05a5a]">{iconLabel ? '⚠️ 電話格式不正確，請輸入 10 碼數字' : ''}</div>
        <div className="flex justify-center">
          <div
            className="flex items-center justify-center rounded-xl border-2 border-ink font-bold transition-all"
            style={{ background: BG, color: text, height: size, minWidth: size * 2.6, fontSize: Math.max(11, size * 0.36) }}
          >
            確認預約
          </div>
        </div>
      </div>

      <div className="flex gap-2 text-[12px]">
        <button type="button" onClick={() => setSun((s) => !s)} aria-pressed={sun} className={`min-h-[40px] flex-1 rounded-xl border-2 border-ink px-2 font-bold ${sun ? 'bg-butter' : 'bg-white'}`}>
          ☀️ 模擬大太陽
        </button>
        <button type="button" onClick={() => setCvd((s) => !s)} aria-pressed={cvd} className={`min-h-[40px] flex-1 rounded-xl border-2 border-ink px-2 font-bold ${cvd ? 'bg-butter' : 'bg-white'}`}>
          👓 模擬看不出顏色
        </button>
      </div>

      <div className="rounded-2xl bg-white/70 p-3">
        <label className="flex items-center justify-between text-[14px] font-bold" htmlFor="size">
          <span>① 按鈕大小</span>
          <span className={okSize ? 'text-[#2c9a6a]' : ''}>{size}px {okSize ? '✓' : ''}</span>
        </label>
        <input id="size" type="range" min={24} max={64} value={size} disabled={locked} onChange={(e) => setSize(+e.target.value)} className="mt-1 w-full accent-[#FF6F9C]" />

        <div className="mt-3 flex items-center justify-between text-[14px] font-bold">
          <span>② 文字顏色</span>
          <span className={okRatio ? 'text-[#2c9a6a]' : ''}>對比 {ratio.toFixed(1)}:1 {okRatio ? '✓ AA' : ''}</span>
        </div>
        <div className="mt-1.5 flex gap-2" role="radiogroup" aria-label="文字顏色">
          {TEXTS.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={text === t}
              aria-label={`文字顏色 ${t}，對比 ${contrast(t, BG).toFixed(1)} 比 1`}
              disabled={locked}
              onClick={() => {
                sfx.tap();
                setText(t);
              }}
              className={`h-11 flex-1 rounded-xl border-2 border-ink ${text === t ? 'ring-4 ring-sakura' : ''}`}
              style={{ background: t }}
            />
          ))}
        </div>

        <label className="mt-3 flex min-h-[44px] items-center justify-between text-[14px] font-bold">
          <span>③ 錯誤提示加上圖示與文字說明</span>
          <input type="checkbox" checked={iconLabel} disabled={locked} onChange={(e) => setIconLabel(e.target.checked)} className="h-6 w-6 accent-[#FF6F9C]" />
        </label>
      </div>
      {!locked && <CheckButton onClick={check} />}
    </div>
  );
}
