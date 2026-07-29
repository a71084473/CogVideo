// 市場進入後的用戶反應模擬
//
// 方法:不直接給滿意度數字,而是把滿意度拆成 7 個「驅動因子」,
// 每一個都到真實網站上實測「有沒有被滿足」,再依 Persona 對各因子的
// 權重加權,算出 CSAT / 期待落差 / NPS。
//
// 每個驅動因子都可追溯到訪談原文或市場報告,權重也是。
// 這樣輸出的不是憑空的分數,而是「網站實際做到了什麼」的函數。

import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:4173/#'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

// ── 滿意度驅動因子:每一個都在網站上有可檢測的證據 ──
const DRIVERS = [
  {
    id: 'not_judged',
    label: '不被審判',
    evidence: '訪談1:「認養人被檢核的過程裡面也很不舒服」',
    check: async (p) => {
      await p.goto(BASE + '/trust', { waitUntil: 'networkidle' })
      const t = await p.locator('main').textContent()
      return t.includes('你有拒絕的權利') && t.includes('沒有公權力')
    },
  },
  {
    id: 'info_complete',
    label: '資訊完整可判斷',
    evidence: '報告:資訊完整性、便利性、流程複雜性直接影響認養意願',
    check: async (p) => {
      await p.goto(BASE + '/animals/yuki', { waitUntil: 'networkidle' })
      const t = await p.locator('main').textContent()
      return t.includes('可能不適合') && t.includes('每月預估支出') && t.includes('未來可能支出')
    },
  },
  {
    id: 'not_watched',
    label: '不被監視',
    evidence: '訪談2:「有點像電子腳鐐」「只是非常在意自己的隱私而已」',
    check: async (p) => {
      await p.goto(BASE + '/support-90', { waitUntil: 'networkidle' })
      const t = await p.locator('main').textContent()
      return t.includes('系統提醒你,不是人來催你') && t.includes('只有中途團隊看得到')
    },
  },
  {
    id: 'low_friction',
    label: '流程不繁瑣',
    evidence: '訪談3:「看到那一堆問題的時候,就不會有人填了」',
    check: async (p) => {
      await p.goto(BASE + '/quiz', { waitUntil: 'networkidle' })
      await p.getByRole('button', { name: /開始測驗|繼續上次的測驗/ }).click()
      for (let i = 0; i < 6; i++) {
        const inp = p.locator('form input[type=radio], form input[type=checkbox]')
        if (!(await inp.count())) break
        await inp.first().check()
        await p.getByRole('button', { name: /下一題|看我的結果/ }).click()
        await p.waitForTimeout(60)
      }
      return (await p.locator('text=已經看得出方向了').count()) > 0
    },
  },
  {
    id: 'help_available',
    label: '遇到問題有人幫',
    evidence: '訪談2:「我們可以提供經驗協助、物資協助,甚至提供人力過去陪你」',
    check: async (p) => {
      await p.goto(BASE + '/crisis', { waitUntil: 'networkidle' })
      const t = await p.locator('main').textContent()
      return t.includes('遇到問題不代表你不適合') && t.includes('家人或伴侶反對')
    },
  },
  {
    id: 'affordable',
    label: '負擔得起',
    evidence: '報告:影響認養最強的因素之一是行為控制知覺,即經濟能力',
    check: async (p) => {
      await p.goto(BASE + '/animals/oreo', { waitUntil: 'networkidle' })
      const t = await p.locator('main').textContent()
      return t.includes('醫療補助') || t.includes('兩週試養期')
    },
  },
  {
    id: 'third_party',
    label: '說得動家人房東',
    evidence: '訪談4:「同住家人一定要同意」;訪談3:「他的房東有沒有同意」',
    check: async (p) => {
      await p.goto(BASE + '/process', { waitUntil: 'networkidle' })
      const t = await p.locator('main').textContent()
      return t.includes('給房東的說明') && t.includes('給同住家人的說明')
    },
  },
]

