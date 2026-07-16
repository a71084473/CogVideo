// localStorage 模擬:收藏、測驗續填、準備清單、求助紀錄、幸福回報
// 注意:不儲存身分證、地址或敏感醫療資料

import type { MatchResult, PrepStatus, SupportRequest, HappinessUpdate } from '../types'

const KEYS = {
  favorites: 'adopt.favorites',
  quizAnswers: 'adopt.quiz.answers',
  quizStep: 'adopt.quiz.step',
  matchResult: 'adopt.match.result',
  prep: 'adopt.prep.status',
  booking: 'adopt.booking',
  support: 'adopt.support.requests',
  happiness: 'adopt.happiness',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 儲存空間不足時靜默失敗,不中斷操作
  }
}

// ── 收藏 ──
export const getFavorites = () => read<string[]>(KEYS.favorites, [])
export function toggleFavorite(id: string): string[] {
  const favs = getFavorites()
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]
  write(KEYS.favorites, next)
  return next
}

// ── 測驗續填 ──
export type QuizAnswers = Record<string, string | string[]>
export const getQuizAnswers = () => read<QuizAnswers>(KEYS.quizAnswers, {})
export const saveQuizAnswers = (a: QuizAnswers) => write(KEYS.quizAnswers, a)
export const getQuizStep = () => read<number>(KEYS.quizStep, 0)
export const saveQuizStep = (s: number) => write(KEYS.quizStep, s)
export function clearQuiz() {
  localStorage.removeItem(KEYS.quizAnswers)
  localStorage.removeItem(KEYS.quizStep)
}

// ── 測驗結果 ──
export const getMatchResult = () => read<MatchResult | null>(KEYS.matchResult, null)
export const saveMatchResult = (r: MatchResult) => write(KEYS.matchResult, r)

// ── 準備清單 ──
export const getPrepStatus = () => read<Record<string, PrepStatus>>(KEYS.prep, {})
export function setPrepStatus(id: string, status: PrepStatus) {
  const cur = getPrepStatus()
  write(KEYS.prep, { ...cur, [id]: status })
}

// ── 預約互動 ──
export interface Booking {
  animalId: string
  type: 'onsite' | 'online'
  date: string
  createdAt: string
}
export const getBooking = () => read<Booking | null>(KEYS.booking, null)
export const saveBooking = (b: Booking) => write(KEYS.booking, b)

// ── 求助紀錄 ──
export const getSupportRequests = () => read<SupportRequest[]>(KEYS.support, [])
export function addSupportRequest(r: SupportRequest) {
  write(KEYS.support, [r, ...getSupportRequests()])
}

// ── 幸福回報 ──
export const getHappinessUpdates = () => read<HappinessUpdate[]>(KEYS.happiness, [])
export function addHappinessUpdate(u: HappinessUpdate) {
  write(KEYS.happiness, [u, ...getHappinessUpdates()])
}
