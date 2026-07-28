// Persona-based UX probe — captures what a visitor actually sees at each decision point.
import { chromium } from 'playwright'

const BASE = 'http://localhost:4173/#'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

const errors = []
async function newPage(mobile = false) {
  const ctx = await browser.newContext(
    mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 900 } },
  )
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(e.message))
  return page
}

const squash = (s) => (s || '').replace(/\s+/g, ' ').trim()

async function probe(page, route, label) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  await page.waitForTimeout(120)
  const h1 = squash(await page.locator('h1').first().textContent().catch(() => ''))
  const ctas = await page.locator('main a, main button').evaluateAll((els) =>
    els.slice(0, 14).map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean),
  )
  const body = squash(await page.locator('main').textContent().catch(() => ''))
  console.log(`\n--- [${label}] ${route}`)
  console.log(`H1: ${h1}`)
  console.log(`CTA: ${ctas.slice(0, 8).join(' | ')}`)
  return body
}

// keyword audit against interview-derived requirements
function audit(name, body, checks) {
  console.log(`  AUDIT ${name}:`)
  for (const [label, kw] of Object.entries(checks)) {
    const hit = Array.isArray(kw) ? kw.some((k) => body.includes(k)) : body.includes(kw)
    console.log(`    ${hit ? 'HIT ' : 'MISS'} ${label}`)
  }
}

// ============ P1 表單逃跑者:能否撐過測驗 ============
{
  const page = await newPage()
  const home = await probe(page, '/', 'P1 home')
  audit('首頁承諾', home, {
    '說明題數/時間成本': ['5–10 分鐘', '5-10 分鐘'],
    '新手安心承諾': '你不需要一開始什麼都會',
    '可儲存續填': ['隨時儲存', '續填'],
  })

  const quizIntro = await probe(page, '/quiz', 'P1 quiz intro')
  audit('測驗前說明', quizIntro, {
    '揭露總題數': '12 題',
    '否認淘汰': ['通過或淘汰', '不是考試'],
    '資料用途': ['你的資料如何被使用', '瀏覽器'],
  })

  // 走完測驗,記錄每題的「為什麼要問」是否存在
  await page.getByRole('button', { name: /開始測驗|繼續上次的測驗/ }).click()
  let step = 0
  const missingWhy = []
  const questions = []
  while (step < 15) {
    const legend = squash(await page.locator('form legend').first().textContent().catch(() => ''))
    if (!legend) break
    questions.push(legend)
    const hasWhy = (await page.locator('text=為什麼要問這題').count()) > 0
    if (!hasWhy) missingWhy.push(legend)
    const inputs = page.locator('form input[type=radio], form input[type=checkbox]')
    if ((await inputs.count()) === 0) break
    await inputs.first().check()
    await page.getByRole('button', { name: /下一題|看我的結果/ }).click()
    await page.waitForTimeout(90)
    step++
    if (page.url().includes('result')) break
  }
  console.log(`  測驗題數實走: ${step}`)
  console.log(`  缺少「為什麼要問」的題: ${missingWhy.length === 0 ? '無' : missingWhy.join(', ')}`)
  console.log(`  題目: ${questions.map((q, i) => `${i + 1}.${q.slice(0, 14)}`).join(' / ')}`)

  const result = await probe(page, '/quiz/result', 'P1 result')
  audit('結果頁', result, {
    '非人格評分聲明': '不是人格評分',
    '無淘汰字眼': '不合格',
    '有推薦動物': '依你的生活推薦',
  })
  await page.context().close()
}

// ============ P2 隱私敏感者:找監視感訊號 ============
{
  const page = await newPage()
  const s90 = await probe(page, '/support-90', 'P2 90天支持')
  audit('90天支持', s90, {
    '系統提醒而非人催': ['系統提醒', '不是人來'],
    '可調整頻率/退出': ['可以調整', '不想回報', '自主'],
    '說明資料誰看得到': ['僅中途', '只有中途'],
  })

  const happy = await probe(page, '/happiness', 'P2 幸福回報')
  audit('幸福回報', happy, {
    '匿名公開': ['不會顯示你的姓名'],
    '一年後降頻': ['滿一年', '自主回報'],
    '系統提醒': '系統',
    '回報誘因/回饋': ['抽獎', '回饋', '獎'],
  })

  const trust = await probe(page, '/trust', 'P2 信任頁')
  audit('信任透明', trust, {
    '不建黑名單': '黑名單',
    '不販售資料': '不販售',
    '可刪除資料': ['刪除'],
    '中途自身處境揭露': ['中途也', '我們的處境', '中途的難處'],
  })
  await page.context().close()
}

// ============ P3 共感型:動物頁真實揭露 ============
{
  const page = await newPage()
  const detail = await probe(page, '/animals/latte', 'P3 拿鐵(慢熟)')
  audit('動物詳情', detail, {
    '可能不適合': '可能不適合',
    '每月支出': '每月預估支出',
    '期待校準': ['三個月', '不主動靠近'],
    '中途支持': '中途可以提供的支持',
  })

  const pair = await probe(page, '/animals/tofu', 'P3 豆腐(需成對)')
  audit('成對認養說明', pair, {
    '標示需成對': '成對',
    '解釋為何成對(社會化)': ['社會化', '互相學習', '咬', '分開時會焦慮'],
    '雙倍成本揭露': ['兩隻', '兩倍'],
  })
  await page.context().close()
}

// ============ P4 家庭決策者 ============
{
  const page = await newPage()
  const proc = await probe(page, '/process', 'P4 流程')
  audit('流程頁', proc, {
    '家訪改名': '居家安全確認與改善協助',
    '同住者一起參與': ['同住者', '家人'],
    '說服家人的工具': ['溝通指南', '說服', '家人反對'],
  })
  const crisis = await probe(page, '/crisis', 'P4 危機')
  audit('危機頁', crisis, {
    '家人反對情境': '家人或伴侶反對',
    '不得私下轉送': ['不要私下轉送', '不得私下轉送'],
    '搬家情境': '搬家',
  })
  await page.context().close()
}

// ============ P5 戒心回流者 + 行動版 ============
{
  const page = await newPage(true)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  const bottomNav = await page.locator('nav[aria-label="行動版導覽"] a').allTextContents()
  console.log(`\n--- [P5 mobile] 底部導覽: ${bottomNav.map(squash).join(' | ')}`)
  // 首屏可見內容
  const aboveFold = squash(
    await page.evaluate(() => {
      const el = document.querySelector('main')
      return el ? el.innerText.slice(0, 260) : ''
    }),
  )
  console.log(`首屏文字: ${aboveFold.slice(0, 200)}`)
  const animals = await probe(page, '/animals', 'P5 探索頁')
  audit('探索頁', animals, {
    '為什麼可能適合你': '為什麼可能適合你',
    '照護難度標示': ['需要耐心', '特殊照護'],
    '空狀態建議': ['放寬'],
  })
  await page.screenshot({ path: process.env.SCRATCH + '/r1-mobile-home.png', fullPage: false })
  await page.context().close()
}

console.log(`\n=== page errors: ${errors.length ? errors.join(' ;; ') : 'none'}`)
await browser.close()
