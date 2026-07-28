// Round 2 — verify Round 1 fixes, then probe deeper for residual intent-killers.
import { chromium } from 'playwright'

const BASE = 'http://localhost:4173/#'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const errors = []
const squash = (s) => (s || '').replace(/\s+/g, ' ').trim()

async function page$(mobile = false) {
  const ctx = await browser.newContext(
    mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 900 } },
  )
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errors.push(e.message))
  return p
}
async function bodyOf(p, route) {
  await p.goto(BASE + route, { waitUntil: 'networkidle' })
  await p.waitForTimeout(120)
  return squash(await p.locator('main').textContent())
}
function audit(name, body, checks) {
  const rows = Object.entries(checks).map(([label, kw]) => {
    const hit = Array.isArray(kw) ? kw.some((k) => body.includes(k)) : body.includes(kw)
    return `    ${hit ? 'PASS' : 'FAIL'} ${label}`
  })
  console.log(`  ${name}\n${rows.join('\n')}`)
}

console.log('=== ROUND 2: verify Round 1 fixes ===')
{
  const p = await page$()
  // 每頁唯一 H1
  const routes = ['/', '/animals', '/quiz', '/process', '/dashboard', '/support-90', '/crisis', '/happiness', '/get-involved', '/trust']
  const h1report = []
  for (const r of routes) {
    await p.goto(BASE + r, { waitUntil: 'networkidle' })
    const n = await p.locator('h1').count()
    const t = n ? squash(await p.locator('h1').first().textContent()) : '(無)'
    h1report.push(`${r} → ${n} 個 H1「${t.slice(0, 16)}」${n === 1 ? '' : '  ⚠'}`)
  }
  console.log('  H1 檢查:\n    ' + h1report.join('\n    '))

  audit('R1-1 結果頁不再出現「不合格」字面', await bodyOf(p, '/quiz/result'), {
    '無「不合格」': { includes: () => false } && '不合格',
  })
  const qr = await bodyOf(p, '/quiz/result')
  console.log(`    ${qr.includes('不合格') ? 'FAIL' : 'PASS'} 結果頁未出現「不合格」`)

  audit('R1-2 90 天支持解除監視感', await bodyOf(p, '/support-90'), {
    '系統提醒不是人催': '系統提醒你,不是人來催你',
    '誰看得到': '只有中途團隊看得到',
    '可調頻率/暫停': ['低頻或暫停'],
    '一句話就夠': '一句話就夠',
  })
  audit('R1-3 中途處境揭露', await bodyOf(p, '/trust'), {
    '沒有公權力的坦白': '沒有公權力',
    '怕重來一次': ['退養', '第二次找家'],
    '小團隊會慢': ['回覆可能會慢', '小團隊'],
    '你有拒絕的權利': '你有拒絕的權利',
  })
  audit('R1-4 房東/家人工具', await bodyOf(p, '/process'), {
    '給房東的說明': '給房東的說明',
    '給家人的說明': '給同住家人的說明',
    '三方對談': '三方',
  })
  audit('R1-5 期待校準前置於詳情頁', await bodyOf(p, '/animals/latte'), {
    '校準區塊': '在你心動之前',
    '慢熟專屬提問': ['不主動靠近', '不讓你抱'],
    '故事vs日常自問': '是牠的故事,還是',
  })
  const yuki = await bodyOf(p, '/animals/yuki')
  audit('R1-5b 校準隨動物而異(雪見:老+慢性病)', yuki, {
    '餵藥日常': '每天固定餵藥',
    '熟齡壽命誠實': ['不是十五年', '熟齡'],
  })
  await p.context().close()
}

// R1-7 測驗中途回饋
{
  const p = await page$()
  await p.goto(BASE + '/quiz', { waitUntil: 'networkidle' })
  await p.getByRole('button', { name: /開始測驗|繼續上次的測驗/ }).click()
  let sawMidReward = false
  let rewardText = ''
  for (let i = 0; i < 12; i++) {
    const inputs = p.locator('form input[type=radio], form input[type=checkbox]')
    if (!(await inputs.count())) break
    if (await p.locator('text=已經看得出方向了').count()) {
      sawMidReward = true
      if (!rewardText) rewardText = squash(await p.locator('text=已經看得出方向了').locator('..').textContent())
    }
    await inputs.first().check()
    await p.getByRole('button', { name: /下一題|看我的結果/ }).click()
    await p.waitForTimeout(80)
    if (p.url().includes('result')) break
  }
  console.log(`  R1-7 測驗中途回饋\n    ${sawMidReward ? 'PASS' : 'FAIL'} 走到一半有初步結果`)
  console.log(`    內容: ${rewardText.slice(0, 90)}`)
  await p.context().close()
}

