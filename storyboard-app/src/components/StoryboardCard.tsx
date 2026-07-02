import type { StoryboardBeat } from '../types'
import SceneSketch from './SceneSketch'

interface Props {
  beat: StoryboardBeat
  index: number
}

/** 單一分鏡卡片：階段、線框場景、摘要、背景描述、情緒 */
export default function StoryboardCard({ beat, index }: Props) {
  return (
    <article
      className="flex animate-fadeUp flex-col border border-ink bg-paper"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      {/* 階段標頭 */}
      <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
        <span className="font-serif text-2xl text-ink">{beat.stage}</span>
        <span className="text-[10px] tracking-widest2 text-faint">
          SC.{String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* 黑白線框場景預覽（只有背景，沒有人物） */}
      <div className="aspect-[8/5] border-b border-line p-3">
        <SceneSketch scene={beat.scene} />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <p className="font-serif text-base leading-relaxed text-ink">{beat.summary}</p>

        <div>
          <h4 className="mb-1 text-[10px] tracking-widest2 text-faint">背景畫面</h4>
          <p className="text-sm leading-relaxed text-neutral-600">{beat.sceneDescription}</p>
        </div>

        <div className="mt-auto border-t border-line pt-3">
          <h4 className="mb-1 text-[10px] tracking-widest2 text-faint">情緒氛圍</h4>
          <p className="text-sm text-ink">{beat.mood}</p>
        </div>
      </div>
    </article>
  )
}
