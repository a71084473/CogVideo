// ── 資料模型 ──────────────────────────────────────────────

export type CareLevel = 'easy' | 'patient' | 'special'
export type Species = 'cat' | 'dog'

export interface Animal {
  id: string
  name: string
  species: Species
  age: string
  ageYears: number
  sex: '男生' | '女生'
  location: string
  photoColor: string // 示意圖主色
  photoAlt: string
  personalityTags: string[] // 3 個個性標籤
  lifestyleTags: string[] // 2 個生活適配標籤
  careLevel: CareLevel
  whyMaybeFit: string // 「為什麼可能適合你」
  story: string // 牠的故事
  dailyLife: string[] // 一起生活的真實樣貌
  health: {
    vaccinated: boolean
    neutered: boolean
    tested: string
    chronic: string | null
    medication: string | null
    futureCost: string
  }
  goodFor: string[] // 適合的生活
  notFor: string[] // 可能不適合
  weeklyHours: string // 每週時間投入
  monthlyCost: string // 每月預估支出
  fosterSupport: string[] // 中途可提供的支持
  // 篩選條件
  beginnerFriendly: boolean
  aloneHours: number // 可接受獨處小時數
  activityLevel: 1 | 2 | 3 // 1 低 2 中 3 高
  affection: 1 | 2 | 3 // 親人程度
  okMultiPet: boolean
  okKids: boolean
  needsMedicalCare: boolean
  dailyMedication: boolean
  spaceNeed: '小套房可' | '需一般住家' | '需較大空間'
  mustAdoptInPair: boolean
  similarIds: string[]
}

export interface ApplicantProfile {
  motivation: string
  housing: string
  landlordConsent: string
  cohabitants: string
  workHours: string
  travelFrequency: string
  experience: string
  learningWillingness: string
  monthlyBudget: string
  emergencyFund: string
  backupCaregiver: string
  crisisPlans: string[]
  acceptedCareLevels: CareLevel[]
  lifeChanges: string
  privacyConsent: boolean
}

export type MatchStatus = 'ready' | 'prepare' | 'other-ways'

export interface MatchResult {
  status: MatchStatus
  score: number
  reasons: string[] // 適配原因
  risks: string[] // 風險提醒
  nextSteps: string[]
  recommendedAnimalIds: string[]
  preparationIds: string[] // 需完成的準備項目
}

export type PrepStatus = 'todo' | 'in-progress' | 'done'

export interface PreparationItem {
  id: string
  title: string
  description: string
  status: PrepStatus
  guideUrl?: string
  proofHint: string // 證明／確認方式
}

export type CaseStage =
  | 'quiz-done'
  | 'meeting-booked'
  | 'preparing'
  | 'handover'
  | 'day90-support'

export interface AdoptionCase {
  stage: CaseStage
  animalId: string | null
  bookedAt: string | null
  messages: { from: 'foster' | 'me'; text: string; date: string }[]
  handoverSummary: string | null
  checkpoints: { day: 3 | 7 | 30 | 60 | 90; done: boolean; note: string }[]
}

export type SupportCategory =
  | '健康與醫療'
  | '行為與互動'
  | '飲食與排泄'
  | '家庭與居住'
  | '經濟與物資'
  | '暫時無法照顧'
  | '其他'

export interface SupportRequest {
  id: string
  category: SupportCategory
  urgency: '一般' | '儘快' | '緊急'
  message: string
  status: '已送出' | '處理中' | '已回覆'
  reply?: string
  createdAt: string
}

export interface HappinessUpdate {
  id: string
  animalId: string
  note: string
  isPublic: boolean
  date: string
  photoColor: string
}
