// 自主優化迴圈:以 adoption_rate 為目標函數的 A/B 迭代
//
// ── 量測策略 ──
// 真實使用者拿不到,因此採兩段式:
//   1) 用 Playwright 對執行中的網站量測「結構事實」(必經步驟數、
//      各摩擦緩解元件是否存在),這部分是實測。
//   2) 以這些結構事實校準每一步的續行機率,再做 Monte Carlo 產生
//      足夠樣本做統計檢定。
//
// ── 必須誠實面對的一點 ──
// 合成樣本算出的 p 值,量的是「模型的變異」,不是真實世界的證據。
// 它能驗證管線、比較變體的相對邏輯,不能證明真實效果量。

import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:4173/#'
const GOAL_ADOPTION_RATE = 0.30
const MAX_ITERATIONS = 6
const MIN_SAMPLE_SIZE = 2000 // 每組
const SEED = 20260728

// ── 可重現的偽亂數 ──
let _s = SEED
const rnd = () => {
  _s = (_s * 1664525 + 1013904223) % 4294967296
  return _s / 4294967296
}

// ── Persona 組成(沿用訪談推導的權重,見 market-response.mjs)──
const PERSONAS = [
  { id: 'P1', name: '可培育新手', share: 0.28, patience: 0.55, needsAffordable: 0.35, needsThirdParty: 0.20, needsTrust: 0.45 },
  { id: 'P2', name: '隱私敏感', share: 0.18, patience: 0.70, needsAffordable: 0.25, needsThirdParty: 0.25, needsTrust: 0.75 },
  { id: 'P3', name: '共感陪伴', share: 0.22, patience: 0.75, needsAffordable: 0.55, needsThirdParty: 0.20, needsTrust: 0.35 },
  { id: 'P4', name: '家庭決策', share: 0.20, patience: 0.60, needsAffordable: 0.40, needsThirdParty: 0.80, needsTrust: 0.40 },
  { id: 'P5', name: '戒心回流', share: 0.12, patience: 0.50, needsAffordable: 0.30, needsThirdParty: 0.20, needsTrust: 0.85 },
]

// ── 對真實網站量測結構事實 ──
async function probeSite(browser, config) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await ctx.addInitScript(([c, s]) => {
    try {
      localStorage.setItem('adopt.canary.override', c)
      localStorage.setItem('adopt.canary.stage', String(s))
    } catch { /* 忽略 */ }
  }, [config.cohort ?? 'canary', config.stage ?? 4])
  const p = await ctx.newPage()

  // 測驗必經題數
  await p.goto(BASE + '/quiz', { waitUntil: 'networkidle' })
  const introText = await p.locator('main').textContent()
  const qMatch = introText.match(/共 (\d+) 題/)
  const quizQuestions = qMatch ? Number(qMatch[1]) : 12
  const hasMidFeedback = /隨時儲存|續填/.test(introText)

  // 動物頁到預約的必經步驟
  await p.goto(BASE + '/animals/mochi', { waitUntil: 'networkidle' })
  await p.getByRole('button', { name: '看看我們是否適合彼此' }).click()
  await p.waitForTimeout(200)
  const calibQs = await p.locator('aside fieldset').count()

  // 摩擦緩解元件是否存在
  const has = async (route, kw) => {
    await p.goto(BASE + route, { waitUntil: 'networkidle' })
    return (await p.locator('main').textContent()).includes(kw)
  }
  const trustSignals = await has('/trust', '你有拒絕的權利')
  const thirdParty = await has('/process', '給房東的說明')
  const affordable = await has('/animals/oreo', '兩週試養期')

  await ctx.close()
  return { quizQuestions, calibQs, hasMidFeedback, trustSignals, thirdParty, affordable }
}

