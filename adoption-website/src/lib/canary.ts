// 金絲雀發布(Canary Release)基礎設施 —— 策略階梯版
//
// 設計依據:台灣流浪動物領養問題分析報告指出,全國認領養率已達 68%(114 年度),
// 問題不在總量而在「難送養動物增加」。因此本次金絲雀的目標函數是
// 「久候動物(≥120 天)的領養率」,而不是預約總量。
//
// 與一般金絲雀不同的是,這裡的階段不只是流量百分比,而是**策略階梯**:
// 每一階只新增一根槓桿,上一階的指標有動才往上加。
// 這樣久候占比一旦提升,才能歸因到是哪一個介入造成的。

export type Cohort = 'canary' | 'control'

export interface FeatureFlags {
  // ── 第一階:信任與摩擦(兩輪 UX 測試的產出,非久候專屬)──
  surveillanceRelief: boolean
  fosterCandor: boolean
  thirdPartyTools: boolean
  expectationCalibration: boolean
  midQuizFeedback: boolean
  peerSupport: boolean
  reportIncentive: boolean
  extendTo180: boolean

  // ── 第二階:久候曝光(被動)──
  /** 卡片顯示等待天數 + 選填的「等待較久優先」排序 */
  waitingVisibility: boolean

  // ── 第三階:久候媒合(主動)──
  /** 預設排序納入等待時間;測驗推薦保證含久候夥伴;首頁設久候專區 */
  waitingRanking: boolean

  // ── 第四階:久候門檻(降低照顧成本)──
  /** 久候動物專屬支持包:醫療補助、兩週試養、交通接送、行為諮詢 */
  longWaitSupport: boolean
}

const NONE: FeatureFlags = {
  surveillanceRelief: false,
  fosterCandor: false,
  thirdPartyTools: false,
  expectationCalibration: false,
  midQuizFeedback: false,
  peerSupport: false,
  reportIncentive: false,
  extendTo180: false,
  waitingVisibility: false,
  waitingRanking: false,
  longWaitSupport: false,
}

/** 各階段新增的旗標(累積生效) */
const RUNG: Record<number, (keyof FeatureFlags)[]> = {
  0: [],
  1: [
    'surveillanceRelief', 'fosterCandor', 'thirdPartyTools', 'expectationCalibration',
    'midQuizFeedback', 'peerSupport', 'reportIncentive', 'extendTo180',
  ],
  2: ['waitingVisibility'],
  3: ['waitingRanking'],
  4: ['longWaitSupport'],
  5: [],
}

export interface Stage {
  id: number
  name: string
  rollout: number
  scope: string
  /** 這一階要驗證的假設 */
  hypothesis: string
  /** 這一階新增的槓桿 */
  lever: string
  /** 主要觀測指標 */
  metric: string
  exitCriteria: string[]
}

// 流量與地理範圍隨信心成長而放寬;策略槓桿則一次只加一根。
// 地理順序依報告的資源分布:全國僅 32 處公立收容所、動保人力 1,127 人,六都最充足。
export const STAGES: Stage[] = [
  {
    id: 0,
    name: '內部乾跑',
    rollout: 100,
    scope: '5 位訪談衍生 Persona,無真實使用者',
    hypothesis: '分流、旗標、埋點與護欄能正確運作',
    lever: '無(基準線)',
    metric: '埋點完整性',
    exitCriteria: ['所有埋點正確觸發', '護欄計算正確', '零 JavaScript 錯誤'],
  },
  {
    id: 1,
    name: '信任與摩擦',
    rollout: 5,
    scope: '1 家合作中途,約 8–15 隻在養動物',
    hypothesis: '先把整體轉換的阻力移除,久候動物才有被看見的基礎',
    lever: '兩輪 UX 優化共 8 項(監視感、中途處境、房東家人工具、期待校準、測驗中途回饋等)',
    metric: '測驗完成率、預約轉換率',
    exitCriteria: [
      '測驗完成率高於對照組',
      '未校準預約率 ≤ 20%(護欄)',
      '無新增 P1 級錯誤',
    ],
  },
  {
    id: 2,
    name: '久候曝光(被動)',
    rollout: 15,
    scope: '同一家中途,擴大流量',
    hypothesis: '只要誠實揭露等待天數,願意的人自己會選久候動物',
    lever: '卡片顯示等待天數 + 選填的「等待較久優先」排序',
    metric: '久候動物預約占比',
    exitCriteria: [
      '久候動物預約占比高於對照組',
      '排序功能使用率 ≥ 10%(若過低,代表被動揭露不足,須進入第三階)',
    ],
  },
  {
    id: 3,
    name: '久候媒合(主動)',
    rollout: 30,
    scope: '台中市(114 年認領養率 78%、所內死亡率 12%,改善空間最大)',
    hypothesis: '被動揭露不夠,必須改變預設看到的東西',
    lever: '預設排序納入等待時間;測驗推薦保證含久候夥伴;首頁設久候專區',
    metric: '久候動物曝光占比 → 預約占比',
    exitCriteria: [
      '久候動物曝光占比 ≥ 40%',
      '久候動物預約占比高於第二階',
      '整體預約量未下降超過 10%(護欄。S3 單獨上線時實測會破線,見下註)',
    ],
  },
  {
    id: 4,
    name: '久候門檻(降低成本)',
    rollout: 60,
    scope: '六都(動保人力最充足的六個直轄市)',
    hypothesis: '看見了但不敢認養,是因為久候動物多半高齡或有病史,照顧成本讓人卻步',
    lever: '久候專屬支持包:醫療補助、兩週試養期、交通接送、行為諮詢(報告「長住動物加速專案」)',
    metric: '久候動物「看了詳情 → 送出預約」的轉換率',
    exitCriteria: [
      '久候動物詳情頁轉換率高於第三階',
      '整體預約量回到 S2 水準(S4 的作用是把 S3 讓出去的量補回來)',
      '180 天追蹤完成率 ≥ 85%(報告 KPI)',
      '六個月退養率 < 5%(報告 KPI);試養期不得成為退養的方便門',
    ],
  },
  {
    id: 5,
    name: '全國',
    rollout: 100,
    scope: '全國含偏鄉;需搭配報告建議的交通接駁與移動醫療',
    hypothesis: '—',
    lever: '場外觸點與跨所移轉(超出本平台範圍,需與公立收容所整合)',
    metric: '180 天以上長住動物占比',
    exitCriteria: ['—'],
  },
]

const KEY_ID = 'adopt.canary.vid'
const KEY_STAGE = 'adopt.canary.stage'
const KEY_OVERRIDE = 'adopt.canary.override'

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
    const n = raw ? Number(raw) : 2
    return STAGES.find((s) => s.id === n) ?? STAGES[2]
  } catch {
    return STAGES[2]
  }
}

export function setStage(id: number) {
  try {
    localStorage.setItem(KEY_STAGE, String(id))
  } catch {
    /* 忽略儲存失敗 */
  }
}

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

/** 金絲雀組拿到「當前階段(含)以下」所有階梯累積的旗標;對照組永遠全關 */
export function flagsForStage(stageId: number): FeatureFlags {
  const f = { ...NONE }
  for (let i = 0; i <= stageId; i++) {
    for (const k of RUNG[i] ?? []) f[k] = true
  }
  return f
}

export function flags(): FeatureFlags {
  return cohort() === 'canary' ? flagsForStage(currentStage().id) : NONE
}
