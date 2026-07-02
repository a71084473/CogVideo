import type { SceneType } from '../types'

/**
 * 黑白線框場景預覽。
 * 每個場景都是純背景：空間、物件、光影——刻意不畫任何人物或角色，
 * 讓觀者把自己的故事投射進畫面。
 * 統一使用細線 (strokeWidth 1~1.5)、灰階、少量斜線陰影模擬鉛筆草圖質感。
 */

const stroke = '#2b2b2b'
const faint = '#9a9a94'

interface Props {
  scene: SceneType
  className?: string
}

export default function SceneSketch({ scene, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 240 150"
      role="img"
      aria-label={`場景草圖：${scene}`}
      className={`h-full w-full ${className}`}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {scenes[scene]}
    </svg>
  )
}

/** 斜線陰影（鉛筆排線） */
function Hatch({
  x,
  y,
  w,
  h,
  gap = 6,
  opacity = 0.35,
}: {
  x: number
  y: number
  w: number
  h: number
  gap?: number
  opacity?: number
}) {
  const lines = []
  for (let i = -h; i < w; i += gap) {
    lines.push(
      <line
        key={i}
        x1={x + Math.max(i, 0)}
        y1={y + Math.max(-i, 0)}
        x2={x + Math.min(i + h, w)}
        y2={y + Math.min(h, w - i)}
        stroke={faint}
        strokeWidth={0.6}
        opacity={opacity}
      />,
    )
  }
  return <g>{lines}</g>
}

