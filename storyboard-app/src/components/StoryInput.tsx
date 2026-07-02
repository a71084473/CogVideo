import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { InputMode, RecordingState } from '../types'
import { mockTranscript } from '../data/mockStoryboards'

interface Props {
  story: string
  onStoryChange: (v: string) => void
  onGenerate: () => void
  generating: boolean
  usingRealApi: boolean
  error: string | null
  settings?: ReactNode
}

/**
 * 故事輸入區：文字 / 聲音 兩種模式。
 * 聲音模式是純前端模擬：錄音中 → 停止 → 轉文字中 → 把 mock 逐字稿填進故事。
 */
export default function StoryInput({
  story,
  onStoryChange,
  onGenerate,
  generating,
  usingRealApi,
  error,
  settings,
}: Props) {
  const [mode, setMode] = useState<InputMode>('text')
  const [recState, setRecState] = useState<RecordingState>('idle')
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef<number>()

  // 錄音計時器
  useEffect(() => {
    if (recState === 'recording') {
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    }
    return () => window.clearInterval(timerRef.current)
  }, [recState])

  const startRecording = () => {
    setSeconds(0)
    setRecState('recording')
  }

  const stopRecording = () => {
    setRecState('transcribing')
    // 模擬語音轉文字的等待時間
    window.setTimeout(() => {
      onStoryChange(mockTranscript)
      setRecState('done')
    }, 1800)
  }

  const resetRecording = () => {
    setRecState('idle')
    setSeconds(0)
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const canGenerate = story.trim().length > 0 && !generating

  return (
    <section id="input" className="border-b border-line">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-2xl tracking-wide text-ink md:text-3xl">
            輸入你的故事
          </h2>
          <span className="text-xs tracking-widest2 text-faint">01 / INPUT</span>
        </div>

        {/* 文字 / 聲音 切換 */}
        <div className="mb-6 inline-flex border border-ink" role="tablist" aria-label="輸入模式">
          {(
            [
              ['text', '文字輸入'],
              ['voice', '聲音輸入'],
            ] as [InputMode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 text-sm tracking-widest transition-colors ${
                mode === m ? 'bg-ink text-paper' : 'bg-transparent text-ink hover:bg-neutral-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'text' ? (
          <textarea
            value={story}
            onChange={(e) => onStoryChange(e.target.value)}
            placeholder="說一段你想被記住的故事……"
            rows={7}
            className="w-full resize-y border border-line bg-transparent p-5 font-serif text-base leading-loose text-ink placeholder:text-faint focus:border-ink focus:outline-none"
          />
        ) : (
          <div className="flex flex-col items-center border border-line px-6 py-12">
            {recState === 'idle' && (
              <>
                <button
                  onClick={startRecording}
                  aria-label="開始錄音"
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  {/* 麥克風線框圖示 */}
                  <MicIcon />
                </button>
                <p className="mt-5 text-sm text-faint">按下開始，說一段你想被記住的故事……</p>
              </>
            )}

            {recState === 'recording' && (
              <>
                <button
                  onClick={stopRecording}
                  aria-label="停止錄音"
                  className="relative flex h-20 w-20 items-center justify-center rounded-full border border-ink"
                >
                  <span className="absolute inset-0 animate-breathe rounded-full border border-faint" />
                  <span className="h-6 w-6 bg-ink" aria-hidden />
                </button>
                <p className="mt-5 font-mono text-sm tabular-nums text-ink">{mmss}</p>
                <p className="mt-1 text-xs tracking-widest text-faint">錄音中 · 點擊方塊停止</p>
                {/* 線框聲波 */}
                <div className="mt-4 flex h-6 items-end gap-1" aria-hidden>
                  {[3, 5, 2, 6, 4, 6, 3, 5, 2, 4].map((h, i) => (
                    <span
                      key={i}
                      className="w-px animate-breathe bg-ink"
                      style={{ height: `${h * 4}px`, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              </>
            )}

            {recState === 'transcribing' && (
              <>
                <div className="h-20 w-20 animate-breathe rounded-full border border-dashed border-faint" />
                <p className="mt-5 text-sm tracking-widest text-faint">正在把聲音整理成文字……</p>
              </>
            )}

            {recState === 'done' && (
              <div className="w-full">
                <p className="mb-3 text-xs tracking-widest text-faint">
                  轉換完成 · 你可以直接編輯
                </p>
                <textarea
                  value={story}
                  onChange={(e) => onStoryChange(e.target.value)}
                  rows={5}
                  className="w-full resize-y border border-line bg-transparent p-5 font-serif text-base leading-loose text-ink focus:border-ink focus:outline-none"
                />
                <button
                  onClick={resetRecording}
                  className="mt-3 text-xs tracking-widest text-faint underline underline-offset-4 hover:text-ink"
                >
                  重新錄一次
                </button>
              </div>
            )}
          </div>
        )}

        {/* 生成按鈕 */}
        <div className="mt-8 flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-6">
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="border border-ink bg-ink px-10 py-3 text-sm tracking-widest2 text-paper transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-faint"
          >
            {generating
              ? usingRealApi
                ? 'Claude 正在拆解故事……'
                : '正在拆解故事……'
              : '生成分鏡'}
          </button>
          <p className="text-xs text-faint">
            {usingRealApi
              ? '由 Claude 依你的故事真實生成起承轉合。'
              : '尚未設定 API key，將以 mock 資料示範流程。'}
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-4 border border-ink px-4 py-3 text-sm text-ink">
            ⚠ {error}
          </p>
        )}

        {settings}
      </div>
    </section>
  )
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.2}>
      <rect x={9} y={3} width={6} height={11} rx={3} />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1={12} y1={18} x2={12} y2={21} />
      <line x1={8} y1={21} x2={16} y2={21} />
    </svg>
  )
}
