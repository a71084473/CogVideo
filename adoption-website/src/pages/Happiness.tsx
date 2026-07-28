import { useState } from 'react'
import { Section } from '../components/shared'
import { animals } from '../data/animals'
import { addHappinessUpdate, getHappinessUpdates } from '../lib/storage'
import type { HappinessUpdate } from '../types'
import { flags } from '../lib/canary'
import { track } from '../lib/funnel'

// 示意的公開成長時間軸(不顯示認養人姓名或聯絡資料)
const publicTimeline = [
  { name: '布丁', when: '認養後 8 個月', note: '從躲床下到每天叫早,現在最愛窗邊的午睡位。', color: '#D9B48F' },
  { name: '小黑', when: '認養後 1 年', note: '換牙風波平安度過,體重穩定,散步路線多了兩條。', color: '#4A423A' },
  { name: '芝麻', when: '認養後 100 天', note: '完成 90 天陪伴!新手爸媽正式畢業。', color: '#B08968' },
]

export default function Happiness() {
  const [animalId, setAnimalId] = useState(animals[0].id)
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState('')
  const [updates, setUpdates] = useState<HappinessUpdate[]>(getHappinessUpdates)
  const [justSent, setJustSent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (note.trim().length < 2) {
      setError('寫一兩句近況就可以了,例如「食慾很好,最近愛上紙箱」。')
      return
    }
    setError('')
    const u: HappinessUpdate = {
      id: `hu-${Date.now()}`,
      animalId,
      note: note.trim(),
      isPublic,
      date: new Date().toISOString().slice(0, 10),
      photoColor: animals.find((a) => a.id === animalId)?.photoColor ?? '#D9B48F',
    }
    track('happiness_report')
    addHappinessUpdate(u)
    setUpdates(getHappinessUpdates())
    setNote('')
    setJustSent(true)
  }

  return (
    <>
      <Section
        title="幸福回報" level={1}
        subtitle="一張照片、一句近況就夠了。這不是追蹤,是讓曾經照顧牠的人,看見牠現在過得很好。"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={submit} noValidate className="space-y-5 self-start rounded-card border border-cream-dark bg-white p-6 md:p-8">
            <h2 className="text-xl font-bold">分享近況</h2>
            <div>
              <label htmlFor="hu-animal" className="mb-1 block text-sm font-medium">是哪位夥伴?</label>
              <select id="hu-animal" value={animalId} onChange={(e) => setAnimalId(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-cream-dark bg-white px-3 py-2">
                {animals.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="hu-photo" className="mb-1 block text-sm font-medium">照片(選填)</label>
              <input id="hu-photo" type="file" accept="image/*"
                className="w-full rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-cream-dark file:px-3 file:py-1.5" />
              <p className="mt-1 text-xs text-ink-soft">原型階段照片不會被上傳,僅示意流程。</p>
            </div>
            <div>
              <label htmlFor="hu-note" className="mb-1 block text-sm font-medium">近況</label>
              <textarea id="hu-note" rows={3} value={note}
                aria-invalid={!!error} aria-describedby={error ? 'hu-error' : undefined}
                onChange={(e) => { setNote(e.target.value); setError('') }}
                placeholder="例如:最近學會開紙箱,體重穩定,超愛曬太陽。"
                className={`w-full rounded-lg border bg-white px-3 py-2 ${error ? 'border-danger' : 'border-cream-dark'}`} />
              {error && <p id="hu-error" role="alert" className="mt-1 text-sm text-danger">⚠ {error}</p>}
            </div>
            <fieldset>
              <legend className="text-sm font-medium">公開設定</legend>
              <label className="mt-2 flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border border-cream-dark px-4 py-2.5 text-sm has-checked:border-brand has-checked:bg-brand-light">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="mt-1 h-4 w-4 accent-brand" />
                <span>
                  同意顯示在公開成長時間軸
                  <span className="block text-xs text-ink-soft">公開內容只會顯示動物名字與近況,不會顯示你的姓名、地址或聯絡資料。</span>
                </span>
              </label>
            </fieldset>
            <button type="submit" className="min-h-12 w-full rounded-lg bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark">
              送出回報
            </button>
            {justSent && (
              <p role="status" className="rounded-lg bg-sage-light px-4 py-3 text-sm font-medium text-sage-dark">
                ✓ 已送出,謝謝你的分享!中途與曾照顧牠的志工都會很開心。
              </p>
            )}
            {flags().reportIncentive && (
            <div className="rounded-lg bg-sage-light/60 px-4 py-3 text-sm">
              <p className="font-medium">回報一次,就有一張抽獎券</p>
              <p className="mt-1 text-ink-soft">
                合作廠商每月提供不同物資(罐頭、貓砂、保健品),你可以自己決定要把券投進哪一個獎箱。
                回報幾次就有幾張,不回報也不會有任何影響——這是謝謝,不是條件。
              </p>
              <p className="mt-1 text-xs text-ink-soft">※ 原型示意,尚未實際開放。</p>
            </div>
            )}
            <p className="text-xs text-ink-soft">
              回報節奏:前 90 天配合支持節點,之後由系統溫和提醒;滿一年後改為自主回報,不會無限期高頻追蹤。
            </p>
          </form>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">成長時間軸</h2>
            {updates.filter((u) => u.isPublic).map((u) => {
              const a = animals.find((x) => x.id === u.animalId)
              return (
                <figure key={u.id} className="flex gap-4 rounded-card border border-cream-dark bg-white p-5">
                  <span aria-hidden="true" className="h-12 w-12 shrink-0 rounded-full" style={{ backgroundColor: u.photoColor }} />
                  <div>
                    <figcaption className="text-sm font-bold">{a?.name}<span className="ml-2 font-normal text-ink-soft">{u.date}</span></figcaption>
                    <blockquote className="text-ink-soft">{u.note}</blockquote>
                  </div>
                </figure>
              )
            })}
            {publicTimeline.map((t) => (
              <figure key={t.name} className="flex gap-4 rounded-card border border-cream-dark bg-white p-5">
                <span aria-hidden="true" className="h-12 w-12 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                <div>
                  <figcaption className="text-sm font-bold">{t.name}<span className="ml-2 font-normal text-ink-soft">{t.when}</span></figcaption>
                  <blockquote className="text-ink-soft">{t.note}</blockquote>
                </div>
              </figure>
            ))}
            <p className="text-xs text-ink-soft">以上時間軸為示意內容;所有公開分享皆經認養人同意且不含個人識別資訊。</p>
          </div>
        </div>
      </Section>
    </>
  )
}