// ── 由結構事實推導每一步的續行機率 ──
// 基準值的來源與假設寫在註解中;市場報告明言「主要流失環節量化不足」,
// 因此基準必須是假設,並以敏感度分析檢驗。
function buildModel(site, variant = {}) {
  const v = { ...site, ...variant }

  // 每多一題必填,續行率乘以一個衰減因子。
  // 依據:訪談 3「看到那一堆問題就不會有人填了」、訪談 4「問卷一出去人就不見了」。
  const perQuestionRetention = v.perQuestionRetention ?? 0.955
  const quizRetention = Math.pow(perQuestionRetention, v.quizQuestions)
    * (v.hasMidFeedback ? 1.18 : 1.0)     // 中途回饋降低棄填(前一輪 UX 測試實證方向)
    * (v.quizOptional ? 1.0 : 1.0)

  return {
    // 進站 → 看列表:導覽清楚度
    listView: v.listView ?? 0.72,
    // 列表 → 動物詳情:卡片資訊是否足以引發點擊
    detailView: v.detailView ?? 0.46,
    // 詳情 → 開始適配確認(等同「我要領養」)
    ctaClick: (persona) =>
      (v.ctaClick ?? 0.34)
      * (v.affordable ? 1 + persona.needsAffordable * 0.30 : 1)
      * (v.trustSignals ? 1 + persona.needsTrust * 0.16 : 1),
    // 適配確認完成率:每題衰減
    calibComplete: Math.pow(0.93, v.calibQs),
    // 測驗(若為必經)
    quizRequired: v.quizRequired ?? true,
    quizRetention,
    // 預約表單完成
    formComplete: v.formComplete ?? 0.82,
    // 預約 → 實際完成認養(線下:見面、居家確認、交接)
    // 這一段是全流程最大的結構性落差,且不在網站可控範圍內。
    offlineComplete: (persona) =>
      (v.offlineComplete ?? 0.42)
      * (v.thirdParty ? 1 + persona.needsThirdParty * 0.22 : 1)
      * (v.trialFoster ? 1.15 : 1),
  }
}

// ── 動物福利護欄:退養率 ──
// 使用者約束:「不得為了衝數字而犧牲使用者信任或動物福利資訊透明度」。
// 把它變成可量測的指標,而不是一句提醒。
//
// 基準退養率 4%:報告 KPI 訂「六個月退養率 <5%」,取略低於門檻為基準。
// 移除篩選步驟會推高退養,依據:
//   訪談 4 的退養實例——認養人後來又認養另一隻,原本的貓失寵,
//   接回來時「全身都是跳蚤⋯很瘦⋯皮膚病牠都不知道」。
//   訪談 1:「與其讓這一個人把這隻貓退回來⋯倒不如現在投入時間人力物資。」
//   報告風險表:「若只衝活動量,可能提高短期完成、卻增加後續退養。」
function returnRate(v) {
  let r = 0.04
  if (!v.quizRequired) r += 0.05          // 少了生活適配評估
  if ((v.calibQs ?? 4) < 4) r += 0.02 * (4 - (v.calibQs ?? 4)) / 2  // 少了期待校準
  if (v.skipHomeCheck) r += 0.09          // 少了居家安全確認
  if (v.skipMeeting) r += 0.11            // 少了實際互動
  if (v.trialFoster) r += 0.03            // 試養期可能成為退養的方便門
  if (v.thirdParty) r -= 0.01             // 家人房東先談好,降低後續衝突
  return Math.max(0, Math.min(0.6, r))
}

// ── 更重要的護欄:失聯 / 棄養 / 受虐 ──
// 第一版模型只算「退養率」,結果顯示拆掉篩選反而讓淨穩定率上升——
// 那是因為把「退養」當成唯一的失敗模式,而退養其實是**好的失敗**:
// 動物安全回到中途,還有第二次機會。
//
// 訪談指出的真正風險是動物**消失**:
//   訪談 3:「最怕的就是一些不負責任的飼主,或者是有一些可能虐貓人這種,
//            他們可能在偷偷的想要去認養一些貓回去。」
//   訪談 4:「房客直接落跑⋯房東就把他所有的貓送到收容所。」
//   訪談 1:「還是有很多的人是把動物當作是活的裝飾品,好丟了我就再去認養。」
// 篩選步驟(尤其是實際互動與居家確認)正是用來擋這一類的。
function lossRate(v) {
  let l = 0.005                            // 保留完整篩選時的殘餘風險
  if (!v.quizRequired) l += 0.010
  if ((v.calibQs ?? 4) === 0) l += 0.010
  if (v.skipHomeCheck) l += 0.045          // 沒看過環境:墜樓、走失、環境不適
  if (v.skipMeeting) l += 0.090            // 沒見過人:訪談 3 明指的虐待風險入口
  return Math.max(0, Math.min(0.5, l))
}

