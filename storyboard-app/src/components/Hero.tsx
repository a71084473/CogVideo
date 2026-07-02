export default function Hero() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <p className="mb-6 text-xs tracking-widest2 text-faint">
          STORY → STORYBOARD
        </p>
        <h1 className="font-serif text-4xl leading-snug tracking-wide text-ink md:text-6xl">
          把你的故事，
          <br />
          拆成起、承、轉、合。
        </h1>
        <p className="mt-8 max-w-md text-sm leading-relaxed text-faint md:text-base">
          說一段經歷，或寫下一段記憶。
          我們把它整理成四格電影分鏡——
          沒有主角的臉，只有房間、街道、海與光，
          替你把情緒留在場景裡。
        </p>
        {/* 裝飾用的四格空分鏡，暗示產品輸出 */}
        <div className="mt-12 grid max-w-md grid-cols-4 gap-2" aria-hidden>
          {['起', '承', '轉', '合'].map((s) => (
            <div
              key={s}
              className="flex aspect-[4/3] items-center justify-center border border-line text-xs text-faint"
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
