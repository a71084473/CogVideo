import type { StoryboardBeat } from '../types'
import SceneSketch from './SceneSketch'

interface Props {
  beat: StoryboardBeat
  index: number
}

/** 單一分鏡卡片：階段、線框場景、摘要、背景描述、情緒 */
export default function StoryboardCard({ beat, index }: Props) {
  const headingId = `beat-${beat.stage}-${index}`

  return (
    <article
      aria-labelledby={headingId}
      className="flex animate-fadeUp flex-col border border-ink bg-paper"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      {/* 階段標頭：h3 銜接區塊的 h2，維持標題層級連續 */}
      <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
        <h3 id={headingId} className="font-serif text-2xl text-ink">
          {beat.stage}
          <span className="sr-only">：第 {index + 1} 幕</span>
        </h3>
        <span aria-hidden className="text-xs tracking-widest2 text-faint">
          SC.{String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* 黑白線框場景預覽（只有背景，沒有人物） */}
      <div className="aspect-[8/5] border-b border-line p-3">
        <SceneSketch scene={beat.scene} />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <p className="font-serif text-base leading-relaxed text-ink">{beat.summary}</p>

        <dl className="flex flex-1 flex-col gap-4">
          <div>
            <dt className="mb-1 text-xs tracking-widest2 text-faint">背景畫面</dt>
            <dd className="text-sm leading-relaxed text-neutral-600">{beat.sceneDescription}</dd>
          </div>

          <div className="mt-auto border-t border-line pt-3">
            <dt className="mb-1 text-xs tracking-widest2 text-faint">情緒氛圍</dt>
            <dd className="text-sm text-ink">{beat.mood}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
