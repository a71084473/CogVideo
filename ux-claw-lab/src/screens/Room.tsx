import { motion } from 'framer-motion';
import { useState } from 'react';
import { DollAvatar } from '../components/DollAvatar';
import { Sheet, ToyButton, TopBar, useToast } from '../components/ui';
import { UXI } from '../components/UXI';
import { dollById } from '../data/dolls';
import { sfx } from '../lib/sfx';
import { bestOutfit, useGame } from '../store/useGame';

export const DECOR = [
  { id: 'lamp', emoji: '🪔', label: '暖暖小夜燈', price: 20, pos: 'left-[8%] top-[18%]' },
  { id: 'plant', emoji: '🪴', label: '療癒盆栽', price: 15, pos: 'right-[6%] bottom-[22%]' },
  { id: 'poster', emoji: '🖼️', label: 'UX 海報', price: 30, pos: 'right-[10%] top-[10%]' },
  { id: 'rug', emoji: '🟣', label: '圓形地毯', price: 25, pos: 'left-1/2 bottom-[4%] -translate-x-1/2' },
  { id: 'beanbag', emoji: '🛋️', label: '懶骨頭', price: 35, pos: 'left-[6%] bottom-[18%]' },
  { id: 'neon', emoji: '💡', label: '霓虹燈牌', price: 40, pos: 'left-[40%] top-[4%]' },
  { id: 'cat', emoji: '🐈', label: '路過的貓', price: 50, pos: 'right-[30%] bottom-[12%]' },
];
const WALLS = ['#FFE7EF', '#E6F4FF', '#E8F8EF', '#FFF4D6', '#EDE6FF'];

