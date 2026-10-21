import { useState } from 'react';
import { ToyButton, TopBar, useToast } from '../components/ui';
import { sfx } from '../lib/sfx';
import { useGame } from '../store/useGame';

export function Settings() {
  const settings = useGame((s) => s.settings);
  const setSettings = useGame((s) => s.setSettings);
  const go = useGame((s) => s.go);
  const resetAll = useGame((s) => s.resetAll);
  const loadDemo = useGame((s) => s.loadDemo);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex h-full flex-col potato-bg">
      <TopBar title="設定" onBack={() => go('home')} />
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
        <section className="glass rounded-3xl p-4">
          <label htmlFor="vol" className="flex justify-between text-[15px] font-bold">
            <span>🔊 音效音量</span>
            <span>{Math.round(settings.sfx * 100)}%</span>
          </label>
          <input id="vol" type="range" min={0} max={1} step={0.05} value={settings.sfx} onChange={(e) => setSettings({ sfx: +e.target.value })} onPointerUp={() => sfx.pop()} className="mt-2 w-full accent-[#C75B5F]" />
          <Toggle label="📳 震動回饋" checked={settings.haptics} onChange={(v) => setSettings({ haptics: v })} />
          <Toggle label="🐢 減少動態效果" hint="關閉閃爍、旋轉光芒與大幅動畫" checked={settings.reducedMotion} onChange={(v) => setSettings({ reducedMotion: v })} />
        </section>

        <section className="glass mt-3 rounded-3xl p-4">
          <h2 className="mb-2 text-[15px] font-extrabold">Demo 資料</h2>
          <p className="mb-3 text-[13px] text-ink/70">載入示範進度（8 隻娃娃、各種等級、一週學習紀錄、品牌數據），方便展示與測試。</p>
          <div className="flex gap-2">
            <ToyButton
              color="#BFDDA0"
              className="flex-1"
              onClick={() => {
                loadDemo();
                useToast.getState().show('已載入 Demo 資料', '🧸');
              }}
            >
              載入 Demo
            </ToyButton>
            {confirm ? (
              <ToyButton
                color="#FF9E9E"
                className="flex-1"
                onClick={() => {
                  resetAll();
                  setConfirm(false);
                  useToast.getState().show('進度已重設', '🧹');
                }}
              >
                確定重設？
              </ToyButton>
            ) : (
              <ToyButton color="#FFF4E0" className="flex-1" onClick={() => setConfirm(true)}>
                重設所有進度
              </ToyButton>
            )}
          </div>
        </section>

        <section className="glass mt-3 rounded-3xl p-4">
          <h2 className="mb-2 text-[15px] font-extrabold">合作夥伴</h2>
          <ToyButton color="#FFCE55" className="w-full" onClick={() => go('brand')}>
            📊 品牌活動後台（示範）
          </ToyButton>
        </section>

        <section className="mt-3 rounded-3xl bg-white/60 p-4 text-[12px] leading-relaxed text-ink/80">
          <b>公平遊戲承諾</b>
          <br />
          夾取結果完全由你的操作決定：對準程度 × 夾爪力道 vs 娃娃重量＋晃動。沒有隱藏機率、沒有付費抽獎、沒有連續登入懲罰。品牌內容一律標示「贊助」，獎勵皆為自願領取。
        </section>
      </div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="mt-3 flex min-h-[48px] cursor-pointer items-center justify-between gap-3">
      <span>
        <span className="block text-[15px] font-bold">{label}</span>
        {hint && <span className="block text-[12px] text-ink/60">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-8 w-14 shrink-0 rounded-full border-2 border-ink bg-white transition peer-checked:bg-mint peer-focus-visible:ring-4 peer-focus-visible:ring-sakura">
        <span className={`absolute top-0.5 h-6 w-6 rounded-full border-2 border-ink bg-sakura transition-all ${checked ? 'left-6' : 'left-0.5'}`} />
      </span>
    </label>
  );
}
