export default function Hero() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <p className="mb-6 text-xs tracking-widest2 text-faint">
          MEMORY → GALLERY
        </p>
        <h1 className="font-serif text-4xl leading-snug tracking-wide text-ink md:text-6xl">
          把您的故事，
          <br />
          留成一件藝術品。
        </h1>
        <p className="mt-8 max-w-md text-base leading-loose text-faint md:text-lg">
          說一段舊時光——嫁妝的裁縫車、巷口的麵攤、
          回鄉的那班火車。我們把回憶整理成
          起、承、轉、合四幕分鏡，像老照片一樣掛進畫框。
          畫面裡沒有人物的臉，只有您記得的光線與場景，
          把想像留給回憶本身。
        </p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-faint">
          適合與家人一起使用：長輩慢慢說，家人幫忙按，
          一段口述就是一件作品。
        </p>
        {/* 裝飾用的四格空分鏡，暗示產品輸出 */}
        <div className="mt-12 grid max-w-md grid-cols-4 gap-2" aria-hidden>
          {['起', '承', '轉', '合'].map((s) => (
            <div
              key={s}
              className="flex aspect-[4/3] items-center justify-center border border-line text-sm text-faint"
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
