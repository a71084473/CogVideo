// Stage 0 金絲雀乾跑:五位訪談衍生 Persona × 兩組(對照/金絲雀)
//
// 目的有二:(1) 驗證分流、旗標與埋點確實運作;(2) 觀察同一位 Persona 在兩組
// 之間的行為差異。N=5 極小,結論只作為「是否值得進入 Stage 1」的門檻判斷,
// 不作為效果量的證據。

import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:4173/#'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const errors = []
const squash = (s) => (s || '').replace(/\s+/g, ' ').trim()

// Persona 的行為規則直接來自訪談,不是隨機猜測。
const PERSONAS = [
  {
    id: 'P1',
    name: '小昀・表單逃跑者',
    evidence: '「看到那一堆問題的時候,就不會有人填了」',
    // 沒有中途回饋就在第 6 題放棄;有回饋則撐完
    quizGiveUpAt: (hasMidFeedback) => (hasMidFeedback ? null : 6),
    animal: 'mochi',
    // 看不到期待校準時,較容易直接送出預約
    booksWithoutCalibration: true,
  },
  {
    id: 'P2',
    name: '阿哲・隱私敏感',
    evidence: '「有點像電子腳鐐」「只是非常在意自己的隱私」',
    quizGiveUpAt: () => null,
    animal: 'latte',
    // 讀 90 天頁若沒看到「不是在盯著你」就放棄預約
    requiresSurveillanceRelief: true,
    booksWithoutCalibration: false,
  },
  {
    id: 'P3',
    name: '宜庭・共感型',
    evidence: '「跟這些文字共鳴的人會來認養」',
    quizGiveUpAt: () => null,
    animal: 'yuki', // 11 歲慢性腎病,等待 243 天
    booksWithoutCalibration: true,
  },
  {
    id: 'P4',
    name: '至凱・家庭決策者',
    evidence: '「小孩想認養,可是後來父母不同意」',
    quizGiveUpAt: () => null,
    animal: 'oreo', // 熟齡犬,等待 209 天
    requiresThirdPartyTools: true,
    booksWithoutCalibration: false,
  },
  {
    id: 'P5',
    name: 'Wendy・戒心回流者',
    evidence: '「認養人都說送養人是很機車的」',
    quizGiveUpAt: () => null,
    animal: 'hazel', // 等待 164 天
    requiresFosterCandor: true,
    booksWithoutCalibration: false,
  },
]

