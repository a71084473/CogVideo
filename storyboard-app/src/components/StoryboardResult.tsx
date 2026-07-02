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
  const header = `分鏡表 —《${sb.title}》\n${'─'.repeat(24)}\n`
  const rows = sb.beats
    .map(
      (b, i) =>
        `【${b.stage}】SC.${String(i + 1).padStart(2, '0')}\n` +
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
    <section id="result" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-serif text-2xl tracking-wide text-ink md:text-3xl">
            起承轉合分鏡
          </h2>
          <span className="text-xs tracking-widest2 text-faint">02 / STORYBOARD</span>
        </div>
        <p className="mb-10 font-serif text-sm text-faint">
          《{storyboard.title}》 · 四格 · 無人物 · 只以場景敘事
        </p>

        {/* 桌機四欄、平板兩欄、手機單欄 */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {storyboard.beats.map((beat, i) => (
            <StoryboardCard key={`${storyboard.id}-${beat.stage}`} beat={beat} index={i} />
          ))}
        </div>

        {/* 操作列 */}
        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <button
            onClick={onRegenerate}
            disabled={generating}
            className="border border-ink px-8 py-3 text-sm tracking-widest2 text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-line disabled:text-faint"
          >
            {generating ? '重新拆解中……' : '重新生成'}
          </button>
          <button
            onClick={copyBoard}
            className="border border-line px-8 py-3 text-sm tracking-widest2 text-ink transition-colors hover:border-ink"
          >
            {copied ? '已複製 ✓' : '複製分鏡表'}
          </button>
          <p className="text-xs text-faint md:ml-2">
            複製後可直接貼進企劃書或筆記。
          </p>
        </div>
      </div>
    </section>
  )
}
