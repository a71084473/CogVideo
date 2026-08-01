import { useCallback, useRef, useState } from 'react'
import Hero from './components/Hero'
import StoryInput from './components/StoryInput'
import StoryboardResult from './components/StoryboardResult'
import ApiKeySettings from './components/ApiKeySettings'
import { mockStoryboards } from './data/mockStoryboards'
import { generateStoryboardFromStory } from './lib/generateStoryboard'
import type { Storyboard } from './types'

const API_KEY_STORAGE = 'storyboard-anthropic-api-key'

export default function App() {
  const [story, setStory] = useState('')
  const [generating, setGenerating] = useState(false)
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) ?? '')
  const attemptRef = useRef(0)

  const saveApiKey = useCallback((key: string) => {
    setApiKey(key)
    if (key) localStorage.setItem(API_KEY_STORAGE, key)
    else localStorage.removeItem(API_KEY_STORAGE)
  }, [])

  /** 有 API key 時呼叫 Claude 真實拆解；沒有時輪替 mock 分鏡 */
  const generate = useCallback(async () => {
    setGenerating(true)
    setError(null)
    try {
      let next: Storyboard
      if (apiKey) {
        next = await generateStoryboardFromStory(story, apiKey, attemptRef.current)
      } else {
        await new Promise((r) => window.setTimeout(r, 1400))
        next = mockStoryboards[attemptRef.current % mockStoryboards.length]
      }
      attemptRef.current += 1
      setStoryboard(next)
      // 生成後把畫面帶到結果區（尊重「減少動態效果」偏好）
      window.setTimeout(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        document
          .getElementById('result')
          ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
      }, 80)
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失敗，請再試一次。')
    } finally {
      setGenerating(false)
    }
  }, [apiKey, story])

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* 略過前言，直接跳到輸入區（WCAG 2.4.1 Bypass Blocks） */}
      <a
        href="#input"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        跳到「說一段您的回憶」
      </a>
      <Hero />
      <main>
        <StoryInput
          story={story}
          onStoryChange={setStory}
          onGenerate={generate}
          generating={generating}
          usingRealApi={Boolean(apiKey)}
          error={error}
          settings={<ApiKeySettings apiKey={apiKey} onApiKeyChange={saveApiKey} />}
        />
        {storyboard && (
          <StoryboardResult
            storyboard={storyboard}
            onRegenerate={generate}
            generating={generating}
          />
        )}
      </main>
      <footer className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-xs tracking-widest2 text-faint">
          MEMORY · GALLERY — 把回憶留成藝術品
        </p>
      </footer>
    </div>
  )
}
