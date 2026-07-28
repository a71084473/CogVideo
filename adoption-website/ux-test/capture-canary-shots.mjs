// 擷取金絲雀相關修改的截圖。
// 對照組 = 九個旗標全關 = 兩輪優化前的狀態,因此 before/after 只需切換分組即可,
// 不必再建置舊版本。
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:4173/#'
const OUT = process.env.SHOTS
fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

async function ctxFor(cohort, width = 1160) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 })
  await ctx.addInitScript((c) => {
    try {
      localStorage.setItem('adopt.canary.override', c)
    } catch { /* 忽略 */ }
  }, cohort)
  return ctx
}

/** 同一頁面、兩組各拍一張 */
async function pair(name, route, opts = {}) {
  for (const cohort of ['control', 'canary']) {
    const ctx = await ctxFor(cohort, opts.width)
    const page = await ctx.newPage()
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(250)
    if (opts.prep) await opts.prep(page)
    const file = `${OUT}/c-${name}-${cohort}.png`
    if (opts.selector) {
      const loc = page.locator(opts.selector).first()
      if (await loc.count()) {
        await loc.scrollIntoViewIfNeeded()
        await page.waitForTimeout(150)
        await loc.screenshot({ path: file })
      } else {
        await page.screenshot({ path: file, clip: opts.clip })
      }
    } else {
      await page.screenshot({ path: file, clip: opts.clip, fullPage: opts.full })
    }
    const kb = Math.round(fs.statSync(file).size / 1024)
    console.log(`  c-${name}-${cohort}.png (${kb} KB)`)
    await ctx.close()
  }
}

console.log('分組對照:90 天支持頁(surveillanceRelief + extendTo180)')
await pair('support-top', '/support-90', { clip: { x: 0, y: 0, width: 1160, height: 620 } })

console.log('分組對照:支持時間軸長度(90 天 vs 180 天)')
await pair('timeline', '/support-90', { selector: 'main ol' })

console.log('分組對照:信任頁(fosterCandor)')
await pair('trust', '/trust', { clip: { x: 0, y: 300, width: 1160, height: 700 } })

console.log('分組對照:流程頁(thirdPartyTools)')
await pair('process', '/process', {
  prep: async (p) => {
    const t = p.locator('text=關於「居家安全確認與改善協助」').first()
    await t.scrollIntoViewIfNeeded()
    await p.waitForTimeout(200)
  },
  clip: { x: 0, y: 60, width: 1160, height: 700 },
})

console.log('分組對照:動物詳情(expectationCalibration)')
await pair('calib', '/animals/latte', {
  prep: async (p) => {
    const t = p.locator('text=牠的故事').first()
    await t.scrollIntoViewIfNeeded()
    await p.waitForTimeout(200)
  },
  clip: { x: 0, y: 60, width: 1160, height: 640 },
})

console.log('分組對照:探索頁卡片與排序(waitingVisibility)')
await pair('waiting', '/animals', {
  prep: async (p) => {
    await p.waitForTimeout(200)
  },
  clip: { x: 300, y: 120, width: 860, height: 700 },
})

console.log('分組對照:幸福回報(reportIncentive)')
await pair('incentive', '/happiness', { clip: { x: 0, y: 120, width: 700, height: 780 } })

console.log('分組對照:測驗第 7 題(midQuizFeedback)')
for (const cohort of ['control', 'canary']) {
  const ctx = await ctxFor(cohort)
  const page = await ctx.newPage()
  await page.goto(BASE + '/quiz', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /開始測驗|繼續上次的測驗/ }).click()
  for (let i = 0; i < 6; i++) {
    const inputs = page.locator('form input[type=radio], form input[type=checkbox]')
    if (!(await inputs.count())) break
    await inputs.first().check()
    await page.getByRole('button', { name: /下一題|看我的結果/ }).click()
    await page.waitForTimeout(70)
  }
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${OUT}/c-quiz-${cohort}.png`, clip: { x: 180, y: 60, width: 800, height: 470 } })
  console.log(`  c-quiz-${cohort}.png`)
  await ctx.close()
}

console.log('儀表板(載入 Stage 0 實測事件)')
{
  const log = JSON.parse(fs.readFileSync(process.env.EVENTS, 'utf8'))
  const ctx = await browser.newContext({ viewport: { width: 1240, height: 1000 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto(BASE + '/canary', { waitUntil: 'networkidle' })
  await page.evaluate((l) => localStorage.setItem('adopt.funnel.log', JSON.stringify(l)), log)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  const shots = [
    ['dash-stages', 'text=發布階段'],
    ['dash-guardrail', 'text=護欄'],
    ['dash-funnel', 'text=分組漏斗'],
    ['dash-ratios', 'text=關鍵比率'],
    ['dash-flags', 'text=你這一組生效中的旗標'],
  ]
  for (const [name, sel] of shots) {
    const h = page.locator(sel).first()
    await h.scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    const box = await h.boundingBox()
    if (box) {
      await page.screenshot({
        path: `${OUT}/${name}.png`,
        clip: { x: 30, y: Math.max(0, box.y - 10), width: 1180, height: name === 'dash-stages' ? 420 : name === 'dash-flags' ? 130 : 330 },
      })
      console.log(`  ${name}.png`)
    }
  }
  await ctx.close()
}

console.log('\n完成')
await browser.close()
