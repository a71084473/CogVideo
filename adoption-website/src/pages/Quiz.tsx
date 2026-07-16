import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { quizQuestions, totalMinutes } from '../data/quiz'
import { ProgressBar, Section, WhyWeAsk } from '../components/shared'
import {
  getQuizAnswers, getQuizStep, saveQuizAnswers, saveQuizStep, saveMatchResult,
  type QuizAnswers,
} from '../lib/storage'
import { computeMatch } from '../lib/match'

export default function Quiz() {
  const navigate = useNavigate()
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState<number>(getQuizStep)
  const [answers, setAnswers] = useState<QuizAnswers>(getQuizAnswers)
  const [error, setError] = useState('')

  const hasSaved = Object.keys(answers).length > 0
  const q = quizQuestions[step]
  const remaining = Math.max(1, Math.round(totalMinutes * (1 - step / quizQuestions.length)))

  function select(value: string) {
    setError('')
    if (q.multi) {
      const cur = (answers[q.id] as string[]) ?? []
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
      const updated = { ...answers, [q.id]: next }
      setAnswers(updated)
      saveQuizAnswers(updated)
    } else {
      const updated = { ...answers, [q.id]: value }
      setAnswers(updated)
      saveQuizAnswers(updated)
    }
  }

  function goNext() {
    const a = answers[q.id]
    if (!a || (Array.isArray(a) && a.length === 0)) {
      setError(q.multi ? '請至少選擇一個選項。如果都不確定,可以選最接近的。' : '請選擇一個最接近你狀況的選項,才能繼續下一題。')
      return
    }
    if (step + 1 >= quizQuestions.length) {
      const result = computeMatch(answers)
      saveMatchResult(result)
      saveQuizStep(0)
      navigate('/quiz/result')
      return
    }
    setStep(step + 1)
    saveQuizStep(step + 1)
    setError('')
  }

  function goBack() {
    if (step > 0) {
      setStep(step - 1)
      saveQuizStep(step - 1)
      setError('')
    }
  }

  if (!started) {
    return (
      <Section title="生活適配測驗" subtitle="找到適合彼此的關係,從誠實認識自己的生活開始。">
        <div className="max-w-2xl space-y-5 rounded-card border border-cream-dark bg-white p-8">
          <ul className="space-y-2 text-ink-soft">
            <li>・約 {totalMinutes} 分鐘、共 {quizQuestions.length} 題,一步一題,可以隨時離開,進度會自動儲存。</li>
            <li>・這不是考試,沒有「通過或淘汰」。結果是生活準備建議,不是人格評分。</li>
            <li>・每一題都會說明為什麼需要詢問。誠實回答,才能找到真正合拍的夥伴。</li>
            <li>・我們不用年齡、收入、職業或是否有房單獨判斷任何人。</li>
          </ul>
          <div className="rounded-lg bg-info-light p-4 text-sm text-ink-soft">
            <p className="font-medium text-ink">你的資料如何被使用?</p>
            <p>回答僅儲存在你自己的瀏覽器中(原型階段),只用於推薦與準備建議,不會傳送給第三方。正式版將提供查看、修改與刪除功能。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setStarted(true)}
              className="min-h-12 rounded-lg bg-brand px-6 py-3 text-lg font-bold text-white hover:bg-brand-dark">
              {hasSaved ? '繼續上次的測驗' : '開始測驗'}
            </button>
            {hasSaved && (
              <button type="button"
                onClick={() => { setAnswers({}); saveQuizAnswers({}); setStep(0); saveQuizStep(0); setStarted(true) }}
                className="min-h-12 rounded-lg border border-cream-dark px-6 py-3 text-ink-soft hover:bg-cream">
                從頭開始
              </button>
            )}
          </div>
        </div>
      </Section>
    )
  }

  const current = answers[q.id]

  return (
    <Section>
      <div className="mx-auto max-w-2xl">
        <ProgressBar value={step + 1} max={quizQuestions.length} label={`第 ${step + 1} 題,共 ${quizQuestions.length} 題・預估還需 ${remaining} 分鐘`} />
        <form
          onSubmit={(e) => { e.preventDefault(); goNext() }}
          className="mt-6 rounded-card border border-cream-dark bg-white p-6 md:p-8"
        >
          <p className="text-sm font-medium text-sage-dark">{q.section}</p>
          <fieldset>
            <legend className="mt-1 text-xl font-bold">{q.question}</legend>
            {q.multi && <p className="mt-1 text-sm text-ink-soft">可複選。</p>}
            <div className="mt-4 space-y-2">
              {q.options.map((o) => {
                const checked = q.multi ? ((current as string[]) ?? []).includes(o.value) : current === o.value
                return (
                  <label key={o.value}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-cream-dark px-4 py-3 has-checked:border-brand has-checked:bg-brand-light">
                    <input
                      type={q.multi ? 'checkbox' : 'radio'}
                      name={q.id}
                      value={o.value}
                      checked={checked}
                      onChange={() => select(o.value)}
                      className="h-4 w-4 accent-brand"
                    />
                    {o.label}
                  </label>
                )
              })}
            </div>
          </fieldset>
          {error && <p role="alert" className="mt-3 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">⚠ {error}</p>}
          <WhyWeAsk>{q.whyWeAsk}</WhyWeAsk>
          {q.sensitive && (
            <p className="mt-2 text-xs text-ink-soft">
              ⓘ 這題涉及較私人的資訊:僅用於媒合建議,儲存在你的瀏覽器中,不會被公開或提供給第三方。
            </p>
          )}
          <div className="mt-6 flex justify-between gap-3">
            <button type="button" onClick={goBack} disabled={step === 0}
              className="min-h-11 rounded-lg border border-cream-dark px-5 py-2 text-ink-soft hover:bg-cream disabled:invisible">
              上一題
            </button>
            <button type="submit" className="min-h-11 rounded-lg bg-brand px-6 py-2 font-bold text-white hover:bg-brand-dark">
              {step + 1 === quizQuestions.length ? '看我的結果' : '下一題'}
            </button>
          </div>
        </form>
        <p className="mt-3 text-center text-sm text-ink-soft">進度已自動儲存,離開後可以隨時回來續填。</p>
      </div>
    </Section>
  )
}
