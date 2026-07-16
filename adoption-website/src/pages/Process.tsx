import { Link } from 'react-router-dom'
import { Section } from '../components/shared'

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
        title="認養流程與共同準備"
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
            </li>
          ))}
        </ol>
      </Section>

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
