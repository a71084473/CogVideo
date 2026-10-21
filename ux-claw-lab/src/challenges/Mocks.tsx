import { ReactNode } from 'react';

/** Mini phone mockups used by compare challenges. */
export function Phone({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[170px] rounded-[22px] border-[3px] border-ink bg-white p-1.5 shadow-soft" aria-label={label}>
      <div className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-ink/80" />
      <div className="h-[250px] overflow-hidden rounded-[14px] bg-[#FAFAFF] p-2 text-[9px] leading-tight text-ink">{children}</div>
    </div>
  );
}

const Bar = ({ w = '100%', c = '#e7e4ef', h = 7 }: { w?: string; c?: string; h?: number }) => <div className="rounded" style={{ width: w, height: h, background: c }} />;

export const MOCKS: Record<string, () => JSX.Element> = {
  'checkout-busy': () => (
    <Phone label="結帳畫面 A">
      <div className="mb-1 flex items-center justify-between rounded bg-[#ff5a5a] px-1 py-0.5 font-bold text-white">
        <span>限時！</span>
        <span>⏰ 09:59</span>
      </div>
      <div className="mb-1 grid grid-cols-3 gap-0.5">
        {['🎧', '⌚', '🧴', '👟', '🕶️', '🎒'].map((e) => (
          <div key={e} className="rounded bg-[#ffe9a8] p-0.5 text-center">
            {e}
            <div className="text-[7px]">加購</div>
          </div>
        ))}
      </div>
      {['姓名', '電話', '生日', '職業', '地址', '統編', '推薦碼', '如何認識我們'].map((f) => (
        <div key={f} className="mb-0.5 rounded border border-ink/20 px-1 py-[1px] text-[8px] text-ink/50">
          {f}
        </div>
      ))}
      <div className="mt-1 grid grid-cols-3 gap-0.5 text-center text-[8px] font-bold text-white">
        <div className="rounded bg-[#4aa3ff] py-1">付款</div>
        <div className="rounded bg-[#ff7b54] py-1">加購</div>
        <div className="rounded bg-[#7bc96f] py-1">分享</div>
      </div>
    </Phone>
  ),
  'checkout-clean': () => (
    <Phone label="結帳畫面 B">
      <div className="mb-1 text-[11px] font-bold">結帳 · 步驟 2/3</div>
      <div className="mb-1 h-1 rounded bg-[#e7e4ef]">
        <div className="h-full w-2/3 rounded bg-[#FF8FB1]" />
      </div>
      <div className="mb-2 rounded-lg bg-white p-1.5 shadow-sm">
        <div className="flex justify-between font-bold">
          <span>☕ 保溫杯 ×1</span>
          <span>$590</span>
        </div>
        <div className="mt-0.5 flex justify-between text-ink/60">
          <span>運費</span>
          <span>$0</span>
        </div>
      </div>
      {['收件人（已帶入）', '地址（已帶入）', '付款方式'].map((f) => (
        <div key={f} className="mb-1 rounded-md border border-ink/20 bg-white px-1.5 py-1 text-[9px]">
          {f}
        </div>
      ))}
      <div className="mt-6 rounded-lg bg-[#FF8FB1] py-2 text-center text-[11px] font-bold text-ink">確認付款 $590</div>
    </Phone>
  ),
  'menu-many': () => (
    <Phone label="點餐畫面 A">
      <div className="mb-1 text-[11px] font-bold">全部飲品（48）</div>
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="rounded bg-[#f1ece3] px-0.5 py-1 text-center text-[7px]">
            {['美式', '拿鐵', '摩卡', '冷萃', '燕麥', '可可', '抹茶', '紅茶', '烏龍'][i % 9]}
            {i > 8 ? i : ''}
          </div>
        ))}
      </div>
    </Phone>
  ),
  'menu-few': () => (
    <Phone label="點餐畫面 B">
      <div className="mb-1 text-[11px] font-bold">⭐ 人氣前 5 名</div>
      {['☕ 經典拿鐵', '🧊 冷萃咖啡', '🍵 抹茶拿鐵', '🥛 燕麥美式', '🍫 海鹽可可'].map((m, i) => (
        <div key={m} className={`mb-1 flex items-center justify-between rounded-lg px-1.5 py-1.5 ${i === 0 ? 'bg-[#FFE49A]' : 'bg-white'}`}>
          <span className="text-[10px] font-bold">{m}</span>
          {i === 0 && <span className="text-[8px]">店長推薦</span>}
        </div>
      ))}
      <div className="mt-2 text-center text-[9px] text-ink/60">看全部 48 種 ›</div>
    </Phone>
  ),
  'icons-familiar': () => (
    <Phone label="工具列 A">
      <div className="mb-2 text-[11px] font-bold">我的筆記</div>
      <Bar />
      <div className="mt-1" />
      <Bar w="80%" />
      <div className="mt-1" />
      <Bar w="60%" />
      <div className="mt-24 flex justify-around rounded-lg bg-white py-1.5 text-[15px] shadow">
        <span title="搜尋">🔍</span>
        <span title="新增">➕</span>
        <span title="分享">📤</span>
        <span title="刪除">🗑️</span>
      </div>
      <div className="mt-0.5 flex justify-around text-[7px] text-ink/50">
        <span>?</span>
        <span>?</span>
        <span>?</span>
        <span>?</span>
      </div>
    </Phone>
  ),
  'icons-novel': () => (
    <Phone label="工具列 B">
      <div className="mb-2 text-[11px] font-bold">我的筆記</div>
      <Bar />
      <div className="mt-1" />
      <Bar w="80%" />
      <div className="mt-1" />
      <Bar w="60%" />
      <div className="mt-24 flex justify-around rounded-lg bg-white py-1.5 text-[15px] shadow">
        <span>🔭</span>
        <span>🌱</span>
        <span>🕊️</span>
        <span>🚀</span>
      </div>
      <div className="mt-0.5 flex justify-around text-[7px] text-ink/50">
        <span>?</span>
        <span>?</span>
        <span>?</span>
        <span>?</span>
      </div>
    </Phone>
  ),
};
