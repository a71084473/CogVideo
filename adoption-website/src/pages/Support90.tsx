import { Link } from 'react-router-dom'
import { Section } from '../components/shared'

const timeline = [
  {
    day: 3,
    title: '第 3 天|安全落地',
    items: ['有沒有吃東西、喝水?', '排泄是否正常?', '躲藏是正常的,不用勉強互動', '再檢查一次門窗與危險物品'],
    tip: '前三天最重要的是「安靜與安全」。牠躲起來不是討厭你,是在確認這裡安全。',
  },
  {
    day: 7,
    title: '第 7 天|建立節奏',
    items: ['作息開始固定了嗎?', '互動時有沒有抓咬?(多半是遊戲方式問題,有方法可以調整)', '夜間活動會不會影響睡眠?'],
    tip: '這週開始建立餵食與遊戲的固定時間,節奏會讓你們都安心。',
  },
  {
    day: 30,
    title: '第 30 天|真實生活',
    items: ['家人或同住者的反應如何?', '照顧時間會不會壓力太大?', '有沒有醫療或行為上的疑問?'],
    tip: '新鮮感過去、真實生活開始,這時候的困難最常見也最正常。這正是我們在的原因。',
  },
  {
    day: 60,
    title: '第 60 天|生活變化',
    items: ['工作或生活有變化嗎?', '照顧安排需要調整嗎?', '第二照顧者的安排還有效嗎?'],
    tip: '生活會變,計畫也可以跟著變。需要重新安排時,和我們說一聲就好。',
  },
  {
    day: 90,
    title: '第 90 天|穩定同行',
    items: ['整體相處還合拍嗎?', '有沒有想學的進階照護?', '之後改為你主動回報,我們隨時都在'],
    tip: '恭喜你們!之後的幸福回報由你決定節奏,遇到任何狀況,求助入口永遠開著。',
  },
]

const helpCategories = ['健康與醫療', '行為與互動', '飲食與排泄', '家庭與居住', '經濟與物資', '暫時無法照顧', '其他']

export default function Support90() {
  return (
    <>
      <Section
        title="認養後 90 天支持"
        subtitle="一次審核無法保證未來 15–20 年,持續的陪伴才可以。前 90 天,我們陪你度過最容易出狀況的適應期。"
      >
        <ol className="relative space-y-6 border-l-2 border-sage/40 pl-6">
          {timeline.map((t) => (
            <li key={t.day} className="relative">
              <span aria-hidden="true" className="absolute top-1 -left-[35px] flex h-4 w-4 rounded-full border-2 border-sage bg-cream" />
              <div className="rounded-card border border-cream-dark bg-white p-6">
                <h2 className="text-lg font-bold">{t.title}</h2>
                <ul className="mt-2 space-y-1 text-ink-soft">
                  {t.items.map((i) => <li key={i}>・{i}</li>)}
                </ul>
                <p className="mt-3 rounded-lg bg-sage-light/60 px-4 py-2 text-sm text-sage-dark">{t.tip}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="rounded-card bg-brand-light/60 p-8 text-center">
          <h2 className="text-2xl font-bold">我需要協助</h2>
          <p className="mx-auto mt-2 max-w-xl text-ink-soft">
            遇到問題不代表你不適合。越早告訴我們,越容易一起找到方法。
          </p>
          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
            {helpCategories.map((c) => (
              <span key={c} className="rounded-full bg-white px-3 py-1 text-sm text-ink-soft">{c}</span>
            ))}
          </div>
          <Link to="/crisis" className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-brand px-8 py-3 text-lg font-bold text-white hover:bg-brand-dark">
            取得協助
          </Link>
        </div>
      </Section>
    </>
  )
}
