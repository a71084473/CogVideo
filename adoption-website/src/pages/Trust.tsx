import { Section } from '../components/shared'
import { flags } from '../lib/canary'

const standards = [
  { rule: '門窗與陽台防護(必要安全條件)', why: '墜樓與走失是意外死亡與失蹤的首要原因,這一項沒有彈性,但我們會協助你完成。' },
  { rule: '房東或同住者同意(必要安全條件)', why: '未經同意的飼養,最後承受風險的是動物。我們提供溝通指南協助你取得同意。' },
  { rule: '第二照顧者(必要安全條件)', why: '你生病、出差時牠仍需要被照顧。這是備援,不是對你能力的懷疑。' },
  { rule: '醫療預備金或保險(可討論的準備)', why: '突發醫療是退養最常見原因。金額與形式可以討論,分次準備也可以。' },
  { rule: '生活作息與動物需求相符(可討論的偏好)', why: '這決定你們合不合拍,不是合格與否。作息特殊,就找作息合拍的夥伴。' },
  { rule: '願意使用 90 天支持(我們的請求)', why: '不是監視,是在最容易出狀況的時期陪你。回報形式輕量,一句話也可以。' },
]

const privacy = [
  { t: '收集什麼', d: '測驗回答、聯絡方式、準備進度、認養後回報。不收集身分證字號與精確地址,直到法定寵物登記才需要。' },
  { t: '為什麼收集', d: '媒合推薦、預約聯繫、認養後支持。每個表單欄位旁都寫明用途。' },
  { t: '保存多久', d: '未成案資料 12 個月後匿名化;認養合約依法保存。原型階段所有資料僅存於你的瀏覽器。' },
  { t: '你的權利', d: '隨時查看、更正、下載與刪除。刪除後我們僅保留法定必要的合約紀錄。' },
  { t: '我們不做的事', d: '不販售認養人資料、不建立公開羞辱式黑名單、不將居家照片用於安全確認以外的用途。' },
]

export default function Trust() {
  return (
    <>
      <Section
        title="關於我們與透明資訊" level={1}
        subtitle="中途之家沒有公權力,能建立的只有信任。所以我們把標準、原因、金流與資料使用方式全部寫在這裡。"
      >
        <h2 className="text-xl font-bold">認養標準與原因</h2>
        <p className="mt-1 text-sm text-ink-soft">分成三種:必要安全條件(不能妥協,但我們協助你完成)、可討論的準備與偏好、以及我們的請求。</p>
        <ul className="mt-4 space-y-3">
          {standards.map((s) => (
            <li key={s.rule} className="rounded-card border border-cream-dark bg-white p-5">
              <p className="font-bold">{s.rule}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.why}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 雙向透明的另一半:我們要求動物資訊完整揭露,也該說明中途自己的處境 */}
      {flags().fosterCandor && (
      <Section
        title="我們這邊的實話"
        subtitle="我們請你誠實說明生活,那我們也該說清楚:這些要求是從哪裡來的,以及我們能力的邊界在哪。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              t: '我們沒有公權力,所以只能靠問',
              d: '中途之家不是公家機關,貓狗交出去之後,我們沒有任何權力去檢查或要求。正因為什麼都做不到,才會在事前多問幾句——這是焦慮,不是懷疑你。我們也知道問多了會讓人不舒服,所以每一題都寫明了原因。',
            },
            {
              t: '審核不是在挑人,是在怕重來一次',
              d: '被退養的動物,第二次找家會更難,狀態也更差。我們接回來過全身跳蚤、瘦到脫形的孩子。那次之後,任何一個「應該沒問題吧」都變得很難說出口。',
            },
            {
              t: '我們是小團隊,回覆可能會慢',
              d: '照顧、就醫、接電話、清潔多半是同幾個人在做。回訊息慢通常不是不理你,是還在醫院或還在洗籠子。急事請直接標記「緊急」,我們會優先處理。',
            },
            {
              t: '你有拒絕的權利',
              d: '覺得哪一題太私人,可以不答或直接問我們為什麼要問;不想公開回報照片,選不公開就好。不回答不會讓你失去認養資格——我們只會告訴你,少了這項我們能提供的協助會少一些。',
            },
          ].map((c) => (
            <div key={c.t} className="rounded-card border border-cream-dark bg-white p-6">
              <h3 className="font-bold">{c.t}</h3>
              <p className="mt-1 text-sm text-ink-soft">{c.d}</p>
            </div>
          ))}
        </div>
      </Section>
      )}

      <Section title="你的資料如何被對待">
        <div className="grid gap-4 md:grid-cols-2">
          {privacy.map((p) => (
            <div key={p.t} className="rounded-card border border-cream-dark bg-white p-5">
              <h3 className="font-bold">{p.t}</h3>
              <p className="mt-1 text-sm text-ink-soft">{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="捐款流向與合作透明">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-cream-dark bg-white p-6">
            <h3 className="font-bold">年度捐款流向(示意資料)</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                { k: '醫療費用', v: 58 },
                { k: '飼料與物資', v: 22 },
                { k: '場地與水電', v: 12 },
                { k: '行政與平台', v: 8 },
              ].map((r) => (
                <li key={r.k}>
                  <div className="flex justify-between"><span>{r.k}</span><span className="font-medium">{r.v}%</span></div>
                  <div className="mt-1 h-2 rounded-full bg-cream-dark">
                    <div className="h-full rounded-full bg-sage" style={{ width: `${r.v}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-soft">※ 示意資料。正式版將公布經會計師核閱的年度報告。</p>
          </div>
          <div className="space-y-4">
            <div className="rounded-card border border-cream-dark bg-white p-6">
              <h3 className="font-bold">合作醫院與品牌</h3>
              <p className="mt-1 text-sm text-ink-soft">
                合作醫院提供健檢優惠與分期方案;我們如實揭露所有合作關係與轉介利益(目前無任何轉介抽成)。
                <strong className="text-ink">贊助品牌不影響動物媒合結果</strong>——推薦只依據生活適配。
              </p>
            </div>
            <div className="rounded-card border border-cream-dark bg-white p-6">
              <h3 className="font-bold">我們的承諾</h3>
              <ul className="mt-1 space-y-1 text-sm text-ink-soft">
                <li>・不販售認養人資料。</li>
                <li>・不建立公開羞辱式黑名單。</li>
                <li>・不假造認養數據、醫療成果或公益成效。</li>
                <li>・審核紀錄僅內部使用,且你可以要求查看。</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
