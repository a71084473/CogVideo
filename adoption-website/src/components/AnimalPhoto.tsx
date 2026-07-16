import type { Animal } from '../types'

// 示意用動物圖像:以 SVG 呈現溫暖的居家場景剪影。
// 正式上線時應替換為真實、比例一致、不裁切頭部的動物照片。
export function AnimalPhoto({ animal, className = '' }: { animal: Animal; className?: string }) {
  const isCat = animal.species === 'cat'
  return (
    <div
      className={`relative overflow-hidden bg-cream-dark ${className}`}
      style={{ aspectRatio: '4 / 3' }}
    >
      <svg
        viewBox="0 0 400 300"
        className="h-full w-full"
        role="img"
        aria-label={animal.photoAlt}
      >
        <rect width="400" height="300" fill="#EFE7D6" />
        {/* 窗光 */}
        <rect x="250" y="30" width="110" height="150" rx="8" fill="#F7F2E8" opacity="0.9" />
        <rect x="250" y="30" width="110" height="150" rx="8" fill="none" stroke="#DCD2BE" strokeWidth="4" />
        <line x1="305" y1="30" x2="305" y2="180" stroke="#DCD2BE" strokeWidth="4" />
        {/* 地板 */}
        <rect x="0" y="220" width="400" height="80" fill="#E5DCC8" />
        {/* 地毯 */}
        <ellipse cx="170" cy="245" rx="130" ry="28" fill="#DCE5DD" />
        {isCat ? (
          <g>
            {/* 貓剪影 */}
            <ellipse cx="170" cy="215" rx="58" ry="36" fill={animal.photoColor} />
            <circle cx="222" cy="185" r="26" fill={animal.photoColor} />
            <path d="M206 168 l8 -20 l12 14 z" fill={animal.photoColor} />
            <path d="M226 164 l12 -16 l6 20 z" fill={animal.photoColor} />
            <path d="M115 225 q-30 -6 -24 -34 q14 4 20 18" fill={animal.photoColor} />
            <circle cx="214" cy="184" r="3" fill="#2F3A35" />
            <circle cx="230" cy="184" r="3" fill="#2F3A35" />
            <path d="M218 194 q4 4 8 0" stroke="#2F3A35" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            {/* 狗剪影 */}
            <ellipse cx="165" cy="210" rx="62" ry="40" fill={animal.photoColor} />
            <circle cx="228" cy="178" r="28" fill={animal.photoColor} />
            <path d="M208 160 q-6 -22 6 -30 q10 8 8 26" fill={animal.photoColor} />
            <path d="M244 158 q10 -20 22 -18 q0 16 -12 26" fill={animal.photoColor} />
            <ellipse cx="238" cy="190" rx="12" ry="9" fill={animal.photoColor} stroke="#00000022" />
            <circle cx="220" cy="176" r="3.2" fill="#2F3A35" />
            <circle cx="236" cy="176" r="3.2" fill="#2F3A35" />
            <circle cx="242" cy="188" r="4" fill="#2F3A35" />
            <path d="M104 214 q-26 -14 -16 -36 q16 6 22 24" fill={animal.photoColor} />
          </g>
        )}
        {/* 盆栽 */}
        <rect x="330" y="196" width="26" height="26" rx="4" fill="#C4B598" />
        <path d="M343 196 q-16 -26 2 -40 q18 14 2 40" fill="#748C78" />
        <path d="M343 196 q-24 -12 -20 -32 q18 2 22 26" fill="#8CA490" />
      </svg>
      <span className="absolute right-2 bottom-2 rounded bg-ink/60 px-1.5 py-0.5 text-xs text-white">
        示意圖
      </span>
    </div>
  )
}
