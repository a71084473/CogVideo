import { Link } from 'react-router-dom'
import { Section } from '../components/shared'
import { flags } from '../lib/canary'

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

// 市場報告建議追蹤期為 180 天(180 天追蹤完成率 ≥85%、六個月退養率 <5%)。
// 但訪談指出高頻追蹤會讓人反感,因此 90 天後改為低頻、且明說可以只回一句話。
const extended = [
  {
    day: 120,
    title: '第 120 天|低頻關心',
    items: ['季節轉換的照護(換毛、寒流、梅雨)', '有沒有新的行為問題出現?', '醫療與支出還在預期內嗎?'],
    tip: '這之後就是三個月一次。回一句「都很好」就完成了,不需要照片。',
  },
  {
    day: 180,
    title: '第 180 天|正式畢業',
    items: ['半年了,整體生活穩定嗎?', '需不需要進階照護或行為資源?', '之後改為你想說再說'],
    tip: '半年是退養風險真正下降的分界。走到這裡,你們已經是彼此的家人了。',
  },
]

const helpCategories = ['健康與醫療', '行為與互動', '飲食與排泄', '家庭與居住', '經濟與物資', '暫時無法照顧', '其他']

export default function Support90() {
  return (
    <>
      <Section
        title={flags().extendTo180 ? '認養後 180 天支持' : '認養後 90 天支持'} level={1}
        subtitle="一次審核無法保證未來 15–20 年,持續的陪伴才可以。前 90 天密集陪伴,之後改為低頻關心,直到滿半年。"
      >
        {/* 直接處理「被監視」的疑慮,而不是等使用者自己猜 */}
        {flags().surveillanceRelief && (
        <div className="mb-8 rounded-card border border-info/30 bg-info-light/60 p-6">
          <h2 className="text-lg font-bold">先說清楚:這不是在盯著你</h2>
          <ul className="mt-3 grid gap-2 text-ink-soft md:grid-cols-2">
            <li>
              <span className="font-medium text-ink">系統提醒你,不是人來催你。</span>
              到了節點你會收到一則通知,沒回也不會有人打電話追問。
            </li>
            <li>
              <span className="font-medium text-ink">你的回報只有中途團隊看得到。</span>
              除非你自己勾選公開,否則不會出現在網站任何地方。
            </li>
            <li>
              <span className="font-medium text-ink">節奏可以自己調。</span>
              覺得太頻繁,在會員中心改成低頻或暫停;90 天之後就改為你想說再說。
            </li>
            <li>
              <span className="font-medium text-ink">回報一句話就夠。</span>
              「都很好」也是完整的回答,不需要拍照、不需要交代細節。
            </li>
          </ul>
        </div>
        )}

        <ol className="relative space-y-6 border-l-2 border-sage/40 pl-6">
          {[...timeline, ...(flags().extendTo180 ? extended : [])].map((t) => (
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

      {/* 同儕互助:實務上,新手的問題最常被其他認養人解決,而不是中途 */}
      {flags().peerSupport && (
      <Section
        title="其他認養人,通常比我們更快回你"
        subtitle="半夜牠一直叫、第一次吐毛球、突然不用貓砂——這些問題,走過同一段路的人最有答案。"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              q: '牠第三天還躲在沙發底下不出來,正常嗎?',
              a: '正常。我家那隻躲了快兩週,不要拖牠出來,把飯放在牠看得到的地方就好。',
              by: '養了 1 年的認養人',
            },
            {
              q: '幼貓一直咬手怎麼辦?會不會養成習慣?',
              a: '不要用手當玩具,換逗貓棒。被咬時發出「痛!」然後停止互動,大概兩週就會改。',
              by: '養了 3 年的認養人',
            },
            {
              q: '第一次帶去打針,牠在外出籠裡叫到我心碎。',
              a: '出發前一晚把外出籠放出來讓牠當窩睡,蓋條熟悉味道的布,下次就會好很多。',
              by: '養了 5 年的認養人',
            },
          ].map((c) => (
            <div key={c.q} className="rounded-card border border-cream-dark bg-white p-5">
              <p className="font-medium">Q・{c.q}</p>
              <p className="mt-2 text-sm text-ink-soft">{c.a}</p>
              <p className="mt-2 text-xs text-ink-soft">—— {c.by}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          認養後你會收到認養人社群的邀請,可以只看不說話,也可以隨時退出。以上為示意內容。
        </p>
      </Section>
      )}

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
