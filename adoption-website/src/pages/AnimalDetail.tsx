import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { animals, getAnimal, careLevelLabel } from '../data/animals'
import { AnimalPhoto } from '../components/AnimalPhoto'
import { AnimalCard } from '../components/AnimalCard'
import { Tag, CareLevelBadge } from '../components/Badges'
import { EmptyState, Section } from '../components/shared'
import { saveBooking } from '../lib/storage'
import type { Animal } from '../types'
import { flags } from '../lib/canary'
import { track } from '../lib/funnel'

// 快速適配確認(3-5 題)→ 預約互動,不直接送出認養申請
const quickQuestions = [
  {
    id: 'q1',
    text: '如果牠前幾週都躲起來、不主動靠近,你願意照著適應指南等牠嗎?',
    options: ['願意,我知道這是正常過程', '有點擔心,想先了解會多久', '我比較希望互動快的夥伴'],
  },
  {
    id: 'q2',
    text: '牠的每月照護支出與偶發醫療費,在你目前的預算內嗎?',
    options: ['在預算內', '大致可以,想再確認細節', '可能超出,想先了解助養方式'],
  },
  {
    id: 'q3',
    text: '你的居住環境(空間、門窗防護、同住者)符合牠的需求嗎?',
    options: ['符合或可以完成', '部分還要確認', '目前不符合'],
  },
  {
    id: 'q4',
    text: '平日牠需要獨處的時間,和你的作息合得來嗎?',
    options: ['合得來', '大致可以', '差距有點大'],
  },
]

// 期待校準:被故事打動的當下,就把最容易落差的地方講明白。
// 訪談證據:共感而來的認養人退養率低,但前提是他共感的是「真實的牠」。
function expectationChecks(a: Animal): string[] {
  const out: string[] = []
  if (a.affection === 1)
    out.push(`如果三個月後${a.name}還是不主動靠近你、也不讓你抱,你願意繼續用牠的節奏相處嗎?`)
  else if (a.affection === 2)
    out.push(`${a.name}熟了才親人,前幾週可能都在觀察你。這段「還不算朋友」的時間,你能享受嗎?`)
  if (a.activityLevel === 3)
    out.push(`牠每天都需要大量放電,下雨天、加班日、生病時也一樣。這件事沒辦法跳過,你排得進去嗎?`)
  if (a.dailyMedication || a.careLevel === 'special')
    out.push(`每天固定餵藥、定期回診會成為你生活的一部分,連旅行都要先安排好。這是你願意接下的日常嗎?`)
  if (a.mustAdoptInPair)
    out.push(`牠必須和手足一起走,食量、砂量、醫療費都是兩份。你的預算和空間是以兩隻計算的嗎?`)
  if (a.ageYears >= 8)
    out.push(`牠已經是熟齡了,陪你的時間可能不是十五年。即使如此,你仍然想給牠一個家嗎?`)
  if (a.aloneHours <= 6)
    out.push(`牠不太能忍受長時間獨處,你的工作型態能讓牠每天有人在家嗎?`)
  out.push(`你現在心動的,是牠的故事,還是上面這些每一天都要做的事?兩個答案都可以,但值得先問自己一次。`)
  return out.slice(0, 3)
}

