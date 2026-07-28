// 金絲雀發布(Canary Release)基礎設施
//
// 設計依據:台灣流浪動物領養問題分析報告指出,全國認領養率已達 68%(114 年度),
// 問題不在總量而在「難送養動物增加」與「退養/失聯」。因此金絲雀的成功指標
// 不是預約量,而是「久候動物的預約占比」與「認養後穩定度」;
// 並以報告風險表中的「過度追求數量導致衝動認養」作為必須守住的護欄。

export type Cohort = 'canary' | 'control'

/** 可獨立開關的優化項,對應兩輪 UX 測試的產出 */
export interface FeatureFlags {
  /** R1-2 90 天支持頁的「這不是在盯著你」 */
  surveillanceRelief: boolean
  /** R1-3 信任頁「我們這邊的實話」 */
  fosterCandor: boolean
  /** R1-4 流程頁房東與家人工具 */
  thirdPartyTools: boolean
  /** R1-5 動物頁期待校準 */
  expectationCalibration: boolean
  /** R1-6 測驗中途回饋 */
  midQuizFeedback: boolean
  /** R2-2 久候動物等待天數與排序 */
  waitingVisibility: boolean
  /** R2-3 同儕互助 */
  peerSupport: boolean
  /** R2-4 回報回饋 */
  reportIncentive: boolean
  /** 依市場報告建議,追蹤期自 90 天延長至 180 天(低頻) */
  extendTo180: boolean
}

/** 對照組 = 兩輪優化前的版本 */
const CONTROL: FeatureFlags = {
  surveillanceRelief: false,
  fosterCandor: false,
  thirdPartyTools: false,
  expectationCalibration: false,
  midQuizFeedback: false,
  waitingVisibility: false,
  peerSupport: false,
  reportIncentive: false,
  extendTo180: false,
}

const ALL_ON: FeatureFlags = {
  surveillanceRelief: true,
  fosterCandor: true,
  thirdPartyTools: true,
  expectationCalibration: true,
  midQuizFeedback: true,
  waitingVisibility: true,
  peerSupport: true,
  reportIncentive: true,
  extendTo180: true,
}

export interface Stage {
  id: number
  name: string
  /** 金絲雀組流量百分比 */
  rollout: number
  scope: string
  /** 進入下一階段的條件(取自市場報告 KPI) */
  exitCriteria: string[]
}

// 擴大範圍的節奏對齊市場報告的資源分布:
// 報告指出全國僅 32 處公立收容所、動保人力 1,127 人,六都明顯高於其他縣市,
// 因此擴散順序為 單一中途 → 單一縣市 → 六都 → 全國。
export const STAGES: Stage[] = [
  {
    id: 0,
    name: '內部乾跑',
    rollout: 100,
    scope: '5 位訪談衍生 Persona,無真實使用者',
    exitCriteria: ['所有埋點正確觸發', '護欄計算正確', '零 JavaScript 錯誤'],
  },
  {
    id: 1,
    name: '單一中途金絲雀',
    rollout: 5,
    scope: '1 家合作中途之家,約 8–15 隻在養動物',
    exitCriteria: [
      '久候動物(≥120 天)預約占比高於對照組',
      '校準完成率 ≥ 80%(護欄:防衝動認養)',
      '無新增 P1 級錯誤',
    ],
  },
  {
    id: 2,
    name: '單一縣市',
    rollout: 25,
    scope: '台中市(114 年認領養率 78%、所內死亡率 12%,改善空間最大且已有送養專車基礎)',
    exitCriteria: [
      '90 天回報完成率 ≥ 85%(報告建議值)',
      '六個月退養率 < 5%(報告建議值)',
      '長住動物認養量高於對照組',
    ],
  },
  {
    id: 3,
    name: '六都',
    rollout: 50,
    scope: '新北、台北、台中、台南、桃園、高雄(動保人力最充足的六個直轄市)',
    exitCriteria: [
      '180 天追蹤完成率 ≥ 85%',
      '熟齡/特殊照護動物認養量 +30%',
      '中途端工作負荷未上升(需中途端問卷)',
    ],
  },
  {
    id: 4,
    name: '全國',
    rollout: 100,
    scope: '全國含偏鄉;需搭配報告建議的交通接駁與移動醫療',
    exitCriteria: ['—'],
  },
]

const KEY_ID = 'adopt.canary.vid'
const KEY_STAGE = 'adopt.canary.stage'
const KEY_OVERRIDE = 'adopt.canary.override'

/** 穩定的訪客 ID:同一瀏覽器永遠落在同一組,避免使用者看到介面反覆變動 */
export function visitorId(): string {
  try {
    let v = localStorage.getItem(KEY_ID)
    if (!v) {
      v = Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem(KEY_ID, v)
    }
    return v
  } catch {
    return 'anonymous'
  }
}

/** FNV-1a:輕量且分布均勻,足夠做流量分桶 */
export function bucketOf(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return Math.abs(h) % 100
}

export function currentStage(): Stage {
  try {
    const raw = localStorage.getItem(KEY_STAGE)
    const n = raw ? Number(raw) : 1
    return STAGES.find((s) => s.id === n) ?? STAGES[1]
  } catch {
    return STAGES[1]
  }
}

export function setStage(id: number) {
  try {
    localStorage.setItem(KEY_STAGE, String(id))
  } catch {
    /* 忽略儲存失敗 */
  }
}

/** 測試用:強制指定分組,不影響一般使用者 */
export function setOverride(c: Cohort | null) {
  try {
    if (c) localStorage.setItem(KEY_OVERRIDE, c)
    else localStorage.removeItem(KEY_OVERRIDE)
  } catch {
    /* 忽略儲存失敗 */
  }
}

export function cohort(): Cohort {
  try {
    const o = localStorage.getItem(KEY_OVERRIDE)
    if (o === 'canary' || o === 'control') return o
  } catch {
    /* 忽略讀取失敗 */
  }
  return bucketOf(visitorId()) < currentStage().rollout ? 'canary' : 'control'
}

export function flags(): FeatureFlags {
  return cohort() === 'canary' ? ALL_ON : CONTROL
}
