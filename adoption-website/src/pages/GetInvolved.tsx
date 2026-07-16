import { Section } from '../components/shared'

const options = [
  {
    t: '每月助養特定動物',
    time: '每月 NT$300 起',
    skill: '不需技能',
    duty: '穩定的每月支持,可隨時調整或停止',
    impact: '支付一隻動物的飼料與日常醫療,你會收到牠的專屬近況。',
  },
  {
    t: '支持醫療基金',
    time: '單次或定期',
    skill: '不需技能',
    duty: '無',
    impact: '讓像雪見這樣的慢性病動物能持續治療、不因費用被放棄。',
  },
  {
    t: '捐贈物資',
    time: '依需求清單',
    skill: '不需技能',
    duty: '依公告清單寄送,避免過期或不合用物資',
    impact: '飼料、貓砂、處方糧與藥品,直接進入日常照護。',
  },
  {
    t: '救援運輸車手',
    time: '每月 1–2 次,每次 2–4 小時',
    skill: '汽車駕照、細心',
    duty: '依排班接送動物就醫或轉換中途',
    impact: '很多救援卡在「沒有人載」。你的車就是牠的救護車。',
  },
  {
    t: '清潔與日常照護志工',
    time: '每週固定 3 小時以上',
    skill: '不需經驗,現場教學',
    duty: '固定班表,穩定出席很重要',
    impact: '乾淨的環境是所有照護的基礎,也是你累積照顧經驗的起點。',
  },
  {
    t: '攝影、社群與設計志工',
    time: '彈性遠端',
    skill: '攝影/文案/設計任一',
    duty: '每月至少完成一次拍攝或內容產出',
    impact: '一張好照片能讓等待縮短一半——但我們拍的是真實,不是賣慘。',
  },
  {
    t: '行政與資料志工',
    time: '彈性遠端,每週 2 小時',
    skill: '基本文書',
    duty: '協助資料整理與回覆',
    impact: '讓中途把時間留給動物,而不是表格。',
  },
  {
    t: '短期照護與中途培訓',
    time: '2 週至 3 個月',
    skill: '完成培訓課程',
    duty: '提供暫時的家與每日照顧,中途全程支援',
    impact: '這是「認養前的實習」——許多成功認養人都是從短期照護開始的。',
  },
]

export default function GetInvolved() {
  return (
    <Section
      title="助養、捐款與志工"
      subtitle="還沒準備好認養,不代表不能改變牠們的生活。每個選項都清楚寫著需要的時間、技能與責任——選一個放得進你生活的。"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => (
          <div key={o.t} className="flex flex-col rounded-card border border-cream-dark bg-white p-6">
            <h2 className="text-lg font-bold">{o.t}</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex gap-2"><dt className="w-16 shrink-0 text-ink-soft">時間</dt><dd>{o.time}</dd></div>
              <div className="flex gap-2"><dt className="w-16 shrink-0 text-ink-soft">技能</dt><dd>{o.skill}</dd></div>
              <div className="flex gap-2"><dt className="w-16 shrink-0 text-ink-soft">責任</dt><dd>{o.duty}</dd></div>
            </dl>
            <p className="mt-3 rounded-lg bg-sage-light/60 px-3 py-2 text-sm text-sage-dark">{o.impact}</p>
            <button type="button" className="mt-auto pt-4">
              <span className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border-2 border-brand px-4 py-2 font-medium text-brand-dark hover:bg-brand-light">
                我想了解更多
              </span>
            </button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink-soft">
        ※ 報名與金流功能將於正式版開通;目前為原型示意。所有捐款流向請見
        <a href="/trust" className="mx-1 underline underline-offset-2 hover:text-brand-dark">透明資訊頁</a>。
      </p>
    </Section>
  )
}