// ── Persona 對各因子的權重(合計 100)──
// 權重依訪談中該類型認養人反覆表達的在意程度設定。
const PERSONAS = [
  {
    id: 'P1', name: '可培育新手',
    share: 0.28, // 市場占比推估,見報告 10–39 歲認養意願較高
    weights: { not_judged: 22, info_complete: 12, not_watched: 8, low_friction: 30, help_available: 18, affordable: 6, third_party: 4 },
    baseExpectation: 78, // 進站前對「認養平台」的期待值
  },
  {
    id: 'P2', name: '隱私敏感專業者',
    share: 0.18,
    weights: { not_judged: 18, info_complete: 16, not_watched: 34, low_friction: 14, help_available: 6, affordable: 6, third_party: 6 },
    baseExpectation: 62, // 對中途平台預期較差,曾聽聞被審核的經驗
  },
  {
    id: 'P3', name: '共感陪伴型',
    share: 0.22,
    weights: { not_judged: 10, info_complete: 30, not_watched: 8, low_friction: 12, help_available: 22, affordable: 14, third_party: 4 },
    baseExpectation: 85, // 期待最高,最容易失望
  },
  {
    id: 'P4', name: '家庭決策者',
    share: 0.20,
    weights: { not_judged: 12, info_complete: 18, not_watched: 8, low_friction: 12, help_available: 14, affordable: 10, third_party: 26 },
    baseExpectation: 70,
  },
  {
    id: 'P5', name: '戒心回流者',
    share: 0.12,
    weights: { not_judged: 34, info_complete: 16, not_watched: 20, low_friction: 10, help_available: 10, affordable: 6, third_party: 4 },
    baseExpectation: 45, // 曾被拒絕過,期待最低
  },
]

async function measure(stageId) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await ctx.addInitScript((s) => {
    try {
      localStorage.setItem('adopt.canary.override', 'canary')
      localStorage.setItem('adopt.canary.stage', String(s))
    } catch { /* 忽略 */ }
  }, stageId)
  const page = await ctx.newPage()
  const met = {}
  for (const d of DRIVERS) met[d.id] = await d.check(page)
  await ctx.close()
  return met
}

// 需求覆蓋率:該 Persona 在意的因子中,網站「有處理到」的加權比例(0–100)。
// 注意:這不是滿意度。覆蓋率只回答「有沒有做」,不回答「做得好不好」。
function coverageOf(persona, met) {
  let total = 0, got = 0
  for (const [k, w] of Object.entries(persona.weights)) {
    total += w
    if (met[k]) got += w
  }
  return Math.round((got / total) * 100)
}

// 覆蓋率 → 滿意度的換算。
// 「有做」不等於「做得好」,因此乘上執行品質係數並設上限。
// 係數 0.88 的錨點:市場報告載新北 2026 年第 1 季完成訪查者中 97% 表示認養後更幸福——
// 但那是「已完成追蹤者」的事後滿意度(存活者偏誤),用於新平台的事前體驗須折減。
// 上限 92 反映沒有任何服務能讓所有人滿意。
const EXECUTION_QUALITY = 0.88
const CSAT_CEILING = 92
function toCsat(coverage) {
  return Math.min(CSAT_CEILING, Math.round(coverage * EXECUTION_QUALITY))
}

// 期待落差:實際體驗 − 進站前期待。正值=超出期待
function gapOf(persona, csat) {
  return csat - persona.baseExpectation
}

// NPS:落差越大越可能推薦。以落差映射到 0–10 推薦意願,再算 NPS。
// 映射依 Kano 概念:低於期待 → 貶抑者;剛好符合 → 被動;明顯超出 → 推薦者。
function npsBucket(gap) {
  if (gap >= 15) return 'promoter'
  if (gap >= 0) return 'passive'
  return 'detractor'
}

const STAGE_LABEL = { 0: '對照組(現況市場)', 1: 'S1 信任與摩擦', 2: 'S2 久候曝光', 3: 'S3 久候媒合', 4: 'S4 久候門檻' }
const results = []

for (const stageId of [0, 1, 2, 3, 4]) {
  const met = await measure(stageId)
  const rows = PERSONAS.map((p) => {
    const cov = coverageOf(p, met)
    const csat = toCsat(cov)
    const gap = gapOf(p, csat)
    return { persona: p, cov, csat, gap, bucket: npsBucket(gap) }
  })
  const wCov = rows.reduce((s, r) => s + r.cov * r.persona.share, 0)
  const wCsat = rows.reduce((s, r) => s + r.csat * r.persona.share, 0)
  const promoters = rows.filter((r) => r.bucket === 'promoter').reduce((s, r) => s + r.persona.share, 0)
  const detractors = rows.filter((r) => r.bucket === 'detractor').reduce((s, r) => s + r.persona.share, 0)
  results.push({
    stageId, met, rows,
    coverage: Math.round(wCov),
    csat: Math.round(wCsat),
    nps: Math.round((promoters - detractors) * 100),
    promoters: Math.round(promoters * 100),
    detractors: Math.round(detractors * 100),
  })
}