console.log('\n=== ROUND 2: 新探測(第一輪未觸及) ===')
{
  const p = await page$()

  // A. 難送動物是否被平台補償(訪談4:玳瑁/黑貓/成貓最難送)
  const animalsBody = await bodyOf(p, '/animals')
  console.log('  A. 等待時間 / 難送動物')
  console.log(`    ${animalsBody.includes('等待') && /等了|等待 \d/.test(animalsBody) ? 'PASS' : 'FAIL'} 卡片顯示已等待多久`)
  console.log(`    ${animalsBody.includes('排序') ? 'PASS' : 'FAIL'} 提供排序(可讓久候者浮上來)`)

  // B. 同儕互助(訪談4:認養人群組互相回答)
  const dash = await bodyOf(p, '/dashboard')
  const s90 = await bodyOf(p, '/support-90')
  console.log('  B. 同儕互助')
  console.log(`    ${(dash + s90).includes('其他認養人') || (dash + s90).includes('認養人社群') ? 'PASS' : 'FAIL'} 有認養人彼此支援的入口`)

  // C. 回報誘因(訪談2:回報一次一張抽獎券)
  const happy = await bodyOf(p, '/happiness')
  console.log('  C. 回報回饋機制')
  console.log(`    ${/抽獎|回饋|獎品/.test(happy) ? 'PASS' : 'FAIL'} 回報有正向回饋`)

  // D. 合約的保護性說明(訪談3:簽合約之後都變乖了)
  const proc = await bodyOf(p, '/process')
  console.log('  D. 合約')
  console.log(`    ${/合約.*保護|保障你|雙向/.test(proc) ? 'PASS' : 'FAIL'} 說明合約保護誰`)

  // E. 空狀態(實際觸發:篩到沒有結果)
  await p.goto(BASE + '/animals', { waitUntil: 'networkidle' })
  await p.locator('#f-species').selectOption('dog')
  await p.locator('#f-beginner').check()
  await p.locator('#f-medical').selectOption('ok')
  await p.locator('#f-space').selectOption('小套房可')
  await p.waitForTimeout(200)
  const emptyTxt = squash(await p.locator('main').textContent())
  const isEmpty = emptyTxt.includes('目前沒有完全符合的夥伴')
  console.log('  E. 空狀態')
  console.log(`    ${isEmpty ? 'PASS' : 'FAIL'} 觸發空狀態`)
  console.log(`    ${isEmpty && emptyTxt.includes('放寬') ? 'PASS' : 'FAIL'} 給出可執行的調整建議`)
  console.log(`    ${emptyTxt.includes('通知') ? 'PASS' : 'FAIL'} 提供「有新夥伴時通知我」`)

  // F. 收藏後是否有下一步(避免收藏即終點)
  await p.goto(BASE + '/animals', { waitUntil: 'networkidle' })
  await p.locator('button[aria-label^="收藏"]').first().click()
  await p.waitForTimeout(150)
  const afterFav = squash(await p.locator('main').textContent())
  console.log('  F. 收藏後')
  console.log(`    ${afterFav.includes('已收藏') || afterFav.includes('我的進度') ? 'PASS' : 'FAIL'} 收藏後有明確回饋/下一步`)

  // G. 行動版:主要 CTA 是否在首屏
  const m = await page$(true)
  await m.goto(BASE + '/', { waitUntil: 'networkidle' })
  const ctaBox = await m.getByRole('link', { name: '開始生活適配測驗' }).boundingBox()
  console.log('  G. 行動版首屏')
  console.log(`    ${ctaBox && ctaBox.y < 844 ? 'PASS' : 'FAIL'} 主 CTA 在首屏內 (y=${ctaBox ? Math.round(ctaBox.y) : 'n/a'})`)
  await m.screenshot({ path: process.env.SCRATCH + '/r2-mobile.png' })
  await m.context().close()
  await p.context().close()
}

console.log(`\n=== page errors: ${errors.length ? errors.join(' ;; ') : 'none'}`)
await browser.close()