// ── 單一訪客的旅程 ──
function simulateVisitor(model, persona) {
  const steps = { visit: 1, list: 0, detail: 0, cta: 0, formStart: 0, formDone: 0, adopted: 0 }
  if (rnd() > model.listView) return steps
  steps.list = 1
  if (rnd() > model.detailView) return steps
  steps.detail = 1
  if (rnd() > model.ctaClick(persona)) return steps
  steps.cta = 1
  if (model.quizRequired && rnd() > model.quizRetention) return steps
  if (rnd() > model.calibComplete) return steps
  steps.formStart = 1
  if (rnd() > model.formComplete) return steps
  steps.formDone = 1
  if (rnd() > model.offlineComplete(persona)) return steps
  steps.adopted = 1
  return steps
}

function runArm(model, n) {
  const agg = { visit: 0, list: 0, detail: 0, cta: 0, formStart: 0, formDone: 0, adopted: 0 }
  for (let i = 0; i < n; i++) {
    let r = rnd(), pick = PERSONAS[0], acc = 0
    for (const p of PERSONAS) { acc += p.share; if (r <= acc) { pick = p; break } }
    const s = simulateVisitor(model, pick)
    for (const k of Object.keys(agg)) agg[k] += s[k]
  }
  return agg
}

// ── 雙比例 z 檢定 ──
function zTest(x1, n1, x2, n2) {
  const p1 = x1 / n1, p2 = x2 / n2
  const p = (x1 + x2) / (n1 + n2)
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
  if (se === 0) return { z: 0, p: 1 }
  const z = (p2 - p1) / se
  // 常態分布雙尾 p 值(Abramowitz & Stegun 近似)
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const prob = d * t * (1.330274429 * Math.pow(t, 5) - 1.821255978 * Math.pow(t, 4)
    + 1.781477937 * Math.pow(t, 3) - 0.356563782 * t * t + 0.319381530 * t)
  return { z, p: 2 * prob }
}

const funnelRates = (a) => ({
  瀏覽列表率: a.list / a.visit,
  進入詳情頁率: a.detail / a.list || 0,
  點擊我要領養率: a.cta / a.detail || 0,
  表單開始率: a.formStart / a.cta || 0,
  表單完成率: a.formDone / a.formStart || 0,
  線下完成率: a.adopted / a.formDone || 0,
  adoption_rate: a.adopted / a.visit,
})

// 找最大流失點(以「損失的訪客絕對數」衡量,而非比率)
function biggestDropoff(a) {
  const stages = [
    ['進站 → 瀏覽列表', a.visit - a.list],
    ['瀏覽列表 → 進入詳情頁', a.list - a.detail],
    ['詳情頁 → 點擊我要領養', a.detail - a.cta],
    ['點擊領養 → 表單開始(測驗+適配確認)', a.cta - a.formStart],
    ['表單開始 → 表單完成', a.formStart - a.formDone],
    ['表單完成 → 實際完成認養(線下)', a.formDone - a.adopted],
  ]
  return stages.sort((x, y) => y[1] - x[1])[0]
}

// ═══════════ 主迴圈 ═══════════
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const site = await probeSite(browser, {})
console.log('【網站結構實測】', JSON.stringify(site))

const log = []
let baseline = {}          // 累積生效的變體設定
let baselineRate = null

const ITERATIONS = [
  {
    name: '測驗改為非必經',
    hypothesis: '若把生活適配測驗從「預約前必經」改為「可選、可稍後補」,則點擊領養→表單開始率會提升,因為訪談指出長表單本身就是最大流失點。',
    change: { quizRequired: false },
  },
  {
    name: '適配確認題數 4 → 2',
    hypothesis: '若把預約前的快速適配確認從 4 題減到 2 題(保留最關鍵的期待校準與費用確認),則表單開始率提升,因為每題都有衰減。',
    change: { calibQs: 2 },
  },
  {
    name: '卡片資訊強化以提高詳情頁點擊',
    hypothesis: '若在列表卡片直接顯示「為什麼可能適合你」與月支出,則列表→詳情率提升,因為報告指出資訊完整性直接影響意願。',
    change: { detailView: 0.56 },
  },
  {
    name: '線下:試養期 + 到府接送',
    hypothesis: '若對所有動物(不只久候)提供兩週試養與接送,則預約→完成認養率提升,因為線下是最大的絕對流失點。',
    change: { trialFoster: true, offlineComplete: 0.50 },
  },
  {
    name: '首頁直接帶入動物列表',
    hypothesis: '若首頁首屏即嵌入動物卡片,則進站→瀏覽列表率提升,因為少一次點擊。',
    change: { listView: 0.86 },
  },
  {
    name: '全部保留 + 線下再優化',
    hypothesis: '若在前述改動之上再把線下完成率推到極限(行政簡化、當日交接),adoption_rate 是否能達 30%。',
    change: { offlineComplete: 0.62 },
  },
]

