import { useState } from 'react'
import type { Storyboard } from '../types'
import StoryboardCard from './StoryboardCard'

interface Props {
  storyboard: Storyboard
  onRegenerate: () => void
  generating: boolean
}

/** 把分鏡表整理成可貼到文件的純文字 */
function toPlainText(sb: Storyboard): string {
  const date = new Date().toLocaleDateString('zh-TW')
  const header = `回憶藝術品 —《${sb.title}》 口述於 ${date}\n${'─'.repeat(24)}\n`
  const rows = sb.beats
    .map(
      (b, i) =>
        `【${b.stage}】第 ${i + 1} 幕\n` +
        `劇情摘要：${b.summary}\n` +
        `背景畫面：${b.sceneDescription}\n` +
        `情緒氛圍：${b.mood}\n`,
    )
    .join('\n')
  return header + rows
}

export default function StoryboardResult({ storyboard, onRegenerate, generating }: Props) {
  const [copied, setCopied] = useState(false)

  const copyBoard = async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(storyboard))
    } catch {
      // 剪貼簿權限被拒時退回舊 API
      const ta = document.createElement('textarea')
      ta.value = toPlainText(storyboard)
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="result" aria-labelledby="result-heading" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-3 flex items-end justify-between">
          <h2
            id="result-heading"
            className="font-serif text-2xl tracking-wide text-ink md:text-3xl"
          >
            回憶的四幕
          </h2>
          <span className="text-xs tracking-widest2 text-faint">02 / GALLERY</span>
        </div>
        <p className="mb-10 font-serif text-sm text-faint">
          一段口述，一件作品 · 無人物 · 只以場景敘事
        </p>

        {/* 畫框：雙層細框，把四幕分鏡裱成一件作品 */}
        <div className="border border-ink p-2 md:p-3">
          <div className="border border-line px-4 py-8 md:px-8 md:py-10">
            {/* 桌機四欄、平板兩欄、手機單欄 */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {storyboard.beats.map((beat, i) => (
                <StoryboardCard key={`${storyboard.id}-${beat.stage}`} beat={beat} index={i} />
              ))}
            </div>
            {/* 作品銘牌 */}
            <div className="mt-8 flex flex-col items-center gap-1 border-t border-line pt-6 text-center">
              <p className="font-serif text-xl tracking-wide text-ink">《{storyboard.title}》</p>
              <p className="text-xs tracking-widest text-faint">
                口述回憶 · {new Date().toLocaleDateString('zh-TW')} · 起承轉合四幕
              </p>
            </div>
          </div>
        </div>

        {/* 操作列 */}
        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={generating}
            aria-busy={generating}
            className="border border-ink px-8 py-3 text-sm tracking-widest2 text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-field disabled:text-faint"
          >
            {generating ? '重新拆解中……' : '重新生成'}
          </button>
          <button
            type="button"
            onClick={copyBoard}
            className="border border-field px-8 py-3 text-sm tracking-widest2 text-ink transition-colors hover:border-ink"
          >
            {copied ? '已複製 ✓' : '複製分鏡表'}
          </button>
          <p className="text-xs text-faint md:ml-2">
            複製後可貼給家人，或收進家族的回憶記錄裡。
          </p>
        </div>

        {/* 複製結果的狀態播報（WCAG 4.1.3 Status Messages） */}
        <p role="status" className="sr-only">
          {copied ? '分鏡表已複製到剪貼簿' : ''}
        </p>
      </div>
    </section>
  )
}
