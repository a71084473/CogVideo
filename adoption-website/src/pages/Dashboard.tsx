import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Section, ProgressBar, EmptyState, HelpEntry } from '../components/shared'
import { StatusBadge, PrepStatusBadge } from '../components/Badges'
import { preparationItems } from '../data/preparation'
import { getAnimal } from '../data/animals'
import { AnimalCard } from '../components/AnimalCard'
import {
  getBooking, getFavorites, getMatchResult, getPrepStatus, setPrepStatus, toggleFavorite,
} from '../lib/storage'
import type { PrepStatus } from '../types'

const day90 = [
  { day: 3, focus: '飲食、排泄、躲藏與環境安全' },
  { day: 7, focus: '作息、互動、抓咬與夜間活動' },
  { day: 30, focus: '家庭反應、醫療與時間壓力' },
  { day: 60, focus: '工作與生活是否發生變化' },
  { day: 90, focus: '整體適配與長期穩定' },
]

export default function Dashboard() {
  const result = getMatchResult()
  const booking = getBooking()
  const [favs, setFavs] = useState<string[]>(getFavorites)
  const [prep, setPrep] = useState<Record<string, PrepStatus>>(getPrepStatus)

  const myPrep = result ? preparationItems.filter((p) => result.preparationIds.includes(p.id)) : []
  const doneCount = myPrep.filter((p) => (prep[p.id] ?? 'todo') === 'done').length
  const favAnimals = favs.map(getAnimal).filter(Boolean)
  const bookedAnimal = booking ? getAnimal(booking.animalId) : null

  function cycle(id: string) {
    const cur = prep[id] ?? 'todo'
    const next: PrepStatus = cur === 'todo' ? 'in-progress' : cur === 'in-progress' ? 'done' : 'todo'
    setPrepStatus(id, next)
    setPrep((p) => ({ ...p, [id]: next }))
  }

  return (
    <>
      <Section title="我的認養進度" level={1} subtitle="你填過的資料我們都記得,不會要求你重複填寫。">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* 測驗結果 */}
            <div className="rounded-card border border-cream-dark bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold">生活適配測驗</h2>
                {result ? <StatusBadge status="ready" /> : <StatusBadge status="need-more" />}
              </div>
              {result ? (
                <>
                  <p className="mt-2 text-ink-soft">
                    {result.status === 'ready' && '你已可以進入媒合,推薦的夥伴在結果頁等你。'}
                    {result.status === 'prepare' && '還有幾項準備完成後,就能更安心進入媒合。'}
                    {result.status === 'other-ways' && '現階段建議先從志工或助養開始,結果會為你保留。'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link to="/quiz/result" className="inline-flex min-h-11 items-center rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark">查看完整結果</Link>
                    <Link to="/quiz" className="inline-flex min-h-11 items-center rounded-lg border border-cream-dark px-4 py-2 text-sm hover:bg-cream">修改我的回答</Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-ink-soft">還沒完成測驗。約 5–10 分鐘,可以隨時儲存續填。</p>
                  <Link to="/quiz" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark">開始測驗</Link>
                </>
              )}
            </div>

            {/* 預約 */}
            <div className="rounded-card border border-cream-dark bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold">預約互動</h2>
                {booking ? <StatusBadge status="reviewing" /> : <StatusBadge status="received" />}
              </div>
              {booking && bookedAnimal ? (
                <p className="mt-2 text-ink-soft">
                  已預約與 <strong className="text-ink">{bookedAnimal.name}</strong> 的
                  {booking.type === 'onsite' ? '實體互動' : '線上諮詢'},希望日期 {booking.date}。
                  中途確認後會通知你(狀態:確認中)。
                </p>
              ) : (
                <p className="mt-2 text-ink-soft">還沒有預約。從動物頁面點「看看我們是否適合彼此」即可預約。</p>
              )}
            </div>

            {/* 準備清單 */}
            <div className="rounded-card border border-cream-dark bg-white p-6">
              <h2 className="text-xl font-bold">共同準備清單</h2>
              {myPrep.length === 0 ? (
                <p className="mt-2 text-ink-soft">完成適配測驗後,這裡會出現為你客製的準備清單。</p>
              ) : (
                <>
                  <div className="mt-3">
                    <ProgressBar value={doneCount} max={myPrep.length} label={`已完成 ${doneCount} / ${myPrep.length} 項`} />
                  </div>
                  <ul className="mt-4 space-y-3">
                    {myPrep.map((p) => {
                      const st = prep[p.id] ?? 'todo'
                      return (
                        <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-cream-dark p-4">
                          <div className="min-w-0 flex-1">
                            <p className={`font-medium ${st === 'done' ? 'text-ink-soft line-through' : ''}`}>{p.title}</p>
                            <p className="mt-0.5 text-sm text-ink-soft">{p.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <PrepStatusBadge status={st} />
                            <button type="button" onClick={() => cycle(p.id)}
                              className="min-h-9 rounded-lg border border-cream-dark px-3 py-1 text-sm hover:bg-cream">
                              更新狀態
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  {doneCount === myPrep.length && (
                    <p role="status" className="mt-4 rounded-lg bg-sage-light px-4 py-3 font-medium text-sage-dark">
                      ✓ 全部完成!我們已收到通知,會與你聯繫安排下一步。
                    </p>
                  )}
                </>
              )}
            </div>

            {/* 90 天節點 */}
            <div className="rounded-card border border-cream-dark bg-white p-6">
              <h2 className="text-xl font-bold">認養後 90 天節點</h2>
              <p className="mt-1 text-sm text-ink-soft">完成責任交接後啟用。先看看每個階段會關心什麼:</p>
              <ol className="mt-3 space-y-2">
                {day90.map((d) => (
                  <li key={d.day} className="flex items-center gap-3 text-ink-soft">
                    <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-lg bg-cream-dark text-sm font-bold text-ink">D{d.day}</span>
                    {d.focus}
                  </li>
                ))}
              </ol>
              <Link to="/support-90" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-brand-dark underline underline-offset-4 hover:text-brand">
                了解 90 天支持的完整內容
              </Link>
            </div>

            {/* 訊息與合約(示意) */}
            <div className="rounded-card border border-cream-dark bg-white p-6">
              <h2 className="text-xl font-bold">中途訊息與文件</h2>
              <p className="mt-2 text-ink-soft">尚無新訊息。完成認養後,合約副本與責任交接摘要會出現在這裡。</p>
            </div>

            {/* 隱私設定 */}
            <div className="rounded-card border border-cream-dark bg-white p-6">
              <h2 className="text-xl font-bold">我的資料與隱私</h2>
              <p className="mt-2 text-sm text-ink-soft">
                目前儲存於你瀏覽器中的資料:測驗回答、收藏、準備進度、預約紀錄。
                你可以隨時清除(瀏覽器設定 → 清除網站資料)。正式版將提供帳號內一鍵查看、下載與刪除。
              </p>
              <Link to="/trust" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-brand-dark underline underline-offset-4">完整隱私說明</Link>
            </div>
          </div>

          <aside className="space-y-6 self-start">
            <HelpEntry />
            <div className="rounded-card border border-cream-dark bg-white p-5">
              <h2 className="font-bold">我的收藏</h2>
              {favAnimals.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">還沒有收藏。瀏覽夥伴時點 ♡ 就會出現在這裡。</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {favAnimals.map((a) => a && (
                    <li key={a.id} className="flex items-center justify-between gap-2">
                      <Link to={`/animals/${a.id}`} className="font-medium text-brand-dark hover:underline">{a.name}</Link>
                      <button type="button" onClick={() => setFavs(toggleFavorite(a.id))}
                        className="min-h-9 rounded px-2 text-sm text-ink-soft hover:bg-cream" aria-label={`移除收藏${a.name}`}>
                        移除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </Section>
      {favAnimals.length === 0 && !result && (
        <Section>
          <EmptyState title="從一個小測驗開始" hint="完成生活適配測驗後,你的專屬進度、推薦與準備清單都會出現在這裡。" action={{ label: '開始生活適配測驗', to: '/quiz' }} />
        </Section>
      )}
      {favAnimals.length > 0 && (
        <Section title="你收藏的夥伴">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favAnimals.map((a) => a && (
              <AnimalCard key={a.id} animal={a} isFavorite onToggleFavorite={(id) => setFavs(toggleFavorite(id))} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