for (let i = 0; i < Math.min(MAX_ITERATIONS, ITERATIONS.length); i++) {
  const it = ITERATIONS[i]
  const controlModel = buildModel(site, baseline)
  const variantModel = buildModel(site, { ...baseline, ...it.change })

  const c = runArm(controlModel, MIN_SAMPLE_SIZE)
  const v = runArm(variantModel, MIN_SAMPLE_SIZE)
  const cr = funnelRates(c), vr = funnelRates(v)
  const { p } = zTest(c.adopted, MIN_SAMPLE_SIZE, v.adopted, MIN_SAMPLE_SIZE)

  const verdict = p < 0.05 && vr.adoption_rate > cr.adoption_rate ? 'WIN'
    : p < 0.05 && vr.adoption_rate < cr.adoption_rate ? 'LOSE'
      : 'INCONCLUSIVE'
  const decision = verdict === 'WIN' ? '保留(設為新 baseline)' : verdict === 'LOSE' ? '回退' : '延長/重新設計'
  if (verdict === 'WIN') baseline = { ...baseline, ...it.change }
  baselineRate = verdict === 'WIN' ? vr.adoption_rate : cr.adoption_rate

  const drop = biggestDropoff(verdict === 'WIN' ? v : c)

  log.push({
    iteration: i + 1,
    current_adoption_rate: Number(cr.adoption_rate.toFixed(4)),
    biggest_funnel_dropoff: drop[0],
    hypothesis: it.hypothesis,
    variant_change: it.name,
    test_result: {
      control_rate: Number(cr.adoption_rate.toFixed(4)),
      variant_rate: Number(vr.adoption_rate.toFixed(4)),
      p_value: Number(p.toFixed(5)),
      sample_size: MIN_SAMPLE_SIZE * 2,
      verdict,
    },
    decision,
    funnel_control: Object.fromEntries(Object.entries(cr).map(([k, x]) => [k, Number(x.toFixed(4))])),
    funnel_variant: Object.fromEntries(Object.entries(vr).map(([k, x]) => [k, Number(x.toFixed(4))])),
    goal_reached: vr.adoption_rate >= GOAL_ADOPTION_RATE && p < 0.05,
  })

  console.log(`\n─── Iteration ${i + 1}:${it.name} ───`)
  console.log(`最大流失點:${drop[0]}(損失 ${drop[1]} 人)`)
  console.log(`control ${(cr.adoption_rate * 100).toFixed(2)}%  variant ${(vr.adoption_rate * 100).toFixed(2)}%  p=${p.toFixed(5)}  → ${verdict} / ${decision}`)

  if (log[log.length - 1].goal_reached) { console.log('\n★ 達標,停止迭代'); break }
}

// ═══════════ 追加:達標所需的代價 ═══════════
console.log('\n\n═══════════ 追加分析:要達到 30% 需要付出什麼 ═══════════')
console.log('\n把使用者約束「不得犧牲動物福利」變成可量測指標:')
console.log('  淨穩定認養率 = adoption_rate × (1 − 退養率 − 失聯棄養率)')
console.log('  另計「每 1000 訪客造成的動物受害數」——退養是安全的失敗,失聯不是。\n')

const AGGRESSIVE = [
  { name: '目前 baseline(保留所有篩選)', change: {} },
  { name: '＋移除生活適配測驗', change: { quizRequired: false } },
  { name: '＋移除預約前適配確認', change: { quizRequired: false, calibQs: 0 } },
  { name: '＋移除居家安全確認', change: { quizRequired: false, calibQs: 0, skipHomeCheck: true, offlineComplete: 0.62 } },
  { name: '＋移除實際互動(看照片即可帶走)', change: { quizRequired: false, calibQs: 0, skipHomeCheck: true, skipMeeting: true, offlineComplete: 0.80, ctaClick: 0.62 } },
]