// ── 輸出 ──
console.log('\n══════ 網站進入市場後的用戶反應模擬 ══════\n')
console.log('驅動因子在各階段的滿足情形(實測):')
console.log('因子'.padEnd(16, '　') + 'S0  S1  S2  S3  S4')
console.log('─'.repeat(52))
for (const d of DRIVERS) {
  const row = results.map((r) => (r.met[d.id] ? ' ✔ ' : ' ✘ ')).join(' ')
  console.log(d.label.padEnd(11, '　') + row)
}

console.log('\n各階段加權需求覆蓋率、推估滿意度與推薦傾向:')
console.log('階段                      覆蓋率  CSAT   推薦者  貶抑者    NPS')
console.log('─'.repeat(66))
for (const r of results) {
  console.log(
    STAGE_LABEL[r.stageId].padEnd(20, '　').slice(0, 20) +
      String(r.coverage).padStart(6) +
      String(r.csat).padStart(6) +
      String(r.promoters + '%').padStart(8) +
      String(r.detractors + '%').padStart(8) +
      String(r.nps > 0 ? '+' + r.nps : r.nps).padStart(7),
  )
}

console.log('\n※ 覆蓋率為網站實測;CSAT 為覆蓋率 ×0.88 並設 92 上限的推估值,不是真人量測。')

console.log('\n各 Persona 在 S4(完整版)的反應:')
console.log('Persona            進站前期待  實際CSAT   落差   分類')
console.log('─'.repeat(62))
const final = results[results.length - 1]
for (const row of final.rows) {
  const b = { promoter: '推薦者', passive: '被動者', detractor: '貶抑者' }[row.bucket]
  console.log(
    row.persona.name.padEnd(11, '　') +
      String(row.persona.baseExpectation).padStart(8) +
      String(row.csat).padStart(10) +
      String(row.gap > 0 ? '+' + row.gap : row.gap).padStart(8) +
      '   ' + b,
  )
}

// ── 履約能力壓力測試 ──
// 訪談反覆出現「我沒空」「我哪會記得」;報告顯示全國動保人力僅 1,127 人。
// 若承諾的支持無法兌現,滿意度會怎麼變?
console.log('\n══════ 履約壓力情境:中途無法兌現承諾 ══════\n')
const STRESS = [
  { name: '基準(全部兌現)', fail: [] },
  { name: '回覆延遲(求助 3 天才回)', fail: ['help_available'] },
  { name: '醫療補助排隊/暫停', fail: ['affordable'] },
  { name: '兩者同時發生', fail: ['help_available', 'affordable'] },
]
console.log('情境                          CSAT    NPS   相對基準')
console.log('─'.repeat(58))
const baseCsat = final.csat, baseNps = final.nps
for (const s of STRESS) {
  const met2 = { ...final.met }
  for (const k of s.fail) met2[k] = false
  const rows = PERSONAS.map((p) => {
    const c = toCsat(coverageOf(p, met2))
    return { persona: p, csat: c, bucket: npsBucket(gapOf(p, c)) }
  })
  const c = Math.round(rows.reduce((s2, r) => s2 + r.csat * r.persona.share, 0))
  const pr = rows.filter((r) => r.bucket === 'promoter').reduce((s2, r) => s2 + r.persona.share, 0)
  const de = rows.filter((r) => r.bucket === 'detractor').reduce((s2, r) => s2 + r.persona.share, 0)
  const n = Math.round((pr - de) * 100)
  console.log(
    s.name.padEnd(20, '　').slice(0, 20) +
      String(c).padStart(6) +
      String(n > 0 ? '+' + n : n).padStart(7) +
      `    CSAT ${c - baseCsat >= 0 ? '+' : ''}${c - baseCsat} / NPS ${n - baseNps >= 0 ? '+' : ''}${n - baseNps}`,
  )
}

if (process.env.EXPORT) {
  fs.writeFileSync(process.env.EXPORT, JSON.stringify({ results, drivers: DRIVERS.map((d) => ({ id: d.id, label: d.label, evidence: d.evidence })) }, null, 2))
  console.log(`\n已匯出 → ${process.env.EXPORT}`)
}
await browser.close()