export default function AnimalDetail() {
  const { id } = useParams()
  const animal = getAnimal(id ?? '')
  const [step, setStep] = useState<'view' | 'check' | 'book' | 'done'>('view')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [bookType, setBookType] = useState<'onsite' | 'online'>('onsite')
  const [bookDate, setBookDate] = useState('')
  const [dateError, setDateError] = useState('')

  // 埋點:瀏覽動物;金絲雀組會同時看到期待校準
  useEffect(() => {
    if (!animal) return
    track('animal_view', { animalId: animal.id, longWait: animal.waitingDays >= 120 })
    if (flags().expectationCalibration) track('calibration_view', { animalId: animal.id })
  }, [animal])

  if (!animal) {
    return (
      <Section>
        <EmptyState title="找不到這位夥伴" hint="牠可能已經找到家了。看看其他等待中的夥伴吧。" action={{ label: '回到夥伴列表', to: '/animals' }} />
      </Section>
    )
  }

  const similar = animal.similarIds.map((s) => getAnimal(s)).filter(Boolean)
  const allAnswered = quickQuestions.every((q) => answers[q.id])

  function submitBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!bookDate) {
      setDateError('請選擇希望的日期——選好日期我們才能為你保留時段。')
      return
    }
    setDateError('')
    track('booking_submit', { animalId: animal!.id, longWait: animal!.waitingDays >= 120 })
    saveBooking({ animalId: animal!.id, type: bookType, date: bookDate, createdAt: new Date().toISOString() })
    setStep('done')
  }

  return (
    <>
      <Section>
        <nav aria-label="麵包屑" className="mb-4 text-sm text-ink-soft">
          <Link to="/animals" className="hover:text-brand-dark">尋找適合的夥伴</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page" className="text-ink">{animal.name}</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <AnimalPhoto animal={animal} className="rounded-card" />

            <div>
              <h1 className="text-3xl font-bold">{animal.name}</h1>
              <p className="mt-1 text-ink-soft">{animal.age}・{animal.sex}・{animal.location}{animal.mustAdoptInPair && '・需與手足成對認養'}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {animal.personalityTags.map((t) => <Tag key={t} tone="brand">{t}</Tag>)}
                {animal.lifestyleTags.map((t) => <Tag key={t} tone="sage">{t}</Tag>)}
                <CareLevelBadge level={animal.careLevel} />
              </div>
            </div>

            <section aria-labelledby="story">
              <h2 id="story" className="text-xl font-bold">牠的故事</h2>
              <p className="mt-2 text-ink-soft">{animal.story}</p>
            </section>

            {flags().expectationCalibration && (
            <section aria-labelledby="calib" className="rounded-card border border-brand/30 bg-brand-light/40 p-6">
              <h2 id="calib" className="text-xl font-bold">在你心動之前,想先問你三件事</h2>
              <p className="mt-1 text-sm text-ink-soft">
                沒有正確答案,也不會被記錄。只是被故事打動之後,這幾件事最容易被忽略——而它們才是往後每一天的樣子。
              </p>
              <ul className="mt-3 space-y-2">
                {expectationChecks(animal).map((q) => (
                  <li key={q} className="flex gap-2 text-ink-soft">
                    <span aria-hidden="true" className="text-brand-dark">?</span>
                    {q}
                  </li>
                ))}
              </ul>
            </section>
            )}

            <section aria-labelledby="daily" className="rounded-card border border-cream-dark bg-white p-6">
              <h2 id="daily" className="text-xl font-bold">一起生活的真實樣貌</h2>
              <p className="mt-1 text-sm text-ink-soft">心動之前,先看看真實的每一天。</p>
              <ul className="mt-3 space-y-2">
                {animal.dailyLife.map((d) => (
                  <li key={d} className="flex gap-2 text-ink-soft">
                    <span aria-hidden="true" className="text-sage">✓</span>{d}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="health" className="rounded-card border border-cream-dark bg-white p-6">
              <h2 id="health" className="text-xl font-bold">健康與醫療</h2>
              <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <div><dt className="text-sm text-ink-soft">疫苗</dt><dd className="font-medium">{animal.health.vaccinated ? '已完成' : '進行中'}</dd></div>
                <div><dt className="text-sm text-ink-soft">結紮</dt><dd className="font-medium">{animal.health.neutered ? '已完成' : '由中途安排中'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-sm text-ink-soft">檢驗</dt><dd className="font-medium">{animal.health.tested}</dd></div>
                <div><dt className="text-sm text-ink-soft">慢性狀況</dt><dd className="font-medium">{animal.health.chronic ?? '無'}</dd></div>
                <div><dt className="text-sm text-ink-soft">日常用藥</dt><dd className="font-medium">{animal.health.medication ?? '無'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-sm text-ink-soft">未來可能支出</dt><dd className="font-medium">{animal.health.futureCost}</dd></div>
              </dl>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <section aria-labelledby="goodfor" className="rounded-card bg-sage-light/70 p-6">
                <h2 id="goodfor" className="font-bold">適合的生活</h2>
                <ul className="mt-2 space-y-1 text-ink-soft">
                  {animal.goodFor.map((g) => <li key={g}>・{g}</li>)}
                </ul>
              </section>
              <section aria-labelledby="notfor" className="rounded-card bg-info-light p-6">
                <h2 id="notfor" className="font-bold">可能不適合</h2>
                <p className="mt-1 text-xs text-ink-soft">誠實說明不是拒絕,是為了牠和你都不受挫。</p>
                <ul className="mt-2 space-y-1 text-ink-soft">
                  {animal.notFor.map((g) => <li key={g}>・{g}</li>)}
                </ul>
              </section>
            </div>

            <section className="rounded-card border border-cream-dark bg-white p-6">
              <h2 className="text-xl font-bold">照護投入與中途支持</h2>
              <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <div><dt className="text-sm text-ink-soft">照護難度</dt><dd className="font-medium">{careLevelLabel[animal.careLevel]}</dd></div>
                <div><dt className="text-sm text-ink-soft">每週時間投入</dt><dd className="font-medium">{animal.weeklyHours}</dd></div>
                <div><dt className="text-sm text-ink-soft">每月預估支出</dt><dd className="font-medium">{animal.monthlyCost}</dd></div>
              </dl>
              <p className="mt-4 text-sm font-medium">中途可以提供的支持</p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {animal.fosterSupport.map((s) => <li key={s}><Tag tone="info">{s}</Tag></li>)}
              </ul>
            </section>
          </div>

          {/* 側欄 CTA */}
          <aside className="h-fit space-y-4 rounded-card border border-cream-dark bg-white p-6 lg:sticky lg:top-20">
            {step === 'view' && (
              <>
                <p className="font-bold">想更認識{animal.name}?</p>
                <p className="text-sm text-ink-soft">
                  先花 1 分鐘確認彼此的生活合不合,再預約實際見面。我們不用倒數或名額話術——牠值得你想清楚再來。
                </p>
                <button type="button" onClick={() => { track('booking_start', { animalId: animal.id }); setStep('check') }}
                  className="min-h-12 w-full rounded-lg bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark">
                  看看我們是否適合彼此
                </button>
                <Link to="/quiz" className="block text-center text-sm text-ink-soft underline underline-offset-4 hover:text-brand-dark">
                  還沒做過生活適配測驗?從這裡開始
                </Link>
              </>
            )}

            {step === 'check' && (
              <form onSubmit={(e) => { e.preventDefault(); setStep('book') }} className="space-y-4">
                <p className="font-bold">快速適配確認</p>
                <p className="text-sm text-ink-soft">4 題,沒有對錯——「還要確認」也是很好的答案,見面時我們一起討論。</p>
                {quickQuestions.map((q, qi) => (
                  <fieldset key={q.id}>
                    <legend className="text-sm font-medium">{qi + 1}. {q.text}</legend>
                    <div className="mt-1.5 space-y-1.5">
                      {q.options.map((o) => (
                        <label key={o} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-cream-dark px-3 py-2 text-sm has-checked:border-brand has-checked:bg-brand-light">
                          <input type="radio" name={q.id} value={o} checked={answers[q.id] === o}
                            onChange={() => setAnswers((a) => ({ ...a, [q.id]: o }))} className="accent-brand" />
                          {o}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <button type="submit" disabled={!allAnswered}
                  className="min-h-12 w-full rounded-lg bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-cream-dark disabled:text-ink-soft">
                  {allAnswered ? '繼續預約互動' : '請先回答上面的問題'}
                </button>
              </form>
            )}

            {step === 'book' && (
              <form onSubmit={submitBooking} className="space-y-4" noValidate>
                <p className="font-bold">預約與{animal.name}見面</p>
                <p className="text-sm text-ink-soft">實際互動後再決定,是對彼此最好的方式。</p>
                <fieldset>
                  <legend className="text-sm font-medium">互動方式</legend>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-cream-dark px-3 py-2 text-sm has-checked:border-brand has-checked:bg-brand-light">
                      <input type="radio" name="type" checked={bookType === 'onsite'} onChange={() => setBookType('onsite')} className="accent-brand" />
                      實體互動
                    </label>
                    <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-cream-dark px-3 py-2 text-sm has-checked:border-brand has-checked:bg-brand-light">
                      <input type="radio" name="type" checked={bookType === 'online'} onChange={() => setBookType('online')} className="accent-brand" />
                      線上諮詢
                    </label>
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="book-date" className="mb-1 block text-sm font-medium">希望日期</label>
                  <input id="book-date" type="date" value={bookDate}
                    aria-invalid={!!dateError} aria-describedby={dateError ? 'book-date-error' : undefined}
                    onChange={(e) => { setBookDate(e.target.value); setDateError('') }}
                    className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2 ${dateError ? 'border-danger' : 'border-cream-dark'}`} />
                  {dateError && <p id="book-date-error" role="alert" className="mt-1 text-sm text-danger">⚠ {dateError}</p>}
                </div>
                <button type="submit" className="min-h-12 w-full rounded-lg bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark">
                  送出預約
                </button>
                <button type="button" onClick={() => setStep('check')} className="min-h-11 w-full rounded-lg border border-cream-dark px-5 py-2 text-sm hover:bg-cream">
                  返回上一步(答案會保留)
                </button>
              </form>
            )}

            {step === 'done' && (
              <div className="space-y-3 text-center" role="status">
                <p aria-hidden="true" className="text-3xl">✓</p>
                <p className="font-bold">預約已送出</p>
                <p className="text-sm text-ink-soft">
                  中途會在 1–2 個工作天內與你確認時間。你可以在「我的進度」查看狀態,也可以先看看共同準備清單。
                </p>
                <Link to="/dashboard" className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-sage px-5 py-2.5 font-medium text-white hover:bg-sage-dark">
                  前往我的進度
                </Link>
              </div>
            )}
          </aside>
        </div>
      </Section>

      {similar.length > 0 && (
        <Section title="相似、但也許更適合你的夥伴">
          <div className="grid gap-5 sm:grid-cols-2">
            {similar.map((s) => s && <AnimalCard key={s.id} animal={s} />)}
          </div>
        </Section>
      )}
      <div className="mx-auto max-w-6xl px-4">
        {/* 供未來擴充:所有動物資料 */}
        <span className="sr-only">{animals.length} 位夥伴等待中</span>
      </div>
    </>
  )
}
