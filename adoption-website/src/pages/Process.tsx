import { Link } from 'react-router-dom'
import { Section } from '../components/shared'
import { flags } from '../lib/canary'

const steps = [
  {
    title: '生活適配測驗',
    time: '約 5–10 分鐘',
    purpose: '了解你的生活節奏與期待,推薦真正合拍的夥伴。',
    prepare: '不需要任何文件,誠實回答就好。',
    youGet: '個人化推薦、優勢分析與準備清單。',
    privacy: '回答僅用於媒合建議,不公開、不提供第三方。',
  },
  {
    title: '與動物及中途實際互動',
    time: '每次約 30–60 分鐘,可多次',
    purpose: '讓你和牠實際相處,也讓中途分享牠的習性與照顧方式。',
    prepare: '預約時段;有同住者建議一起來。',
    youGet: '對牠真實個性的了解,以及所有問題的解答。',
    privacy: '只需提供稱呼與聯絡方式,用於預約確認。',
  },
  {
    title: '共同準備與居家安全改善',
    time: '依清單,通常 1–3 週',
    purpose: '一起完成門窗防護、用品與備援安排,讓牠回家就安全。',
    prepare: '準備清單上的項目;可申請中途到府協助。',
    youGet: '到府協助或視訊確認、防護建議與教學資源。',
    privacy: '居家照片僅用於安全確認,確認後即刪除,不留存、不外流。',
  },
  {
    title: '責任交接與認養',
    time: '約 1 小時',
    purpose: '簽署認養合約,完整移交健康紀錄、飲食與照護資訊。',
    prepare: '雙證件(依動保法規定辦理寵物登記)。',
    youGet: '合約副本、醫療紀錄、兩週份銜接糧與照護手冊。',
    privacy: '身分資料僅用於寵物登記與合約,依法保存,不作其他用途。',
    note:
      '合約是雙向的:它寫明你不得棄養或私下轉送,但也寫明我們的義務——提供完整病史、90 天內的支持,以及任何時候你無法繼續時,我們一定接回。我們核對證件但不留存影本。',
  },
  {
    title: '認養後 90 天陪伴',
    time: '3/7/30/60/90 天輕量檢核',
    purpose: '在最容易出狀況的適應期,提早發現問題、一起解決。',
    prepare: '不需要準備,回報一下近況就好。',
    youGet: '各階段適應指南、行為與醫療諮詢、求助管道。',
    privacy: '回報內容僅中途可見;公開與否由你決定。',
  },
]

export default function Process() {
  return (
    <>
      <Section
        title="認養流程與共同準備" level={1}
        subtitle="五個步驟,每一步都清楚知道:為什麼、要多久、你會得到什麼。"
      >
        <ol className="space-y-5">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-card border border-cream-dark bg-white p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">{i + 1}</span>
                <h2 className="text-xl font-bold">{s.title}</h2>
                <span className="rounded-full bg-cream-dark px-3 py-0.5 text-sm text-ink-soft">{s.time}</span>
              </div>
              <dl className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
                <div><dt className="text-sm font-medium text-sage-dark">目的</dt><dd className="text-ink-soft">{s.purpose}</dd></div>
                <div><dt className="text-sm font-medium text-sage-dark">需要準備</dt><dd className="text-ink-soft">{s.prepare}</dd></div>
                <div><dt className="text-sm font-medium text-sage-dark">你會得到</dt><dd className="text-ink-soft">{s.youGet}</dd></div>
                <div><dt className="text-sm font-medium text-sage-dark">個資如何被使用</dt><dd className="text-ink-soft">{s.privacy}</dd></div>
              </dl>
              {'note' in s && s.note && (
                <p className="mt-3 rounded-lg bg-sage-light/60 px-4 py-2 text-sm text-sage-dark">{s.note}</p>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* 卡點常不在認養人身上,而在房東與家人。給他們可以直接轉傳的東西 */}
      {flags().thirdPartyTools && (
      <Section
        title="卡住的通常不是你,是還沒點頭的人"
        subtitle="房東擔心房子、家人擔心過敏和麻煩——這些疑慮都很具體,也都有答案。以下內容可以直接轉給他們看。"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-card border border-cream-dark bg-white p-6">
            <h3 className="text-lg font-bold">給房東的說明</h3>
            <p className="mt-1 text-sm text-ink-soft">針對房東最常見的三個擔心,提供可直接轉傳的說法:</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>
                <span className="font-medium text-ink">「會不會抓壞牆壁地板?」</span>
                貓抓板與定期剪指甲可以解決;我們提供貓抓板並在交接時示範。
              </li>
              <li>
                <span className="font-medium text-ink">「會不會有味道、吵到鄰居?」</span>
                結紮後的貓不噴尿也不發情叫;每日清砂就沒有異味。牠們都已完成結紮。
              </li>
              <li>
                <span className="font-medium text-ink">「搬走後房子怎麼辦?」</span>
                可加簽恢復原狀條款;門窗防護是外加式的,退租時可完整拆除不留痕。
              </li>
            </ul>
            <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-sm">
              房東同意用訊息或口頭都可以,我們不需要正式文件,也不會聯絡他。
            </p>
          </div>
          <div className="rounded-card border border-cream-dark bg-white p-6">
            <h3 className="text-lg font-bold">給同住家人的說明</h3>
            <p className="mt-1 text-sm text-ink-soft">
              家人的反對幾乎都不是「討厭動物」,而是怕麻煩落到自己身上。與其說服,不如先把分工講清楚:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>誰負責清砂、餵食、就醫,寫下來給家人看,比保證「我會顧好」有用。</li>
              <li>擔心過敏?可以先到中途之家實際相處一小時,反應通常當場就知道。</li>
              <li>擔心小孩被抓?我們會依家中孩子年齡推薦性格穩定的夥伴,並示範互動方式。</li>
              <li>還是談不攏,可以約線上三方對談——由我們回答問題,你不必一個人扛。</li>
            </ul>
            <p className="mt-3 rounded-lg bg-brand-light/60 px-3 py-2 text-sm">
              同住者同意是必要條件。不是規定,是因為在反對聲中生活的動物,最後多半會被送回來。
            </p>
          </div>
        </div>
      </Section>
      )}

      <Section>
        <div className="rounded-card bg-sage-light/70 p-8">
          <h2 className="text-2xl font-bold">關於「居家安全確認與改善協助」</h2>
          <p className="mt-2 max-w-2xl text-ink-soft">
            很多平台把這一步叫做「家訪」,聽起來像檢查。我們想說清楚:
            <strong className="text-ink">不是檢查你夠不夠資格,而是一起確認有哪些地方能讓牠住得更安全。</strong>
            我們會帶著防護建議與工具來,常見的改善(例如紗窗加固)通常一個下午就能完成。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/quiz" className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark">
              從第一步開始:生活適配測驗
            </Link>
            <Link to="/trust" className="inline-flex min-h-11 items-center rounded-lg border border-sage px-5 py-2.5 font-medium text-sage-dark hover:bg-white">
              查看隱私與透明說明
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}
