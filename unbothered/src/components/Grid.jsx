/**
 * Thin 1px white/20 guide lines with "+" crosshairs at every intersection.
 * `cols` / `rows` are CSS lengths, e.g. ['4vw', '50%', 'calc(100% - 4vw)'].
 */
export function Grid({ cols = [], rows = [], className = '' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {cols.map((x) => (
        <span key={`c${x}`} className="absolute inset-y-0 w-px bg-white/20" style={{ left: x }} />
      ))}
      {rows.map((y) => (
        <span key={`r${y}`} className="absolute inset-x-0 h-px bg-white/20" style={{ top: y }} />
      ))}
      {cols.flatMap((x) => rows.map((y) => <span key={`${x}|${y}`} className="crosshair" style={{ left: x, top: y }} />))}
    </div>
  );
}
