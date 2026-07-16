import type { MatchResult, CareLevel } from '../types'
import type { QuizAnswers } from './storage'
import { animals } from '../data/animals'

// 媒合邏輯:不以單一條件淘汰,而是把缺口轉成準備項目
export function computeMatch(answers: QuizAnswers): MatchResult {
  const reasons: string[] = []
  const risks: string[] = []
  const preparationIds: string[] = []

  const housing = answers.housing as string
  const backup = answers.backup as string
  const emergency = answers.emergency as string
  const experience = answers.experience as string
  const work = answers.work as string
  const travel = answers.travel as string
  const cohabitants = answers.cohabitants as string
  const careLevels = (answers.careLevel as string[]) ?? []

  // 需要準備的項目(不是扣分,是清單)
  if (housing === 'rent-unknown') preparationIds.push('landlord')
  if (cohabitants === 'talking') preparationIds.push('landlord')
  if (backup === 'no' || backup === 'maybe') preparationIds.push('backup-caregiver')
  if (emergency === 'none') preparationIds.push('medical-fund')
  if (experience === 'none-learn' || experience === 'none') preparationIds.push('course')
  preparationIds.push('window-safety', 'basic-supplies')

  // 適配原因
  if (experience === 'much' || experience === 'some') reasons.push('你有照顧經驗,適應期會更順利。')
  if (experience === 'none-learn') reasons.push('你願意學習——這比經驗更重要,我們會提供新手課程與 90 天陪伴。')
  if (backup === 'yes') reasons.push('你已經有第二照顧者,這是穩定照顧最重要的備援。')
  if (emergency === 'ready') reasons.push('你已為突發醫療做了準備,遇到狀況時不會手足無措。')
  if (travel === 'rare') reasons.push('你的生活以在家為主,大多數動物都能配合你的節奏。')

  // 風險提醒(具體、非指責)
  if (work === 'gt12') risks.push('獨處超過 12 小時的日子,建議搭配自動餵食器與鏡頭,或優先考慮能長時間獨處的夥伴。')
  if (travel === 'often') risks.push('出差頻繁時,第二照顧者或寵物旅館名單會是你最重要的準備。')
  const crisis = (answers.crisis as string[]) ?? []
  if (crisis.includes('move')) risks.push('搬家前先確認新居可養寵物,並保留熟悉的用品幫牠適應。')
  if (crisis.includes('abroad')) risks.push('若有出國規劃,請提早與我們討論長期照顧安排,不要獨自煩惱。')

  // 推薦動物
  const wanted = new Set<CareLevel>((careLevels.length ? careLevels : ['easy']) as CareLevel[])
  const aloneNeed = work === 'gt12' ? 12 : work === '9to12' ? 12 : work === '6to9' ? 9 : 6
  const beginner = experience === 'none-learn' || experience === 'none'

  const scored = animals
    .map((a) => {
      let s = 0
      if (wanted.has(a.careLevel)) s += 3
      if (a.aloneHours >= aloneNeed) s += 2
      if (beginner && a.beginnerFriendly) s += 2
      if (!beginner) s += 1
      return { id: a.id, s }
    })
    .sort((x, y) => y.s - x.s)

  const recommendedAnimalIds = scored.slice(0, 3).map((x) => x.id)

  // 三種結果狀態(絕不使用「不合格」)
  const uniquePrep = [...new Set(preparationIds)]
  const blockers = uniquePrep.filter((p) => p !== 'window-safety' && p !== 'basic-supplies' && p !== 'course')

  let status: MatchResult['status']
  if (experience === 'none' && backup === 'no' && emergency === 'none') {
    status = 'other-ways'
  } else if (blockers.length > 0) {
    status = 'prepare'
  } else {
    status = 'ready'
  }

  const nextSteps =
    status === 'ready'
      ? ['查看為你推薦的夥伴', '預約實體互動或線上諮詢', '開始共同準備清單']
      : status === 'prepare'
        ? ['完成下方準備清單', '完成後通知我們,即可進入媒合', '先看看推薦的夥伴,收藏心動的牠']
        : ['了解志工與助養方式', '參加認養前課程', '準備好了隨時回來,測驗結果會保留']

  return {
    status,
    score: scored[0]?.s ?? 0,
    reasons,
    risks,
    nextSteps,
    recommendedAnimalIds,
    preparationIds: uniquePrep,
  }
}
