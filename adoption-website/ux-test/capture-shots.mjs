// Capture before/after screenshots of every change made across the two UX rounds.
// before = commit 2bc54d9 (port 4174), after = current build (port 4173)
import { chromium } from 'playwright'
import fs from 'node:fs'

const OUT = process.env.SHOTS
fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

async function shot({ name, port, route, selector, text, mobile = false, pad = 12, prep }) {
  const ctx = await browser.newContext(
    mobile
      ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
      : { viewport: { width: 1240, height: 900 }, deviceScaleFactor: 2 },
  )
  const page = await ctx.newPage()
  await page.goto(`http://localhost:${port}/#${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(200)
  if (prep) await prep(page)
  let target = null
  if (text) {
    const loc = page.locator(`text=${text}`).first()
    if (await loc.count()) target = loc.locator('xpath=ancestor-or-self::*[self::section or self::div][1]')
  } else if (selector) {
    const loc = page.locator(selector).first()
    if (await loc.count()) target = loc
  }
  const file = `${OUT}/${name}.png`
  if (target && (await target.count())) {
    // 元素截圖會自動捲動到定位,不受首屏限制
    await target.scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    await target.screenshot({ path: file })
  } else {
    await page.screenshot({ path: file })
  }
  void pad
  const kb = Math.round(fs.statSync(file).size / 1024)
  console.log(`  ${name}.png  (${kb} KB)${target ? '' : '  [full page — target not found]'}`)
  await ctx.close()
}

const AFTER = 4173
const BEFORE = 4174

console.log('R1-1 結果頁文案(移除「不合格」)')
// 先跑完測驗以產生結果
const fillQuiz = async (page) => {
  await page.goto(`http://localhost:${page.__port}/#/quiz`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /開始測驗|繼續上次的測驗/ }).click()
  for (let i = 0; i < 12; i++) {
    const inputs = page.locator('form input[type=radio], form input[type=checkbox]')
    if (!(await inputs.count())) break
    // 選第 3 個選項讓結果落在「需準備」狀態
    const n = await inputs.count()
    await inputs.nth(Math.min(2, n - 1)).check()
    await page.getByRole('button', { name: /下一題|看我的結果/ }).click()
    await page.waitForTimeout(70)
    if (page.url().includes('result')) break
  }
  await page.waitForTimeout(200)
}
for (const [label, port] of [['before', BEFORE], ['after', AFTER]]) {
  const ctx = await browser.newContext({ viewport: { width: 1240, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.__port = port
  await fillQuiz(page)
  const loc = page.locator('text=生活準備建議').first()
  const box = (await loc.count()) ? await loc.locator('xpath=ancestor::div[1]').boundingBox() : null
  const headBox = await page.locator('h1').first().boundingBox()
  const y = headBox ? headBox.y - 60 : 0
  await page.screenshot({
    path: `${OUT}/r1-1-${label}.png`,
    clip: { x: 0, y: Math.max(0, y), width: 1240, height: box ? box.y + box.height - y + 20 : 420 },
  })
  console.log(`  r1-1-${label}.png`)
  await ctx.close()
}

console.log('R1-2 90 天支持:解除監視感(新增區塊)')
await shot({ name: 'r1-2-before', port: BEFORE, route: '/support-90', selector: 'main > section:first-of-type' })
await shot({ name: 'r1-2-after', port: AFTER, route: '/support-90', text: '先說清楚:這不是在盯著你' })

console.log('R1-3 信任頁:中途處境(新增區塊)')
await shot({ name: 'r1-3-after', port: AFTER, text: '我們這邊的實話', route: '/trust' })

console.log('R1-4 流程頁:房東與家人工具(新增區塊)')
await shot({ name: 'r1-4-after', port: AFTER, route: '/process', text: '卡住的通常不是你' })

console.log('R1-5 動物詳情:期待校準前置(新增區塊)')
await shot({ name: 'r1-5-before', port: BEFORE, route: '/animals/latte', text: '一起生活的真實樣貌' })
await shot({ name: 'r1-5-after', port: AFTER, route: '/animals/latte', text: '在你心動之前' })
await shot({ name: 'r1-5b-after', port: AFTER, route: '/animals/yuki', text: '在你心動之前' })

console.log('R1-6 測驗中途回饋(新增)')
for (const [label, port] of [['before', BEFORE], ['after', AFTER]]) {
  const ctx = await browser.newContext({ viewport: { width: 1240, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto(`http://localhost:${port}/#/quiz`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /開始測驗|繼續上次的測驗/ }).click()
  for (let i = 0; i < 6; i++) {
    const inputs = page.locator('form input[type=radio], form input[type=checkbox]')
    if (!(await inputs.count())) break
    await inputs.first().check()
    await page.getByRole('button', { name: /下一題|看我的結果/ }).click()
    await page.waitForTimeout(70)
  }
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${OUT}/r1-6-${label}.png`, clip: { x: 240, y: 60, width: 760, height: 560 } })
  console.log(`  r1-6-${label}.png`)
  await ctx.close()
}

console.log('R2-2 久候動物:等待天數 + 排序(新增)')
await shot({ name: 'r2-2-before', port: BEFORE, route: '/animals', selector: 'main article' })
await shot({ name: 'r2-2-after', port: AFTER, route: '/animals', selector: 'main article', prep: async (p) => {
  await p.locator('#f-sort').selectOption('waiting'); await p.waitForTimeout(250)
} })
await shot({ name: 'r2-2-sort', port: AFTER, route: '/animals', selector: '#f-sort', pad: 26 })

console.log('R2-3 同儕互助(新增區塊)')
await shot({ name: 'r2-3-after', port: AFTER, route: '/support-90', text: '其他認養人,通常比我們更快回你' })

console.log('R2-4 回報回饋(新增)')
await shot({ name: 'r2-4-after', port: AFTER, route: '/happiness', text: '回報一次,就有一張抽獎券' })

console.log('R2-5 合約雙向性(新增)')
await shot({ name: 'r2-5-after', port: AFTER, route: '/process', text: '合約是雙向的' })

console.log('行動版對照')
await shot({ name: 'mobile-after', port: AFTER, route: '/', mobile: true })

console.log('\n完成')
await browser.close()
