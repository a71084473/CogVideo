const AXIS = 'rgba(255,255,255,0.45)';
const LINE = 'rgba(255,255,255,0.85)';
const VOLT = '#FFF200';

function Hatch({ id }) {
  return (
    <defs>
      <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="5" stroke={LINE} strokeWidth="1" />
      </pattern>
    </defs>
  );
}

const svgProps = {
  viewBox: '0 0 280 100',
  className: 'h-auto w-full max-w-[320px]',
  fill: 'none',
  'data-testid': 'mini-chart',
  role: 'img',
};

/** 001 — demand bars spike, the yellow dotted capacity line is always a step ahead. */
export function RushChart() {
  const bars = [18, 22, 20, 30, 52, 78, 64, 40];
  const cap = bars.map((h, i) => `${18 + i * 32 + 10},${92 - Math.min(86, h + 12)}`).join(' ');
  return (
    <svg {...svgProps} aria-label="Traffic bars spiking with capacity scaling ahead of demand">
      <Hatch id="hatch-rush" />
      <line x1="8" y1="92" x2="272" y2="92" stroke={AXIS} />
      {bars.map((h, i) => (
        <rect
          key={i}
          className="chart-draw"
          style={{ '--d': `${i * 50}ms` }}
          x={18 + i * 32}
          y={92 - h}
          width="20"
          height={h}
          fill="url(#hatch-rush)"
          stroke={LINE}
        />
      ))}
      <polyline className="chart-trace" points={cap} stroke={VOLT} strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" />
      <text x="8" y="10" fill={AXIS} fontSize="8" letterSpacing="1.5">REQ/S · CAPACITY</text>
    </svg>
  );
}

/** 002 — hatched region nodes, the request takes the yellow dotted fast path. */
export function RouteChart() {
  const nodes = [
    { x: 30, y: 50, rx: 18, ry: 12, t: 'IN' },
    { x: 110, y: 26, rx: 20, ry: 13, t: 'EU' },
    { x: 110, y: 76, rx: 20, ry: 13, t: 'US' },
    { x: 190, y: 50, rx: 20, ry: 13, t: 'AP' },
    { x: 252, y: 50, rx: 18, ry: 12, t: 'OK' },
  ];
  return (
    <svg {...svgProps} aria-label="Requests routed through the fastest healthy region">
      <Hatch id="hatch-route" />
      <path d="M48 50 L90 76 M130 76 L170 50 M48 50 L90 26" stroke={AXIS} strokeDasharray="3 3" />
      <path className="chart-trace" d="M48 50 Q70 30 90 26 M130 26 Q150 30 170 50 M210 50 L234 50" stroke={VOLT} strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" />
      {nodes.map((n, i) => (
        <g key={n.t} className="chart-draw" style={{ '--d': `${i * 70}ms` }}>
          <ellipse cx={n.x} cy={n.y} rx={n.rx} ry={n.ry} fill="url(#hatch-route)" stroke={LINE} />
          <text x={n.x} y={n.y + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="700" letterSpacing="1">
            {n.t}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** 003 — a timeline of incidents shrinking to nothing before the "you notice" line. */
export function RecoveryChart() {
  const blips = [
    { x: 40, r: 22 },
    { x: 92, r: 15 },
    { x: 136, r: 9 },
    { x: 172, r: 5 },
  ];
  return (
    <svg {...svgProps} aria-label="Incidents shrinking along a timeline before anyone notices">
      <Hatch id="hatch-recover" />
      <line x1="8" y1="70" x2="272" y2="70" stroke={AXIS} />
      {[40, 92, 136, 172, 214, 252].map((x) => (
        <line key={x} x1={x} y1="66" x2={x} y2="74" stroke={AXIS} />
      ))}
      {blips.map((b, i) => (
        <ellipse
          key={b.x}
          className="chart-draw"
          style={{ '--d': `${i * 80}ms` }}
          cx={b.x}
          cy={70 - b.r * 0.55}
          rx={b.r}
          ry={b.r * 0.55}
          fill="url(#hatch-recover)"
          stroke={LINE}
        />
      ))}
      <line className="chart-trace" x1="214" y1="12" x2="214" y2="88" stroke={VOLT} strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" />
      <text x="220" y="20" fill={VOLT} fontSize="8" letterSpacing="1">YOU NOTICE</text>
      <text x="8" y="92" fill={AXIS} fontSize="8" letterSpacing="1.5">T+0</text>
      <text x="160" y="92" fill={AXIS} fontSize="8" letterSpacing="1.5">T+38s</text>
    </svg>
  );
}
