import { useState } from 'react'
import { Section } from '../components/shared'
import { addSupportRequest, getSupportRequests } from '../lib/storage'
import type { SupportCategory, SupportRequest } from '../types'

const scenarios = [
  { t: '即將搬家', d: '我們提供「帶牠搬家指南」與新居安全檢核;找租屋時也有可養寵物的溝通範本。' },
  { t: '工作或出差改變', d: '一起盤點新的作息:自動餵食、寵物保姆名單、第二照顧者啟動,都是可行的方案。' },
  { t: '失業或經濟困難', d: '短期物資支援(飼料、砂、藥)與合作醫院分期方案,先撐過過渡期。' },
  { t: '動物突發醫療', d: '合作醫院轉介與醫療基金申請;特殊狀況可協助評估治療選項。' },
  { t: '家人或伴侶反對', d: '很多反對來自具體的擔心(过敏、清潔、費用)。我們有溝通指南,也可以安排三方談談。' },
  { t: '照顧者住院或出國', d: '啟動第二照顧者、短期寄宿或志工暫託,牠不會沒人照顧。' },
  { t: '真的無法繼續照顧', d: '請先聯絡我們。我們會一起確認是否還有方法;若真的需要,由原中途安排安全的交接。' },
]

const categories: SupportCategory[] = ['健康與醫療', '行為與互動', '飲食與排泄', '家庭與居住', '經濟與物資', '暫時無法照顧', '其他']

export default function Crisis() {
  const [category, setCategory] = useState<SupportCategory | ''>('')
  const [urgency, setUrgency] = useState<SupportRequest['urgency']>('一般')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ category?: string; message?: string }>({})
  const [submitted, setSubmitted] = useState(false)
  const [requests, setRequests] = useState(getSupportRequests)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!category) errs.category = '請選擇最接近的問題分類,我們才能找對的人來協助你。'
    if (message.trim().length < 5) errs.message = '請簡單描述一下狀況(至少幾句話),不用寫得完美,我們會再跟你確認細節。'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const req: SupportRequest = {
      id: `sr-${Date.now()}`,
      category: category as SupportCategory,
      urgency,
      message: message.trim(),
      status: '已送出',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    addSupportRequest(req)
    setRequests(getSupportRequests())
    setSubmitted(true)
  }

  return (
    <>
      <Section title="遇到困難了?一起找方法" subtitle="遇到問題不代表你不適合。越早告訴我們,越容易一起找到方法。">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => (
            <div key={s.t} className="rounded-card border border-cream-dark bg-white p-5">
              <h2 className="font-bold">{s.t}</h2>
              <p className="mt-1 text-sm text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-card bg-info-light p-6">
          <h2 className="font-bold">如果真的無法繼續照顧</h2>
          <p className="mt-1 text-ink-soft">
            我們會先一起評估:教育資源、物資支援、短期照護或轉介,常常能解決當下的困難。
            若評估後真的無法繼續,<strong className="text-ink">請務必優先聯絡原中途安排交接,不要私下轉送或棄養</strong>——
            這是認養合約中彼此的約定,也是牠安全的唯一保障。把牠交回來需要負責任的交接程序,但你不會因此被責怪。
          </p>
        </div>
      </Section>

      <Section title="我需要協助">
        <div className="max-w-2xl">
          {submitted ? (
            <div role="status" className="rounded-card border border-sage bg-sage-light/60 p-8 text-center">
              <p aria-hidden="true" className="text-3xl">✓</p>
              <p className="mt-2 text-lg font-bold">我們收到了</p>
              <p className="mt-1 text-ink-soft">
                {urgency === '緊急'
                  ? '緊急案件我們會在今天內與你聯絡。若是動物突發傷病,請先前往最近的動物醫院,費用問題之後一起想辦法。'
                  : '我們會在 1–2 個工作天內回覆你。謝謝你願意說出來——這正是負責任的表現。'}
              </p>
              <button type="button" onClick={() => { setSubmitted(false); setCategory(''); setMessage('') }}
                className="mt-4 min-h-11 rounded-lg border border-sage px-5 py-2 text-sage-dark hover:bg-white">
                回報另一個狀況
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-5 rounded-card border border-cream-dark bg-white p-6 md:p-8">
              <fieldset>
                <legend className="font-medium">問題分類</legend>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-describedby={errors.category ? 'cat-error' : undefined}>
                  {categories.map((c) => (
                    <label key={c} className="cursor-pointer">
                      <input type="radio" name="category" value={c} checked={category === c}
                        onChange={() => { setCategory(c); setErrors((e) => ({ ...e, category: undefined })) }}
                        className="peer sr-only" />
                      <span className="inline-flex min-h-11 items-center rounded-full border border-cream-dark px-4 py-2 text-sm peer-checked:border-brand peer-checked:bg-brand-light peer-checked:font-medium peer-checked:text-brand-dark peer-focus-visible:outline-3 peer-focus-visible:outline-brand">
                        {c}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.category && <p id="cat-error" role="alert" className="mt-2 text-sm text-danger">⚠ {errors.category}</p>}
              </fieldset>

              <fieldset>
                <legend className="font-medium">緊急程度</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(['一般', '儘快', '緊急'] as const).map((u) => (
                    <label key={u} className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-cream-dark text-sm has-checked:border-brand has-checked:bg-brand-light has-checked:font-medium">
                      <input type="radio" name="urgency" checked={urgency === u} onChange={() => setUrgency(u)} className="sr-only" />
                      {u}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="help-message" className="font-medium">發生了什麼事?</label>
                <p className="text-sm text-ink-soft">不用寫得完美,先讓我們知道大概的狀況。</p>
                <textarea id="help-message" rows={4} value={message}
                  aria-invalid={!!errors.message} aria-describedby={errors.message ? 'msg-error' : undefined}
                  onChange={(e) => { setMessage(e.target.value); setErrors((er) => ({ ...er, message: undefined })) }}
                  className={`mt-2 w-full rounded-lg border bg-white px-3 py-2 ${errors.message ? 'border-danger' : 'border-cream-dark'}`} />
                {errors.message && <p id="msg-error" role="alert" className="mt-1 text-sm text-danger">⚠ {errors.message}</p>}
              </div>

              <button type="submit" className="min-h-12 w-full rounded-lg bg-brand px-5 py-3 font-bold text-white hover:bg-brand-dark">
                送出求助
              </button>
              <p className="text-center text-xs text-ink-soft">求助內容僅中途團隊可見,不會被公開或用於評價你。</p>
            </form>
          )}

          {requests.length > 0 && (
            <div className="mt-6 rounded-card border border-cream-dark bg-white p-6">
              <h2 className="font-bold">我的求助紀錄</h2>
              <ul className="mt-3 space-y-2">
                {requests.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-cream px-4 py-2 text-sm">
                    <span>{r.createdAt}・{r.category}</span>
                    <span className="rounded-full bg-info-light px-3 py-0.5">{r.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>
    </>
  )
}
