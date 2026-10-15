import { Footprint, Play } from './Icons'

// Footprint positions around the pill: x/y in %, rotation, stagger delay
const PRINTS = [
  { x: -6, y: 20, r: -70, d: 0 },
  { x: 4, y: -38, r: -30, d: 40 },
  { x: 28, y: -55, r: 8, d: 80 },
  { x: 56, y: -42, r: 24, d: 120 },
  { x: 86, y: -50, r: 50, d: 160 },
  { x: 106, y: 12, r: 100, d: 200 },
  { x: 98, y: 140, r: 150, d: 240 },
  { x: 66, y: 158, r: 175, d: 280 },
  { x: 34, y: 150, r: -165, d: 320 },
  { x: 6, y: 135, r: -130, d: 360 },
]

export function DemoButton({ className = '', href = '#cta', children = 'Book a Demo' }) {
  return (
    <a
      href={href}
      className={`demo-btn group relative inline-flex items-center gap-2 rounded-full bg-volt px-7 py-4 text-sm font-semibold text-pond-ink transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-pond-deep ${className}`}
    >
      {PRINTS.map((p, i) => (
        <Footprint
          key={i}
          className="footprint"
          style={{ left: `${p.x}%`, top: `${p.y}%`, '--r': `${p.r}deg`, '--d': `${p.d}ms` }}
        />
      ))}
      <span className="relative">{children}</span>
      <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-hot" aria-hidden="true" />
    </a>
  )
}

export function OutlineButton({ className = '', children, icon = true, ...rest }) {
  return (
    <a
      className={`group inline-flex items-center gap-3 rounded-full border border-white/50 py-2 pl-2 pr-6 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${className}`}
      {...rest}
    >
      {icon && (
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-pond-deep transition-transform duration-300 group-hover:scale-110">
          <Play className="h-3.5 w-3.5 translate-x-px" />
        </span>
      )}
      {children}
    </a>
  )
}