async function runPersona(p, forceCohort) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  // 分組必須在任何頁面程式碼執行前就決定,否則首個 visit 事件會被貼到錯的組
  await ctx.addInitScript((c) => {
    try { localStorage.setItem('adopt.canary.override', c) } catch { /* 忽略 */ }
  }, forceCohort)
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(`${p.id}/${forceCohort}: ${e.message}`))

  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(120)

  const trace = []

  // 1. 測驗
  await page.goto(BASE + '/quiz', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /開始測驗|繼續上次的測驗/ }).click()
  let hasMidFeedback = false
  let completedQuiz = false
  for (let i = 1; i <= 12; i++) {
    const inputs = page.locator('form input[type=radio], form input[type=checkbox]')
    if (!(await inputs.count())) break
    if (i === 6) hasMidFeedback = (await page.locator('text=已經看得出方向了').count()) > 0
    const giveUp = p.quizGiveUpAt(hasMidFeedback)
    if (giveUp && i >= giveUp) { trace.push(`第 ${i} 題放棄`); break }
    await inputs.first().check()
    await page.getByRole('button', { name: /下一題|看我的結果/ }).click()
    await page.waitForTimeout(60)
    if (page.url().includes('result')) { completedQuiz = true; trace.push('完成測驗'); break }
  }

  // 2. 條件檢查:各 Persona 的阻力點
  let blocked = null
  if (p.requiresSurveillanceRelief) {
    await page.goto(BASE + '/support-90', { waitUntil: 'networkidle' })
    const ok = squash(await page.locator('main').textContent()).includes('這不是在盯著你')
    if (!ok) blocked = '90 天頁未解除監視感'
  }
  if (!blocked && p.requiresThirdPartyTools) {
    await page.goto(BASE + '/process', { waitUntil: 'networkidle' })
    const ok = squash(await page.locator('main').textContent()).includes('給房東的說明')
    if (!ok) blocked = '無說服家人/房東的工具'
  }
  if (!blocked && p.requiresFosterCandor) {
    await page.goto(BASE + '/trust', { waitUntil: 'networkidle' })
    const ok = squash(await page.locator('main').textContent()).includes('你有拒絕的權利')
    if (!ok) blocked = '中途處境未揭露,戒心未解'
  }

  // 3. 看動物 → 預約
  let booked = false
  let sawCalibration = false
  if (completedQuiz && !blocked) {
    await page.goto(BASE + `/animals/${p.animal}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(150)
    sawCalibration = (await page.locator('text=在你心動之前').count()) > 0
    if (sawCalibration || p.booksWithoutCalibration) {
      await page.getByRole('button', { name: '看看我們是否適合彼此' }).click()
      await page.waitForTimeout(120)
      const radios = page.locator('aside input[type=radio]')
      const n = await radios.count()
      for (let i = 0; i < n; i += 3) await radios.nth(i).check()
      const next = page.getByRole('button', { name: '繼續預約互動' })
      if (await next.isEnabled()) {
        await next.click()
        await page.waitForTimeout(120)
        await page.locator('#book-date').fill('2026-08-15')
        await page.getByRole('button', { name: '送出預約' }).click()
        await page.waitForTimeout(150)
        booked = (await page.locator('text=預約已送出').count()) > 0
      }
    }
  }

  const log = await page.evaluate(() => JSON.parse(localStorage.getItem('adopt.funnel.log') || '[]'))
  await ctx.close()
  return { completedQuiz, hasMidFeedback, sawCalibration, blocked, booked, trace, log }
}

const results = []
for (const p of PERSONAS) {
  for (const c of ['control', 'canary']) {
    const r = await runPersona(p, c)
    results.push({ persona: p, cohort: c, ...r })
  }
}

// ── 輸出 ──
console.log('\n=== Stage 0 金絲雀乾跑(N=5 Persona × 2 組)===\n')
console.log('Persona            組別    測驗    校準   阻力                    預約')
console.log('─'.repeat(84))
for (const r of results) {
  const name = r.persona.name.padEnd(16, '　').slice(0, 16)
  const c = (r.cohort === 'canary' ? '金絲雀' : '對照 ').padEnd(6)
  const q = (r.completedQuiz ? '完成' : '放棄').padEnd(6)
  const cal = (r.sawCalibration ? '有  ' : '無  ').padEnd(6)
  const b = (r.blocked ?? '—').padEnd(22, ' ').slice(0, 22)
  console.log(`${name} ${c} ${q} ${cal} ${b} ${r.booked ? '✔ 送出' : '✘ 未送出'}`)
}

const agg = (c) => {
  const rs = results.filter((r) => r.cohort === c)
  const booked = rs.filter((r) => r.booked)
  const longWaitAnimals = new Set(['yuki', 'oreo', 'hazel', 'nori'])
  return {
    quizCompletion: rs.filter((r) => r.completedQuiz).length / rs.length,
    bookings: booked.length,
    longWaitBookings: booked.filter((r) => longWaitAnimals.has(r.persona.animal)).length,
    uncalibrated: booked.filter((r) => !r.sawCalibration).length,
    blocked: rs.filter((r) => r.blocked).length,
  }
}
const ctrl = agg('control')
const can = agg('canary')
const pct = (v) => `${Math.round(v * 100)}%`

console.log('\n=== 匯總 ===')
console.log(`                        對照組    金絲雀組`)
console.log(`測驗完成率              ${pct(ctrl.quizCompletion).padStart(6)}    ${pct(can.quizCompletion).padStart(6)}`)
console.log(`送出預約數              ${String(ctrl.bookings).padStart(6)}    ${String(can.bookings).padStart(6)}`)
console.log(`其中久候動物(≥120天)   ${String(ctrl.longWaitBookings).padStart(6)}    ${String(can.longWaitBookings).padStart(6)}`)
console.log(`未經校準的預約(護欄)   ${String(ctrl.uncalibrated).padStart(6)}    ${String(can.uncalibrated).padStart(6)}`)
console.log(`被阻力擋下              ${String(ctrl.blocked).padStart(6)}    ${String(can.blocked).padStart(6)}`)

console.log('\n=== 埋點驗證 ===')
const allEvents = results.flatMap((r) => r.log.map((e) => e.e))
const uniq = [...new Set(allEvents)].sort()
console.log(`觸發的事件類型: ${uniq.join(', ')}`)
const canaryLogs = results.filter((r) => r.cohort === 'canary').flatMap((r) => r.log)
const controlLogs = results.filter((r) => r.cohort === 'control').flatMap((r) => r.log)
console.log(`分組標記正確: canary 事件全為 canary = ${canaryLogs.every((e) => e.c === 'canary')}`)
console.log(`             control 事件全為 control = ${controlLogs.every((e) => e.c === 'control')}`)
console.log(`longWait 旗標有被記錄 = ${canaryLogs.some((e) => e.longWait === true)}`)

// 匯出合併後的事件流,供儀表板載入與後續分析
if (process.env.EXPORT) {
  const merged = results.flatMap((r) => r.log)
  fs.writeFileSync(process.env.EXPORT, JSON.stringify(merged))
  console.log(`\n已匯出 ${merged.length} 筆事件 → ${process.env.EXPORT}`)
}

console.log(`\npage errors: ${errors.length ? errors.join(' ;; ') : 'none'}`)
await browser.close()
