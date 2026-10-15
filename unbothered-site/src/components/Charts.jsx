import { useId } from 'react'

// React ids contain ':' which breaks url(#id) references
const useSvgId = () => 'h' + useId().replace(/:/g, '')

const W = 300
const H = 120

function Hatch({ id, gap = 5 }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={gap} height={gap} patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2={gap} stroke="white" strokeOpacity="0.75" strokeWidth="1" />
    </pattern>
  )
}

const dotted = { fill: 'none', stroke: '#FFF200', strokeWidth: 2.2, strokeLinecap: 'round', strokeDasharray: '0.1 6' }

/** 001 — demand bars vs. capacity (yellow dotted) that's always one step ahead */
export function RushChart() {
  const id = useSvgId()
  const bars = [22, 30, 26, 44, 58, 52, 74, 88, 70, 62]
  const bw = 18
  const step = (W - 20) / bars.length
  const cap = bars.map((h, i) => [10 + i * step + bw / 2, H - 14 - Math.min(96, h + 16)])
  return (
    <svg className="chart w-full" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs><Hatch id={id} /></defs>
      <line x1="0" y1={H - 14} x2={W} y2={H - 14} stroke="white" strokeOpacity="0.5" />
      {bars.map((h, i) => (
        <rect key={i} className="bar" style={{ '--i': i }} x={10 + i * step} y={H - 14 - h} width={bw} height={h} fill={`url(#${id})`} stroke="white" strokeOpacity="0.8" />
      ))}
      <g className="trace">
        <polyline points={cap.map((p) => p.join(',')).join(' ')} {...dotted} />
      </g>
      <text x="0" y={H - 1} fill="white" fillOpacity="0.6" fontSize="8" letterSpacing="1.5">DEMAND</text>
      <text x={W} y={H - 1} textAnchor="end" fill="#FFF200" fontSize="8" letterSpacing="1.5">CAPACITY</text>
    </svg>
  )
}

/** 002 — request path as a timeline of hatched ellipses (hops) with a dotted route */
export function RouteChart() {
  const id = useSvgId()
  const hops = ['DNS', 'EDGE', 'LB', 'POD', 'DB']
  const step = (W - 60) / (hops.length - 1)
  return (
    <svg className="chart w-full" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs><Hatch id={id} gap={4} /></defs>
      <line x1="0" y1="60" x2={W} y2="60" stroke="white" strokeOpacity="0.35" />
      <g className="trace">
        <path
          d={`M30 60 ${hops.slice(1).map((_, i) => `Q ${30 + step * (i + 0.5)} ${i % 2 ? 92 : 28} ${30 + step * (i + 1)} 60`).join(' ')}`}
          {...dotted}
        />
      </g>
      {hops.map((h, i) => (
        <g key={h} className="pop" style={{ '--i': i }}>
          <ellipse cx={30 + i * step} cy="60" rx="22" ry="13" fill={`url(#${id})`} stroke="white" strokeOpacity="0.85" />
          <text x={30 + i * step} y="94" textAnchor="middle" fill="white" fillOpacity="0.7" fontSize="8" letterSpacing="1.5">{h}</text>
        </g>
      ))}
      <text x="0" y="12" fill="#FFF200" fontSize="8" letterSpacing="1.5">P99 · 28MS</text>
    </svg>
  )
}

/** 003 — a node drops out, traffic fails over; uptime (dotted) never moves */
export function RecoveryChart() {
  const id = useSvgId()
  const bars = [70, 72, 69, 8, 4, 40, 71, 73, 70, 72]
  const bw = 18
  const step = (W - 20) / bars.length
  return (
    <svg className="chart w-full" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs><Hatch id={id} /></defs>
      <line x1="0" y1={H - 14} x2={W} y2={H - 14} stroke="white" strokeOpacity="0.5" />
      {bars.map((h, i) => (
        <rect key={i} className="bar" style={{ '--i': i }} x={10 + i * step} y={H - 14 - h} width={bw} height={h} fill={`url(#${id})`} stroke="white" strokeOpacity={i === 3 || i === 4 ? 0.4 : 0.8} />
      ))}
      <g className="trace">
        <line x1="0" y1="22" x2={W} y2="22" {...dotted} />
      </g>
      <g className="pop" style={{ '--i': 4 }}>
        <ellipse cx={10 + 3.5 * step + bw / 2} cy={H - 34} rx="26" ry="14" fill={`url(#${id})`} stroke="#FF3FA4" />
        <text x={10 + 3.5 * step + bw / 2} y={H - 1} textAnchor="middle" fill="#FF3FA4" fontSize="8" letterSpacing="1.2">FAILOVER 4.2S</text>
      </g>
      <text x={W} y="14" textAnchor="end" fill="#FFF200" fontSize="8" letterSpacing="1.5">UPTIME 99.999%</text>
    </svg>
  )
}
