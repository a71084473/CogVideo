/** 1px white/20 grid lines with "+" crosshairs where they cross. */
export function Crosshair({ className = '', style }) {
  return (
    <svg
      className={`pointer-events-none absolute h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2 text-white/70 ${className}`}
      style={style}
      viewBox="0 0 13 13"
      aria-hidden="true"
    >
      <path d="M6.5 0v13M0 6.5h13" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export default function Grid({ cols = ['0%', '100%'], rows = [], className = '' }) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${className}`}
      style={{ left: 'var(--gutter)', right: 'var(--gutter)' }}
      aria-hidden="true"
    >
      {cols.map((x) => (
        <div key={`c${x}`} className="absolute inset-y-0 w-px bg-white/20" style={{ left: x }} />
      ))}
      {rows.map((y) => (
        <div
          key={`r${y}`}
          className="absolute h-px bg-white/20"
          style={{ top: y, left: 'calc(var(--gutter) * -1)', right: 'calc(var(--gutter) * -1)' }}
        />
      ))}
      {rows.flatMap((y) => cols.map((x) => <Crosshair key={`${x}-${y}`} style={{ left: x, top: y }} />))}
    </div>
  )
}

/** Crosshair "+" marks on the four corners of a framed box. */
export function CornerMarks({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <Crosshair className="left-0 top-0" />
      <Crosshair className="left-full top-0" />
      <Crosshair className="left-0 top-full" />
      <Crosshair className="left-full top-full" />
    </div>
  )
}