export function Room() {
  const room = useGame((s) => s.room);
  const dolls = useGame((s) => s.dolls);
  const coins = useGame((s) => s.coins);
  const coupons = useGame((s) => s.coupons);
  const buyDecor = useGame((s) => s.buyDecor);
  const toggleDecor = useGame((s) => s.toggleDecor);
  const setShelf = useGame((s) => s.setShelf);
  const setWall = useGame((s) => s.setWall);
  const redeem = useGame((s) => s.redeemCoupon);
  const [slot, setSlot] = useState<number | null>(null);
  const [uxiFace, setUxiFace] = useState<'meh' | 'love'>('meh');
  const owned = Object.values(dolls).filter((p) => p.level > 0);

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#FFD6E6] to-cream">
      <TopBar title="我的 UX 小房間" />
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28">
        {/* the room */}
        <div className="relative h-[330px] overflow-hidden rounded-[32px] border-[3px] border-ink shadow-soft" style={{ background: room.wall }}>
          <div className="absolute inset-x-0 bottom-0 h-[34%] border-t-[3px] border-ink bg-[#f3dcc0]" />
          {room.placed.includes('neon') && (
            <div className="font-display neon absolute left-1/2 top-3 -translate-x-1/2 rounded-xl border-2 border-ink bg-ink px-3 py-1 text-[14px] font-extrabold text-white">USER FIRST ✨</div>
          )}
          {DECOR.filter((d) => room.placed.includes(d.id) && d.id !== 'neon').map((d) => (
            <motion.div key={d.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className={`absolute text-[44px] ${d.pos}`} aria-label={d.label}>
              {d.emoji}
            </motion.div>
          ))}
          {/* shelf */}
          <div className="absolute left-1/2 top-[22%] w-[78%] -translate-x-1/2">
            {[0, 1].map((row) => (
              <div key={row} className="relative mb-1 flex justify-around">
                {room.shelf.slice(row * 3, row * 3 + 3).map((id, k) => {
                  const i = row * 3 + k;
                  return (
                    <button key={i} type="button" onClick={() => setSlot(i)} aria-label={id ? `展示櫃：${dollById(id)?.zh}` : `空的展示格 ${i + 1}`} className="grid h-[62px] w-[62px] place-items-end justify-center">
                      {id ? <DollAvatar id={id} size={58} level={dolls[id]?.level ?? 1} animate /> : <span className="mb-2 grid h-9 w-9 place-items-center rounded-full border-2 border-dashed border-ink/40 text-ink/40">＋</span>}
                    </button>
                  );
                })}
                <div className="absolute inset-x-[-6px] bottom-[-4px] h-2.5 rounded-full border-2 border-ink bg-[#c99a6e]" />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="absolute bottom-[6%] left-1/2 -translate-x-[10%]"
            onClick={() => {
              sfx.pop();
              setUxiFace('love');
              setTimeout(() => setUxiFace('meh'), 1200);
            }}
            aria-label="摸摸 UXI"
          >
            <UXI size={92} face={uxiFace} outfit={bestOutfit(dolls)} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[13px] font-bold">牆面：</span>
          {WALLS.map((w) => (
            <button key={w} type="button" onClick={() => setWall(w)} aria-label={`牆面顏色 ${w}`} className={`h-9 w-9 rounded-full border-2 border-ink ${room.wall === w ? 'ring-4 ring-sakura' : ''}`} style={{ background: w }} />
          ))}
        </div>

        <h2 className="font-display mb-2 mt-4 text-lg font-extrabold">裝飾小舖</h2>
        <div className="grid grid-cols-2 gap-2">
          {DECOR.map((d) => {
            const has = room.decor.includes(d.id);
            const on = room.placed.includes(d.id);
            return (
              <div key={d.id} className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-white p-2">
                <span className="text-3xl">{d.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-extrabold">{d.label}</div>
                  {has ? (
                    <button type="button" onClick={() => toggleDecor(d.id)} className="text-[12px] font-bold text-[#e2457a] underline">
                      {on ? '收起來' : '擺出來'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={coins < d.price}
                      onClick={() => {
                        if (buyDecor(d.id, d.price)) {
                          sfx.coin();
                          useToast.getState().show(`買下 ${d.label}！`, d.emoji);
                        }
                      }}
                      className="rounded-full bg-butter px-2 text-[12px] font-bold disabled:opacity-40"
                    >
                      🪙 {d.price}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {coupons.length > 0 && (
          <>
            <h2 className="font-display mb-2 mt-4 text-lg font-extrabold">優惠券夾</h2>
            {coupons.map((c) => (
              <div key={c.id} className="mb-2 flex items-center gap-2 rounded-2xl border-2 border-dashed border-ink bg-[#fff1e3] p-3">
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-ink/60">贊助・{c.brand}</div>
                  <div className="text-[14px] font-bold">{c.title}</div>
                  <div className="font-mono text-[12px]">{c.code}</div>
                </div>
                <ToyButton color={c.used ? '#e5e5e5' : '#B7E8D0'} disabled={c.used} onClick={() => redeem(c.id)}>
                  {c.used ? '已使用' : '出示核銷'}
                </ToyButton>
              </div>
            ))}
          </>
        )}
      </div>

      <Sheet open={slot !== null} onClose={() => setSlot(null)} title="選一隻娃娃上架">
        {owned.length === 0 ? (
          <p className="text-[14px]">還沒有娃娃喔！先去夾一隻吧 🕹️</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {owned.map((p) => (
              <button
                key={p.dollId}
                type="button"
                onClick={() => {
                  setShelf(slot!, p.dollId);
                  setSlot(null);
                  sfx.pop();
                }}
                className="flex flex-col items-center rounded-2xl border-2 border-ink bg-white p-1"
              >
                <DollAvatar id={p.dollId} size={56} level={p.level} />
                <span className="text-[11px] font-bold">{dollById(p.dollId)?.zh}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                const shelf = useGame.getState().room.shelf.slice();
                shelf[slot!] = null;
                useGame.setState((s) => ({ room: { ...s.room, shelf } }));
                setSlot(null);
              }}
              className="rounded-2xl border-2 border-dashed border-ink text-[12px] font-bold"
            >
              清空這格
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
