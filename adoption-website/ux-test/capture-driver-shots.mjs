// 擷取七個滿意度驅動因子在網站上的實際畫面。
// 對照組(旗標全關)= 現況市場的體驗;金絲雀組 = 本平台的設計。
// 拍的正是模擬中被檢測的那一塊 UI。
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:4173/#'
const OUT = process.env.SHOTS
fs.mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

async function shot(name, { cohort = 'canary', stage = 4, route, anchor, y = 80, h = 560, w = 1160, quizSteps }) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 })
  await ctx.addInitScript(
    ([c, s]) => {
      try {
        localStorage.setItem('adopt.canary.override', c)
        localStorage.setItem('adopt.canary.stage', String(s))
      } catch { /* 忽略 */ }
    },
    [cohort, stage],
  )
  const p = await ctx.newPage()
  await p.goto(BASE + route, { waitUntil: 'networkidle' })
  await p.waitForTimeout(280)

  if (quizSteps) {
    await p.getByRole('button', { name: /開始測驗|繼續上次的測驗/ }).click()
    for (let i = 0; i < quizSteps; i++) {
      const inp = p.locator('form input[type=radio], form input[type=checkbox]')
      if (!(await inp.count())) break
      await inp.first().check()
      await p.getByRole('button', { name: /下一題|看我的結果/ }).click()
      await p.waitForTimeout(70)
    }
    await p.waitForTimeout(200)
  }

  if (anchor) {
    await p.evaluate((t) => {
      const el = [...document.querySelectorAll('h1,h2,h3,p,strong')].find((n) => n.textContent.includes(t))
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'instant' })
    }, anchor)
    await p.waitForTimeout(280)
  }

  await p.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y, width: w, height: h } })
  console.log(`  ${name}.png`)
  await ctx.close()
}

// D1 不被審判 —— 信任頁「我們這邊的實話」
console.log('D1 不被審判')
await shot('d1-off', { cohort: 'control', route: '/trust', anchor: '願意使用 90 天支持', h: 600 })
await shot('d1-on', { route: '/trust', anchor: '願意使用 90 天支持', h: 600 })

// D2 資訊完整可判斷 —— 動物頁「可能不適合」與支出揭露(兩組皆有)
console.log('D2 資訊完整可判斷')
await shot('d2-both', { route: '/animals/yuki', anchor: '適合的生活', h: 620 })

// D3 不被監視 —— 90 天支持頁頂端
console.log('D3 不被監視')
await shot('d3-off', { cohort: 'control', route: '/support-90', y: 40, h: 470 })
await shot('d3-on', { route: '/support-90', y: 40, h: 560 })

// D4 流程不繁瑣 —— 測驗第 7 題
console.log('D4 流程不繁瑣')
await shot('d4-off', { cohort: 'control', route: '/quiz', quizSteps: 6, y: 60, h: 470, w: 980 })
await shot('d4-on', { route: '/quiz', quizSteps: 6, y: 60, h: 470, w: 980 })

// D5 遇到問題有人幫 —— 危機頁(兩組皆有)
console.log('D5 遇到問題有人幫')
await shot('d5-both', { route: '/crisis', y: 40, h: 640 })

// D6 負擔得起 —— 久候動物支持包(僅 S4)
console.log('D6 負擔得起')
await shot('d6-off', { stage: 3, route: '/animals/oreo', anchor: '一起生活的真實樣貌', h: 520 })
await shot('d6-on', { stage: 4, route: '/animals/oreo', anchor: '一起生活的真實樣貌', h: 600 })

// D7 說得動家人房東 —— 流程頁
console.log('D7 說得動家人房東')
await shot('d7-off', { cohort: 'control', route: '/process', anchor: '認養後 90 天陪伴', y: 250, h: 560 })
await shot('d7-on', { route: '/process', anchor: '認養後 180 天陪伴', y: 250, h: 620 })

console.log('\n完成')
await b.close()
