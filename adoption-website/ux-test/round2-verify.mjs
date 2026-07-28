// Final verification of Round 2 fixes.
import { chromium } from 'playwright'
const BASE = 'http://localhost:4173/#'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const errors = []
const squash = (s) => (s || '').replace(/\s+/g, ' ').trim()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const p = await ctx.newPage()
p.on('pageerror', (e) => errors.push(e.message))
const say = (ok, label) => console.log(`  ${ok ? 'PASS' : 'FAIL'} ${label}`)

// H1 完整性
const routes = ['/', '/animals', '/animals/mochi', '/quiz', '/quiz/result', '/process', '/dashboard', '/support-90', '/crisis', '/happiness', '/get-involved', '/trust']
console.log('R2-1 每頁唯一 H1')
for (const r of routes) {
  await p.goto(BASE + r, { waitUntil: 'networkidle' })
  const n = await p.locator('h1').count()
  say(n === 1, `${r} (${n} 個)`)
}
// quiz 作答中畫面也要有 H1
await p.goto(BASE + '/quiz', { waitUntil: 'networkidle' })
await p.getByRole('button', { name: /開始測驗|繼續上次的測驗/ }).click()
await p.waitForTimeout(150)
say((await p.locator('h1').count()) === 1, '/quiz 作答中畫面有 H1')

console.log('\nR2-2 久候動物可見度')
await p.goto(BASE + '/animals', { waitUntil: 'networkidle' })
let body = squash(await p.locator('main').textContent())
say(/已在中途之家等待 \d+ 天/.test(body), '卡片顯示等待天數')
say((await p.locator('#f-sort').count()) === 1, '提供排序控制')
await p.locator('#f-sort').selectOption('waiting')
await p.waitForTimeout(200)
const firstName = squash(await p.locator('main h3').first().textContent())
say(firstName.includes('雪見'), `等待最久者排最前(實際:${firstName.split(' ')[0]})`)
say(!body.includes('再不領養'), '未使用倒數/賣慘話術')

console.log('\nR2-3 同儕互助')
body = squash(await (await p.goto(BASE + '/support-90', { waitUntil: 'networkidle' }), p.locator('main')).textContent())
say(body.includes('其他認養人'), '有認養人彼此支援區塊')
say(body.includes('可以只看不說話'), '說明可低度參與/可退出')

console.log('\nR2-4 回報回饋')
body = squash(await (await p.goto(BASE + '/happiness', { waitUntil: 'networkidle' }), p.locator('main')).textContent())
say(body.includes('抽獎券'), '回報有正向回饋')
say(body.includes('這是謝謝,不是條件'), '明示不回報也無影響')
say(body.includes('尚未實際開放'), '誠實標示為示意')

console.log('\nR2-5 合約雙向性')
body = squash(await (await p.goto(BASE + '/process', { waitUntil: 'networkidle' }), p.locator('main')).textContent())
say(body.includes('合約是雙向的'), '說明合約保護雙方')
say(body.includes('我們一定接回'), '載明中途的義務')
say(body.includes('不留存影本'), '證件處理方式透明')

console.log('\n迴歸:第一輪修正仍在')
for (const [route, kw, label] of [
  ['/trust', '你有拒絕的權利', '中途處境揭露'],
  ['/support-90', '系統提醒你,不是人來催你', '解除監視感'],
  ['/process', '給房東的說明', '房東工具'],
  ['/animals/latte', '在你心動之前', '期待校準'],
]) {
  await p.goto(BASE + route, { waitUntil: 'networkidle' })
  say(squash(await p.locator('main').textContent()).includes(kw), `${label} (${route})`)
}
const qr = squash(await (await p.goto(BASE + '/quiz/result', { waitUntil: 'networkidle' }), p.locator('main')).textContent())
say(!qr.includes('不合格'), '結果頁無「不合格」字面')

// 收藏回饋(修正上一輪的測試 bug:強制重載)
await p.goto(BASE + '/animals', { waitUntil: 'networkidle' })
await p.reload({ waitUntil: 'networkidle' })
const favBtn = p.locator('button[aria-label^="收藏"]').first()
say((await favBtn.count()) > 0, '探索頁有收藏按鈕')
if (await favBtn.count()) {
  await favBtn.click()
  await p.waitForTimeout(150)
  say((await p.locator('button[aria-label^="取消收藏"]').count()) > 0, '收藏狀態即時切換')
}

await p.screenshot({ path: process.env.SCRATCH + '/final-animals.png', fullPage: false })
console.log(`\npage errors: ${errors.length ? errors.join(' ;; ') : 'none'}`)
await browser.close()
