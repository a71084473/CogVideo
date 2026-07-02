import { useCallback, useRef, useState } from 'react'
import Hero from './components/Hero'
import StoryInput from './components/StoryInput'
import StoryboardResult from './components/StoryboardResult'
import { mockStoryboards } from './data/mockStoryboards'
import type { Storyboard } from './types'

export default function App() {
  const [story, setStory] = useState('')
  const [generating, setGenerating] = useState(false)
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null)
  const variantRef = useRef(0)

  /** 模擬呼叫 AI：延遲後輪替回傳一組 mock 分鏡 */
  const generate = useCallback(() => {
    setGenerating(true)
    window.setTimeout(() => {
      const next = mockStoryboards[variantRef.current % mockStoryboards.length]
      variantRef.current += 1
      setStoryboard(next)
      setGenerating(false)
      // 生成後把畫面帶到結果區
      window.setTimeout(() => {
        document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
    }, 1400)
  }, [])

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Hero />
      <StoryInput
        story={story}
        onStoryChange={setStory}
        onGenerate={generate}
        generating={generating}
      />
      {storyboard && (
        <StoryboardResult
          storyboard={storyboard}
          onRegenerate={generate}
          generating={generating}
        />
      )}
      <footer className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-[10px] tracking-widest2 text-faint">
          STORY · BOARD — A QUIET STORYBOARD PROTOTYPE
        </p>
      </footer>
    </div>
  )
}
