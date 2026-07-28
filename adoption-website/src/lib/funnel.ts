// 認養漏斗埋點
//
// 市場報告的第一優先建議是「建立全國一致的認養漏斗儀表板:追蹤上架、互動、
// 申請、核准、完成、退養、追蹤完成率」,並指出官方目前未公開平均收容天數、
// 渠道轉換率與退養率。本模組即對應網站端可觀測的那幾段。

import { cohort, type Cohort } from './canary'

export type FunnelEvent =
  | 'visit'            // 進站
  | 'animal_view'      // 看動物詳情(對應報告的「互動」前段)
  | 'quiz_start'
  | 'quiz_mid'         // 第 6 題:R1-6 中途回饋的觀測點
  | 'quiz_complete'
  | 'calibration_view' // 看到期待校準(防衝動認養的護欄)
  | 'booking_start'    // 點擊「看看我們是否適合彼此」
  | 'booking_submit'   // 送出預約(對應報告的「申請」)
  | 'prep_done'        // 準備清單全數完成
  | 'help_request'     // 主動求助(正向訊號,非失敗)
  | 'happiness_report' // 幸福回報(對應報告的「追蹤完成率」)

export interface EventRecord {
  e: FunnelEvent
  c: Cohort
  t: number
  /** 事件相關的動物;用於區分久候動物 */
  animalId?: string
  /** 該動物是否已等待 ≥120 天 */
  longWait?: boolean
}

const KEY = 'adopt.funnel.log'
const MAX = 2000

export function track(e: FunnelEvent, meta?: { animalId?: string; longWait?: boolean }) {
  try {
    const log = readLog()
    log.push({ e, c: cohort(), t: Date.now(), ...meta })
    localStorage.setItem(KEY, JSON.stringify(log.slice(-MAX)))
  } catch {
    /* 埋點失敗不得影響使用者操作 */
  }
}

export function readLog(): EventRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as EventRecord[]) : []
  } catch {
    return []
  }
}

export function clearLog() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* 忽略 */
  }
}

export interface CohortStats {
  cohort: Cohort
  counts: Record<FunnelEvent, number>
  /** 久候動物(≥120 天)的預約數 */
  longWaitBookings: number
  /** 全部預約數 */
  totalBookings: number
  /** 久候動物預約占比 —— 本次金絲雀的主要成功指標 */
  longWaitShare: number | null
  /** 測驗完成率 = quiz_complete / quiz_start */
  quizCompletion: number | null
  /** 第 6 題留存率 = quiz_mid / quiz_start */
  quizMidRetention: number | null
  /** 預約轉換率 = booking_submit / booking_start */
  bookingConversion: number | null
  /** 未校準預約率 —— 護欄:衝動認養 */
  uncalibratedBookingRate: number | null
}

const EVENTS: FunnelEvent[] = [
  'visit', 'animal_view', 'quiz_start', 'quiz_mid', 'quiz_complete',
  'calibration_view', 'booking_start', 'booking_submit', 'prep_done',
  'help_request', 'happiness_report',
]

const ratio = (a: number, b: number) => (b > 0 ? a / b : null)

export function statsFor(log: EventRecord[], c: Cohort): CohortStats {
  const mine = log.filter((r) => r.c === c)
  const counts = Object.fromEntries(EVENTS.map((e) => [e, 0])) as Record<FunnelEvent, number>
  for (const r of mine) if (r.e in counts) counts[r.e]++

  const bookings = mine.filter((r) => r.e === 'booking_submit')
  const longWaitBookings = bookings.filter((r) => r.longWait).length
  const calib = counts.calibration_view

  return {
    cohort: c,
    counts,
    longWaitBookings,
    totalBookings: bookings.length,
    longWaitShare: ratio(longWaitBookings, bookings.length),
    quizCompletion: ratio(counts.quiz_complete, counts.quiz_start),
    quizMidRetention: ratio(counts.quiz_mid, counts.quiz_start),
    bookingConversion: ratio(counts.booking_submit, counts.booking_start),
    uncalibratedBookingRate: ratio(Math.max(0, bookings.length - calib), bookings.length),
  }
}

export interface Guardrail {
  name: string
  basis: string
  value: number | null
  threshold: number
  /** true = 超過門檻即應回滾 */
  breached: boolean
  format: (v: number) => string
}

const pct = (v: number) => `${Math.round(v * 100)}%`

/**
 * 護欄取自市場報告的風險表:「若只衝活動量,可能提高短期完成、卻增加後續退養」。
 * 因此金絲雀若拉高預約量但同時拉高未校準預約,即視為失敗並回滾。
 */
export function guardrails(canary: CohortStats): Guardrail[] {
  return [
    {
      name: '未校準預約率',
      basis: '報告風險表:過度追求數量導致衝動認養',
      value: canary.uncalibratedBookingRate,
      threshold: 0.2,
      breached: (canary.uncalibratedBookingRate ?? 0) > 0.2,
      format: pct,
    },
    {
      name: '求助未被使用',
      basis: '訪談:越早求助越容易一起解決;完全沒有求助反而代表入口失效',
      value: canary.counts.help_request > 0 ? 1 : 0,
      threshold: 0,
      breached: canary.counts.booking_submit > 5 && canary.counts.help_request === 0,
      format: (v) => (v > 0 ? '有使用' : '零使用'),
    },
  ]
}