const scenes: Record<SceneType, JSX.Element> = {
  /* 窗與雨：窗框、玻璃上的雨滴軌跡、窗台 */
  'window-rain': (
    <g stroke={stroke} strokeWidth={1.2}>
      <rect x={50} y={18} width={140} height={104} />
      <line x1={120} y1={18} x2={120} y2={122} />
      <line x1={50} y1={70} x2={190} y2={70} />
      <rect x={42} y={122} width={156} height={8} strokeWidth={1} />
      {/* 雨滴軌跡 */}
      <g stroke={faint} strokeWidth={0.9}>
        <line x1={70} y1={26} x2={68} y2={46} />
        <line x1={94} y1={34} x2={92} y2={60} />
        <line x1={140} y1={24} x2={138} y2={40} />
        <line x1={162} y1={40} x2={160} y2={64} />
        <line x1={80} y1={80} x2={78} y2={102} />
        <line x1={150} y1={78} x2={148} y2={108} />
        <line x1={174} y1={90} x2={172} y2={104} />
      </g>
      {/* 窗外遠景：模糊的屋頂線 */}
      <polyline points="54,60 78,48 102,58 116,50" stroke={faint} strokeWidth={0.8} />
      <polyline points="124,56 150,46 172,56 186,50" stroke={faint} strokeWidth={0.8} />
      <Hatch x={42} y={131} w={156} h={10} gap={7} />
    </g>
  ),

  /* 空房間與椅子：透視線、單椅、地板影子 */
  'empty-room': (
    <g stroke={stroke} strokeWidth={1.2}>
      {/* 房間透視 */}
      <polyline points="10,10 10,140 230,140 230,10" stroke={faint} strokeWidth={0.8} />
      <rect x={62} y={34} width={116} height={72} stroke={faint} strokeWidth={0.9} />
      <line x1={10} y1={10} x2={62} y2={34} stroke={faint} strokeWidth={0.8} />
      <line x1={230} y1={10} x2={178} y2={34} stroke={faint} strokeWidth={0.8} />
      <line x1={10} y1={140} x2={62} y2={106} stroke={faint} strokeWidth={0.8} />
      <line x1={230} y1={140} x2={178} y2={106} stroke={faint} strokeWidth={0.8} />
      {/* 一把空椅子 */}
      <g strokeWidth={1.3}>
        <line x1={104} y1={72} x2={104} y2={112} />
        <line x1={126} y1={72} x2={126} y2={112} />
        <line x1={104} y1={92} x2={126} y2={92} />
        <line x1={104} y1={72} x2={126} y2={72} />
        <line x1={104} y1={92} x2={98} y2={116} />
        <line x1={126} y1={92} x2={132} y2={116} />
      </g>
      {/* 地板上的斜影 */}
      <Hatch x={130} y={100} w={70} h={26} gap={5} opacity={0.3} />
    </g>
  ),

  /* 夜街與路燈：路的透視、路燈、燈下光暈 */
  'street-lamp': (
    <g stroke={stroke} strokeWidth={1.2}>
      <line x1={0} y1={132} x2={240} y2={132} strokeWidth={1} />
      {/* 路的透視 */}
      <line x1={30} y1={150} x2={112} y2={70} stroke={faint} strokeWidth={0.9} />
      <line x1={210} y1={150} x2={128} y2={70} stroke={faint} strokeWidth={0.9} />
      <line x1={112} y1={70} x2={128} y2={70} stroke={faint} strokeWidth={0.9} />
      {/* 路燈 */}
      <line x1={178} y1={132} x2={178} y2={34} strokeWidth={1.4} />
      <path d="M178 34 Q178 24 166 24" strokeWidth={1.4} />
      <circle cx={162} cy={26} r={4} />
      {/* 光暈：放射細線 */}
      <g stroke={faint} strokeWidth={0.7}>
        <line x1={158} y1={34} x2={140} y2={70} />
        <line x1={162} y1={36} x2={154} y2={72} />
        <line x1={166} y1={36} x2={170} y2={72} />
        <ellipse cx={156} cy={128} rx={30} ry={4} />
      </g>
      {/* 遠景建築剪影 */}
      <polyline
        points="0,110 24,110 24,92 48,92 48,104 70,104 70,84 92,84 92,110"
        stroke={faint}
        strokeWidth={0.8}
      />
      <Hatch x={2} y={86} w={88} h={22} gap={8} opacity={0.25} />
    </g>
  ),

  /* 長廊：一點透視、柱影、盡頭亮窗 */
  corridor: (
    <g stroke={stroke} strokeWidth={1.1}>
      <rect x={100} y={54} width={40} height={44} strokeWidth={1.3} />
      {/* 透視線 */}
      <line x1={0} y1={0} x2={100} y2={54} stroke={faint} strokeWidth={0.8} />
      <line x1={240} y1={0} x2={140} y2={54} stroke={faint} strokeWidth={0.8} />
      <line x1={0} y1={150} x2={100} y2={98} stroke={faint} strokeWidth={0.8} />
      <line x1={240} y1={150} x2={140} y2={98} stroke={faint} strokeWidth={0.8} />
      {/* 兩側柱 */}
      <g strokeWidth={1.1}>
        <line x1={40} y1={22} x2={40} y2={128} />
        <line x1={70} y1={38} x2={70} y2={113} />
        <line x1={200} y1={22} x2={200} y2={128} />
        <line x1={170} y1={38} x2={170} y2={113} />
      </g>
      {/* 地板上的柱影 */}
      <g stroke={faint} strokeWidth={0.8}>
        <line x1={40} y1={128} x2={62} y2={136} />
        <line x1={70} y1={113} x2={86} y2={120} />
        <line x1={200} y1={128} x2={178} y2={136} />
        <line x1={170} y1={113} x2={154} y2={120} />
      </g>
      {/* 盡頭的光 */}
      <g stroke={faint} strokeWidth={0.6}>
        <line x1={104} y1={58} x2={136} y2={94} />
        <line x1={136} y1={58} x2={104} y2={94} />
      </g>
    </g>
  ),

  /* 海平線：水平線、緩浪、沙灘退潮痕 */
  'sea-horizon': (
    <g stroke={stroke} strokeWidth={1.1}>
      <line x1={0} y1={62} x2={240} y2={62} strokeWidth={1.3} />
      {/* 雲的細線 */}
      <g stroke={faint} strokeWidth={0.8}>
        <line x1={26} y1={30} x2={74} y2={30} />
        <line x1={40} y1={36} x2={96} y2={36} />
        <line x1={150} y1={24} x2={196} y2={24} />
      </g>
      {/* 海面波紋 */}
      <g stroke={faint} strokeWidth={0.8}>
        <path d="M10 76 q14 -4 28 0 t28 0" />
        <path d="M120 82 q16 -4 32 0 t32 0" />
        <path d="M50 94 q18 -5 36 0 t36 0" />
      </g>
      {/* 沙灘與退潮痕 */}
      <path d="M0 112 Q80 104 240 116" strokeWidth={1} />
      <g stroke={faint} strokeWidth={0.7}>
        <path d="M20 124 Q90 118 220 128" />
        <path d="M40 136 Q110 130 200 140" />
      </g>
    </g>
  ),

  /* 微開的門與光：門板、門縫灑進的長條光 */
  'door-light': (
    <g stroke={stroke} strokeWidth={1.2}>
      <line x1={0} y1={128} x2={240} y2={128} strokeWidth={1} />
      {/* 門框 */}
      <rect x={88} y={20} width={64} height={108} strokeWidth={1.3} />
      {/* 微開的門板（透視） */}
      <polygon points="92,24 128,32 128,124 92,128" strokeWidth={1.2} />
      <circle cx={122} cy={80} r={2.5} />
      {/* 門縫灑進的光 */}
      <g stroke={faint} strokeWidth={0.8}>
        <line x1={130} y1={124} x2={196} y2={148} />
        <line x1={130} y1={100} x2={216} y2={140} />
        <line x1={130} y1={70} x2={228} y2={124} />
      </g>
      {/* 門內過曝區的排線對比：門外牆面 */}
      <Hatch x={10} y={30} w={66} h={90} gap={9} opacity={0.22} />
      <Hatch x={162} y={30} w={68} h={70} gap={9} opacity={0.22} />
    </g>
  ),

  /* 山稜與小徑：層疊山線、蜿蜒小路、電線杆 */
  'mountain-path': (
    <g stroke={stroke} strokeWidth={1.1}>
      {/* 遠中近三層山稜 */}
      <polyline points="0,58 40,34 76,52 118,26 160,50 200,32 240,54" strokeWidth={1.2} />
      <polyline points="0,80 52,60 96,76 150,56 198,74 240,64" stroke={faint} strokeWidth={0.9} />
      <Hatch x={100} y={30} w={44} h={20} gap={5} opacity={0.3} />
      {/* 蜿蜒小徑 */}
      <path d="M112 150 C120 128 96 116 108 100 C118 88 104 82 110 74" strokeWidth={1} />
      <path
        d="M132 150 C140 128 114 114 126 98 C136 86 120 82 126 74"
        stroke={faint}
        strokeWidth={0.9}
      />
      {/* 電線杆 */}
      <g strokeWidth={1}>
        <line x1={186} y1={148} x2={186} y2={92} />
        <line x1={176} y1={100} x2={196} y2={100} />
        <line x1={40} y1={140} x2={40} y2={104} stroke={faint} strokeWidth={0.9} />
        <line x1={34} y1={110} x2={46} y2={110} stroke={faint} strokeWidth={0.9} />
      </g>
      {/* 電線 */}
      <path d="M46 108 Q116 124 176 98" stroke={faint} strokeWidth={0.6} />
    </g>
  ),

  /* 城市建築輪廓：天際線、亮起的窗格 */
  'city-skyline': (
    <g stroke={stroke} strokeWidth={1.1}>
      <line x1={0} y1={132} x2={240} y2={132} strokeWidth={1} />
      {/* 建築群 */}
      <polyline points="14,132 14,70 46,70 46,132" />
      <polyline points="58,132 58,44 92,44 92,132" strokeWidth={1.3} />
      <polyline points="104,132 104,86 128,86 128,132" />
      <polyline points="140,132 140,30 168,30 168,132" strokeWidth={1.3} />
      <polyline points="180,132 180,60 214,60 214,132" />
      <line x1={148} y1={30} x2={148} y2={20} />
      {/* 窗格：一部分亮起（實心）一部分只有框 */}
      <g strokeWidth={0.8}>
        <rect x={64} y={54} width={6} height={7} />
        <rect x={78} y={54} width={6} height={7} fill={stroke} />
        <rect x={64} y={70} width={6} height={7} fill={stroke} />
        <rect x={78} y={86} width={6} height={7} />
        <rect x={146} y={42} width={6} height={7} fill={stroke} />
        <rect x={158} y={42} width={6} height={7} />
        <rect x={146} y={60} width={6} height={7} />
        <rect x={158} y={78} width={6} height={7} fill={stroke} />
        <rect x={22} y={82} width={6} height={7} />
        <rect x={34} y={98} width={6} height={7} fill={stroke} />
        <rect x={188} y={72} width={6} height={7} fill={stroke} />
        <rect x={200} y={90} width={6} height={7} />
      </g>
      {/* 天空的一層薄霧 */}
      <line x1={20} y1={20} x2={80} y2={20} stroke={faint} strokeWidth={0.7} />
      <line x1={180} y1={14} x2={228} y2={14} stroke={faint} strokeWidth={0.7} />
    </g>
  ),
}