console.log('情境                                adoption  退養率  失聯率   淨穩定  受害/千訪客  達標?')
console.log('─'.repeat(94))
const aggRows = []
for (const a of AGGRESSIVE) {
  const cfg = { ...baseline, ...a.change }
  const m = buildModel(site, cfg)
  const r = runArm(m, MIN_SAMPLE_SIZE)
  const rate = r.adopted / MIN_SAMPLE_SIZE
  const ret = returnRate({ ...site, ...cfg })
  const loss = lossRate({ ...site, ...cfg })
  const net = rate * (1 - ret - loss)
  const harmPer1000 = rate * loss * 1000
  aggRows.push({ name: a.name, rate, ret, loss, net, harmPer1000, reached: rate >= GOAL_ADOPTION_RATE })
  console.log(
    a.name.padEnd(30, '　').slice(0, 30) +
      `${(rate * 100).toFixed(2)}%`.padStart(9) +
      `${(ret * 100).toFixed(1)}%`.padStart(8) +
      `${(loss * 100).toFixed(1)}%`.padStart(8) +
      `${(net * 100).toFixed(2)}%`.padStart(9) +
      `${harmPer1000.toFixed(1)}`.padStart(12) +
      (rate >= GOAL_ADOPTION_RATE ? '   ✔' : '   ✘'),
  )
}

const best = aggRows.reduce((b, r) => (r.net > b.net ? r : b), aggRows[0])
console.log(`\n淨穩定認養率最高的情境:「${best.name}」 → ${(best.net * 100).toFixed(2)}%`)
console.log(`  但該情境每 1000 名訪客造成 ${best.harmPer1000.toFixed(1)} 隻動物失聯/棄養,` +
  `為 baseline(${aggRows[0].harmPer1000.toFixed(1)} 隻)的 ${(best.harmPer1000 / aggRows[0].harmPer1000).toFixed(1)} 倍。`)
const reached = aggRows.filter((r) => r.reached)
if (reached.length) {
  const first = reached[0]
  console.log(`最早達到 30% 的情境:「${first.name}」`)
  console.log(`  但其淨穩定認養率為 ${(first.net * 100).toFixed(2)}%,退養率 ${(first.ret * 100).toFixed(1)}%`)
  console.log(`  相較 baseline 淨穩定 ${(aggRows[0].net * 100).toFixed(2)}%,` +
    (first.net > aggRows[0].net ? '仍有淨增益' : '淨穩定反而下降'))
} else {
  console.log('沒有任何情境在保留基本安全條件下達到 30%。')
}

// ── 理論上限檢驗 ──
const ceilingModel = buildModel(site, {
  ...baseline, listView: 0.95, detailView: 0.80, ctaClick: 0.75,
  quizRequired: false, calibQs: 0, formComplete: 0.95, offlineComplete: 0.85,
})
const ceil = runArm(ceilingModel, MIN_SAMPLE_SIZE)
const ceilRate = ceil.adopted / MIN_SAMPLE_SIZE

console.log('\n═══ 迭代結束 ═══')
console.log(`最終 baseline adoption_rate:${(baselineRate * 100).toFixed(2)}%`)
console.log(`目標:${GOAL_ADOPTION_RATE * 100}%`)
console.log(`\n理論上限檢驗(每一步都推到不現實的極端值):${(ceilRate * 100).toFixed(2)}%`)
console.log('  極端假設:進站→列表 95%、列表→詳情 80%、詳情→領養 75%、')
console.log('           無測驗、無適配確認、表單完成 95%、線下完成 85%')

// ── 改用「合格意向」為分母 ──
const finalModel = buildModel(site, baseline)
const f = runArm(finalModel, MIN_SAMPLE_SIZE)
console.log('\n═══ 改用不同分母 ═══')
console.log(`以 unique_visitors 為分母:  ${((f.adopted / f.visit) * 100).toFixed(2)}%`)
console.log(`以 進入詳情頁者 為分母:      ${((f.adopted / f.detail) * 100).toFixed(2)}%`)
console.log(`以 點擊領養者 為分母:        ${((f.adopted / f.cta) * 100).toFixed(2)}%`)
console.log(`以 完成預約者 為分母:        ${((f.adopted / f.formDone) * 100).toFixed(2)}%`)

if (process.env.EXPORT) {
  fs.writeFileSync(process.env.EXPORT, JSON.stringify({
    params: { GOAL_ADOPTION_RATE, MAX_ITERATIONS, MIN_SAMPLE_SIZE, SEED },
    site, iterations: log,
    aggressive: aggRows,
    final: { baseline, rate: baselineRate, ceiling: ceilRate,
      denominators: {
        unique_visitors: f.adopted / f.visit,
        detail_viewers: f.adopted / f.detail,
        cta_clickers: f.adopted / f.cta,
        booking_completers: f.adopted / f.formDone,
      } },
  }, null, 2))
  console.log(`\n已匯出 → ${process.env.EXPORT}`)
}
await browser.close()
