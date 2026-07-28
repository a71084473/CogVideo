import { Link } from 'react-router-dom'
import { getMatchResult } from '../lib/storage'
import { getAnimal } from '../data/animals'
import { preparationItems } from '../data/preparation'
import { AnimalCard } from '../components/AnimalCard'
import { EmptyState, Section } from '../components/shared'

export default function QuizResult() {
  const result = getMatchResult()

  if (!result) {
    return (
      <Section title="測驗結果" level={1}>
        <EmptyState title="還沒有測驗結果" hint="先完成 5–10 分鐘的生活適配測驗,我們就能為你推薦合適的夥伴。" action={{ label: '開始測驗', to: '/quiz' }} />
      </Section>
    )
  }

  const recommended = result.recommendedAnimalIds.map(getAnimal).filter(Boolean)
  const prepList = preparationItems.filter((p) => result.preparationIds.includes(p.id))

  const headings = {
    ready: {
      badge: '已適合進入媒合',
      cls: 'bg-sage-light text-sage-dark',
      title: '你已經可以開始認識牠們了',
      desc: '你的生活條件與準備狀況,已經可以安心進入媒合。下面是依你的生活推薦的夥伴。',
    },
    prepare: {
      badge: '完成幾項準備後進入媒合',
      cls: 'bg-brand-light text-brand-dark',
      title: '還有幾項準備完成後,就能更安心進入媒合',
      desc: '你沒有被擋下來,也沒有被扣分。我們只是把可能的風險,提早換成幾件具體、做得到的事。每一項都附做法。',
    },
    'other-ways': {
      badge: '現階段先用其他方式參與',
      cls: 'bg-info-light text-ink-soft',
      title: '先從其他方式開始,也是很好的起點',
      desc: '依你目前的生活狀況,直接認養可能會讓你和動物都比較辛苦。先透過志工、助養或課程累積經驗,準備好了隨時回來——你的結果會保留。',
    },
  }[result.status]

  return (
    <>
      <Section>
        <div className="mx-auto max-w-3xl">
          <span className={`inline-block rounded-full px-4 py-1 font-medium ${headings.cls}`}>{headings.badge}</span>
          <h1 className="mt-3 text-3xl font-bold">{headings.title}</h1>
          <p className="mt-2 text-ink-soft">{headings.desc}</p>

          <div className="mt-6 rounded-lg bg-info-light p-4 text-sm text-ink-soft">
            這是生活準備建議,不是人格評分,也不代表自動取得或失去認養資格。你隨時可以
            <Link to="/quiz" className="mx-1 underline underline-offset-2 hover:text-brand-dark">回去修改答案</Link>
            ,結果會即時更新。
          </div>

          {result.reasons.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold">你的優勢</h2>
              <ul className="mt-3 space-y-2">
                {result.reasons.map((r) => (
                  <li key={r} className="flex gap-2 rounded-lg bg-sage-light/60 px-4 py-3 text-ink-soft">
                    <span aria-hidden="true" className="text-sage-dark">✓</span>{r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.risks.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold">提早想過,就不是風險</h2>
              <ul className="mt-3 space-y-2">
                {result.risks.map((r) => (
                  <li key={r} className="flex gap-2 rounded-lg bg-info-light px-4 py-3 text-ink-soft">
                    <span aria-hidden="true">ⓘ</span>{r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.status !== 'other-ways' && prepList.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold">你的準備清單</h2>
              <p className="mt-1 text-sm text-ink-soft">完成進度會同步到「我的進度」,可以隨時回來勾選。</p>
              <ul className="mt-3 space-y-3">
                {prepList.map((p) => (
                  <li key={p.id} className="rounded-card border border-cream-dark bg-white p-5">
                    <p className="font-bold">{p.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
                    <p className="mt-2 text-xs text-ink-soft">確認方式:{p.proofHint}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/dashboard" className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark">
                  開始準備並追蹤進度
                </Link>
                <Link to="/process" className="inline-flex min-h-11 items-center rounded-lg border border-sage px-5 py-2.5 font-medium text-sage-dark hover:bg-sage-light">
                  查看教學與流程
                </Link>
              </div>
            </section>
          )}

          {result.status === 'other-ways' && (
            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { t: '成為志工', d: '每週幾小時,累積照顧經驗。', to: '/get-involved' },
                { t: '每月助養', d: '用穩定的支持參與牠的生活。', to: '/get-involved' },
                { t: '認養前課程', d: '從基礎照護開始學習。', to: '/get-involved' },
              ].map((c) => (
                <Link key={c.t} to={c.to} className="rounded-card border border-cream-dark bg-white p-5 hover:border-brand">
                  <p className="font-bold">{c.t}</p>
                  <p className="mt-1 text-sm text-ink-soft">{c.d}</p>
                </Link>
              ))}
            </section>
          )}
        </div>
      </Section>

      {result.status !== 'other-ways' && recommended.length > 0 && (
        <Section title="依你的生活推薦" subtitle="這些夥伴的作息、照護需求與你的回答最合拍。">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((a) => a && <AnimalCard key={a.id} animal={a} />)}
          </div>
        </Section>
      )}
    </>
  )
}
