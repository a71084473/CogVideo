import { useState } from 'react'
import { Section } from '../components/shared'
import { STAGES, cohort, currentStage, setStage, setOverride, visitorId, bucketOf, flags } from '../lib/canary'
import { readLog, statsFor, guardrails, clearLog } from '../lib/funnel'

// 內部用的認養漏斗儀表板。
// 市場報告的第一優先建議即為「建立全國一致的認養漏斗儀表板:統一欄位定義,
// 追蹤上架、互動、申請、核准、完成、退養、追蹤完成率」,並指出官方目前
// 未公開平均收容天數、渠道轉換率與退養率。這一頁是該建議的網站端實作。

const FUNNEL: { key: keyof ReturnType<typeof statsFor>['counts']; label: string }[] = [
  { key: 'visit', label: '進站' },
  { key: 'animal_view', label: '瀏覽動物' },
  { key: 'quiz_start', label: '開始測驗' },
  { key: 'quiz_mid', label: '撐到第 6 題' },
  { key: 'quiz_complete', label: '完成測驗' },
  { key: 'booking_start', label: '進入適配確認' },
  { key: 'booking_submit', label: '送出預約' },
  { key: 'help_request', label: '主動求助' },
  { key: 'happiness_report', label: '幸福回報' },
]

const fmtPct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`)

function Delta({ canary, control }: { canary: number | null; control: number | null }) {
  if (canary === null || control === null) return <span className="text-ink-soft">—</span>
  const d = canary - control
  if (Math.abs(d) < 0.005) return <span className="text-ink-soft">持平</span>
  const up = d > 0
  return (
    <span className={up ? 'font-medium text-sage-dark' : 'font-medium text-danger'}>
      {up ? '▲' : '▼'} {Math.abs(Math.round(d * 100))} pt
    </span>
  )
}

export default function Canary() {
  const [, force] = useState(0)
  const rerender = () => force((n) => n + 1)
  const log = readLog()
  const canary = statsFor(log, 'canary')
  const control = statsFor(log, 'control')
  const rails = guardrails(canary)
  const stage = currentStage()
  const me = cohort()
  const anyBreach = rails.some((r) => r.breached)
  const f = flags()

  return (
    <>
      <Section
        title="認養漏斗儀表板(內部)" level={1}
        subtitle="金絲雀發布的觀測面板。此頁為營運內部使用,不出現在導覽列。"
      >
        <div className="rounded-card border border-info/40 bg-info-light/60 p-5 text-sm">
          <p>
            <span className="font-medium">本次金絲雀要證明的事:</span>
            兩輪 UX 優化能否<strong>在不增加衝動認養的前提下</strong>,提高久候動物的預約占比與測驗完成率。
          </p>
          <p className="mt-1 text-ink-soft">
            指標選擇依據市場報告:全國認領養率已達 68%,瓶頸不在總量而在「難送養動物增加」與「退養/失聯」,
            因此不以預約總量作為成功判準。
          </p>
        </div>

        {/* 階段 */}
        <h2 className="mt-8 text-xl font-bold">發布階段</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setStage(s.id); rerender() }}
              className={`rounded-card border p-4 text-left ${
                s.id === stage.id ? 'border-brand bg-brand-light/50' : 'border-cream-dark bg-white hover:border-sage'
              }`}
            >
              <p className="text-xs text-ink-soft">Stage {s.id}</p>
              <p className="font-bold">{s.name}</p>
              <p className="mt-1 text-2xl font-bold text-brand-dark">{s.rollout}%</p>
              <p className="mt-1 text-xs text-ink-soft">{s.scope}</p>
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-card border border-cream-dark bg-white p-5">
          <p className="font-medium">Stage {stage.id}「{stage.name}」的出場條件</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            {stage.exitCriteria.map((c) => <li key={c}>・{c}</li>)}
          </ul>
          <p className="mt-3 text-sm text-ink-soft">
            你目前的分組:<strong className="text-ink">{me === 'canary' ? '金絲雀組' : '對照組'}</strong>
            (bucket {bucketOf(visitorId())} / rollout {stage.rollout}%)
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => { setOverride('canary'); rerender() }}
              className="min-h-11 rounded-lg border border-cream-dark px-4 py-2 text-sm hover:bg-cream">強制金絲雀組</button>
            <button type="button" onClick={() => { setOverride('control'); rerender() }}
              className="min-h-11 rounded-lg border border-cream-dark px-4 py-2 text-sm hover:bg-cream">強制對照組</button>
            <button type="button" onClick={() => { setOverride(null); rerender() }}
              className="min-h-11 rounded-lg border border-cream-dark px-4 py-2 text-sm hover:bg-cream">恢復自動分流</button>
          </div>
        </div>

        {/* 護欄 */}
        <h2 className="mt-8 text-xl font-bold">護欄</h2>
        <p className="mt-1 text-sm text-ink-soft">
          任一護欄破線即應停止擴大並回滾。取自市場報告風險表:「若只衝活動量,可能提高短期完成、卻增加後續退養」。
        </p>
        <div className={`mt-3 rounded-card border p-5 ${anyBreach ? 'border-danger bg-danger-light/50' : 'border-sage bg-sage-light/40'}`}>
          <p className="font-bold">{anyBreach ? '⚠ 護欄破線,建議回滾' : '✓ 所有護欄正常,可評估擴大'}</p>
          <ul className="mt-3 space-y-2">
            {rails.map((r) => (
              <li key={r.name} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-cream-dark pb-2 text-sm last:border-0">
                <span>
                  <span className="font-medium">{r.name}</span>
                  <span className="ml-2 text-xs text-ink-soft">{r.basis}</span>
                </span>
                <span className={r.breached ? 'font-bold text-danger' : 'font-medium text-sage-dark'}>
                  {r.value === null ? '無資料' : r.format(r.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 漏斗 */}
        <h2 className="mt-8 text-xl font-bold">分組漏斗</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th className="py-2 pr-4">階段</th>
                <th className="py-2 pr-4 text-right">對照組</th>
                <th className="py-2 pr-4 text-right">金絲雀組</th>
              </tr>
            </thead>
            <tbody>
              {FUNNEL.map((f2) => (
                <tr key={f2.key} className="border-b border-cream-dark">
                  <td className="py-2 pr-4">{f2.label}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{control.counts[f2.key]}</td>
                  <td className="py-2 pr-4 text-right font-medium tabular-nums">{canary.counts[f2.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 關鍵比率 */}
        <h2 className="mt-8 text-xl font-bold">關鍵比率</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th className="py-2 pr-4">指標</th>
                <th className="py-2 pr-4 text-right">對照組</th>
                <th className="py-2 pr-4 text-right">金絲雀組</th>
                <th className="py-2 text-right">差異</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: '久候動物預約占比(主要成功指標)', c: control.longWaitShare, k: canary.longWaitShare },
                { label: '測驗完成率', c: control.quizCompletion, k: canary.quizCompletion },
                { label: '第 6 題留存率', c: control.quizMidRetention, k: canary.quizMidRetention },
                { label: '預約轉換率', c: control.bookingConversion, k: canary.bookingConversion },
              ].map((r) => (
                <tr key={r.label} className="border-b border-cream-dark">
                  <td className="py-2 pr-4">{r.label}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{fmtPct(r.c)}</td>
                  <td className="py-2 pr-4 text-right font-medium tabular-nums">{fmtPct(r.k)}</td>
                  <td className="py-2 text-right"><Delta canary={r.k} control={r.c} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 目前生效的旗標 */}
        <h2 className="mt-8 text-xl font-bold">你這一組生效中的旗標</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(f).map(([k, v]) => (
            <span key={k} className={`rounded-full px-3 py-1 text-sm ${v ? 'bg-sage-light text-sage-dark' : 'bg-cream-dark text-ink-soft line-through'}`}>
              {k}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => { clearLog(); rerender() }}
            className="min-h-11 rounded-lg border border-danger px-5 py-2 text-sm text-danger hover:bg-danger-light">
            清除事件紀錄
          </button>
          <span className="self-center text-sm text-ink-soft">目前已記錄 {log.length} 筆事件(僅存於本機瀏覽器)</span>
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          ※ 原型階段事件僅寫入 localStorage。正式版應改為後端事件流,並依報告建議統一全國欄位定義,
          才能跨中途、跨縣市比較。
        </p>
      </Section>
    </>
  )
}
