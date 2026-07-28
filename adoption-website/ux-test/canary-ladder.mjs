// 策略階梯金絲雀:逐階測量「久候動物領養率」
//
// 每一階只新增一根槓桿,分別跑對照組與金絲雀組,觀察久候動物在
// 曝光 → 瀏覽 → 預約 三段的占比變化。這樣才能歸因是哪一根槓桿造成的。
//
// Persona 的選擇偏好來自訪談與市場報告:
//   訪談「橘白貓最搶手,玳瑁真的不太好送」+ 報告「容易被領養的動物先被帶走」
//   → 使用者預設會挑列表前面、外型討喜、年輕健康的動物。
// 因此 Persona 不會主動去找久候動物,除非網站改變了他看到的東西。

import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:4173/#'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const errors = []

// 久候動物(≥120 天):拿鐵 188、海苔 121、雪見 243、榛果 164、奧利歐 209
const LONG_WAIT = new Set(['latte', 'nori', 'yuki', 'hazel', 'oreo'])

const PERSONAS = [
  { id: 'P1', name: '小昀・新手',     pickRank: 1, willAcceptLongWait: false, needsSupportToAccept: true },
  { id: 'P2', name: '阿哲・上班族',   pickRank: 1, willAcceptLongWait: true,  needsSupportToAccept: false },
  { id: 'P3', name: '宜庭・共感型',   pickRank: 2, willAcceptLongWait: true,  needsSupportToAccept: false },
  { id: 'P4', name: '至凱・有幼兒',   pickRank: 1, willAcceptLongWait: false, needsSupportToAccept: true },
  { id: 'P5', name: 'Wendy・回流者',  pickRank: 1, willAcceptLongWait: false, needsSupportToAccept: true },
]

async function run(persona, cohort, stageId) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await ctx.addInitScript(
    ([c, s]) => {
      try {
        localStorage.setItem('adopt.canary.override', c)
        localStorage.setItem('adopt.canary.stage', String(s))
      } catch { /* 忽略 */ }
    },
    [cohort, stageId],
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(`${persona.id}/${cohort}/S${stageId}: ${e.message}`))

  await page.goto(BASE + '/animals', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)

  // 使用者只看列表前段,依 pickRank 挑一隻——不會自己去改排序
  const cards = page.locator('main article')
  const n = await cards.count()
  const idx = Math.min(persona.pickRank, Math.max(0, n - 1))
  const link = cards.nth(idx).locator('a[href*="/animals/"]')
  const href = await link.getAttribute('href')
  const animalId = href.split('/animals/')[1]
  const isLongWait = LONG_WAIT.has(animalId)

  await link.click()
  await page.waitForTimeout(350)

  // 是否願意送出預約
  let willBook = true
  if (isLongWait && !persona.willAcceptLongWait) {
    // 看到久候動物但本來不接受;若有支持包(第四階)則改變主意
    const hasSupport = (await page.locator('text=所以我們多做了這些').count()) > 0
    willBook = persona.needsSupportToAccept && hasSupport
  }

  let booked = false
  if (willBook) {
    const cta = page.getByRole('button', { name: '看看我們是否適合彼此' })
    if (await cta.count()) {
      await cta.click()
      await page.waitForTimeout(150)
      const radios = page.locator('aside input[type=radio]')
      const rn = await radios.count()
      for (let i = 0; i < rn; i += 3) await radios.nth(i).check()
      const next = page.getByRole('button', { name: '繼續預約互動' })
      if ((await next.count()) && (await next.isEnabled())) {
        await next.click()
        await page.waitForTimeout(150)
        await page.locator('#book-date').fill('2026-08-15')
        await page.getByRole('button', { name: '送出預約' }).click()
        await page.waitForTimeout(200)
        booked = (await page.locator('text=預約已送出').count()) > 0
      }
    }
  }

  const log = await page.evaluate(() => JSON.parse(localStorage.getItem('adopt.funnel.log') || '[]'))
  await ctx.close()
  return { animalId, isLongWait, booked, log }
}

const STAGE_NAMES = {
  1: '信任與摩擦',
  2: '久候曝光(被動)',
  3: '久候媒合(主動)',
  4: '久候門檻(降低成本)',
}

const allLogs = []
const summary = []

for (const stageId of [1, 2, 3, 4]) {
  const row = { stageId, name: STAGE_NAMES[stageId] }
  for (const cohort of ['control', 'canary']) {
    const rs = []
    for (const p of PERSONAS) rs.push(await run(p, cohort, stageId))
    allLogs.push(...rs.flatMap((r) => r.log))
    const booked = rs.filter((r) => r.booked)
    row[cohort] = {
      picks: rs.map((r) => r.animalId),
      longWaitPicks: rs.filter((r) => r.isLongWait).length,
      bookings: booked.length,
      longWaitBookings: booked.filter((r) => r.isLongWait).length,
    }
  }
  summary.push(row)
}

// ── 輸出 ──
console.log('\n═══ 策略階梯金絲雀:久候動物領養率 ═══\n')
console.log('每階 5 位 Persona × 2 組。久候動物 = 等待 ≥120 天(拿鐵/海苔/雪見/榛果/奧利歐)\n')

const bar = (v, total) => {
  if (!total) return '—'
  const n = Math.round((v / total) * 10)
  return '█'.repeat(n) + '░'.repeat(10 - n) + ` ${Math.round((v / total) * 100)}%`
}

for (const r of summary) {
  console.log(`── Stage ${r.stageId} ${r.name} ─────────────────────────────`)
  for (const c of ['control', 'canary']) {
    const d = r[c]
    const label = c === 'canary' ? '金絲雀' : '對照 '
    console.log(`  ${label}  瀏覽到久候 ${d.longWaitPicks}/5  預約 ${d.bookings}  其中久候 ${d.longWaitBookings}`)
    console.log(`         久候預約占比 ${bar(d.longWaitBookings, d.bookings)}`)
    console.log(`         挑到的動物: ${d.picks.join(', ')}`)
  }
  console.log('')
}

console.log('═══ 階梯效果彙整(金絲雀組)═══\n')
console.log('階段                    瀏覽到久候   預約數   久候預約   久候占比')
console.log('─'.repeat(70))
for (const r of summary) {
  const d = r.canary
  const share = d.bookings ? `${Math.round((d.longWaitBookings / d.bookings) * 100)}%` : '—'
  console.log(
    `S${r.stageId} ${r.name.padEnd(18, '　').slice(0, 18)}` +
      `${String(d.longWaitPicks).padStart(6)}/5` +
      `${String(d.bookings).padStart(9)}` +
      `${String(d.longWaitBookings).padStart(9)}` +
      `${share.padStart(10)}`,
  )
}

console.log('\n═══ 對照組(全程不變,作為基準)═══')
const c1 = summary[0].control
console.log(`  瀏覽到久候 ${c1.longWaitPicks}/5  預約 ${c1.bookings}  久候預約 ${c1.longWaitBookings}`)

if (process.env.EXPORT) {
  fs.writeFileSync(process.env.EXPORT, JSON.stringify(allLogs))
  console.log(`\n已匯出 ${allLogs.length} 筆事件 → ${process.env.EXPORT}`)
}
console.log(`\npage errors: ${errors.length ? errors.slice(0, 3).join(' ;; ') : 'none'}`)
await browser.close()
