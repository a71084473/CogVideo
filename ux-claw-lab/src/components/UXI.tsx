import { motion } from 'framer-motion';

export type UXIFace = 'meh' | 'happy' | 'wow' | 'sad' | 'sleepy' | 'love';

/**
 * UXI｜小優西 — a round, slightly-jaded little monster who is secretly very
 * into UX. Default face is "meh" (厭世), and it lights up when you learn.
 */
export function UXI({ size = 96, face = 'meh', outfit = 'none', bob = true, className = '' }: { size?: number; face?: UXIFace; outfit?: string; bob?: boolean; className?: string }) {
  const ink = '#35465C';
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={`UXI 小優西（${face}）`}
      animate={bob ? { y: [0, -4, 0], scaleY: [1, 1.03, 1] } : undefined}
      transition={bob ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <ellipse cx="60" cy="112" rx="34" ry="6" fill="rgba(53,70,92,0.18)" />
      {/* antenna sprout */}
      <path d="M60 22 C 58 12, 64 8, 66 6" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="70" cy="8" rx="7" ry="4.5" fill="#B7E8D0" stroke={ink} strokeWidth="2.5" transform="rotate(-20 70 8)" />
      {/* body */}
      <defs>
        <linearGradient id="uxiBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9DDFF" />
          <stop offset="0.55" stopColor="#C7B3F2" />
          <stop offset="1" stopColor="#A893E0" />
        </linearGradient>
      </defs>
      <path d="M18 78 C 14 36, 36 20, 60 20 C 84 20, 106 36, 102 78 C 100 100, 84 110, 60 110 C 36 110, 20 100, 18 78 Z" fill="url(#uxiBody)" stroke={ink} strokeWidth="3.5" />
      {/* little arms */}
      <path d="M20 76 q -9 4 -6 13" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M100 76 q 9 4 6 13" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* gloss */}
      <ellipse cx="38" cy="40" rx="9" ry="5" fill="rgba(255,255,255,0.6)" transform="rotate(-30 38 40)" />
      {/* belly */}
      <ellipse cx="60" cy="88" rx="20" ry="14" fill="#FFF9F0" opacity="0.9" />
      <text x="60" y="93" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink} fontFamily="Baloo 2, sans-serif">
        UX
      </text>
      <Face face={face} />
      {/* blush */}
      <ellipse cx="33" cy="68" rx="7" ry="4" fill="#FFA9C5" opacity="0.75" />
      <ellipse cx="87" cy="68" rx="7" ry="4" fill="#FFA9C5" opacity="0.75" />
      <Outfit id={outfit} />
    </motion.svg>
  );
}

function Face({ face }: { face: UXIFace }) {
  const ink = '#35465C';
  const eyes = {
    meh: (
      <g>
        {[42, 78].map((x) => (
          <g key={x}>
            <circle cx={x} cy="56" r="8" fill="#fff" stroke={ink} strokeWidth="2.5" />
            <circle cx={x} cy="58" r="4" fill={ink} />
            <path d={`M${x - 9} 53 h18`} stroke={ink} strokeWidth="3" strokeLinecap="round" />
            <rect x={x - 9} y="46" width="18" height="7" fill="#C7B3F2" />
          </g>
        ))}
      </g>
    ),
    happy: (
      <g>
        {[42, 78].map((x) => (
          <path key={x} d={`M${x - 7} 58 q 7 -9 14 0`} stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ))}
      </g>
    ),
    wow: (
      <g>
        {[42, 78].map((x) => (
          <g key={x}>
            <circle cx={x} cy="55" r="9" fill="#fff" stroke={ink} strokeWidth="2.5" />
            <circle cx={x} cy="55" r="5" fill={ink} />
            <circle cx={x - 2} cy="52.5" r="1.8" fill="#fff" />
          </g>
        ))}
      </g>
    ),
    sad: (
      <g>
        {[42, 78].map((x) => (
          <g key={x}>
            <circle cx={x} cy="57" r="4.5" fill={ink} />
            <path d={`M${x - 7} ${x < 60 ? 47 : 50} L${x + 7} ${x < 60 ? 50 : 47}`} stroke={ink} strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </g>
    ),
    sleepy: (
      <g>
        {[42, 78].map((x) => (
          <path key={x} d={`M${x - 7} 56 q 7 6 14 0`} stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ))}
        <text x="96" y="36" fontSize="12" fontWeight="800" fill={ink}>
          z
        </text>
      </g>
    ),
    love: (
      <g>
        {[42, 78].map((x) => (
          <path key={x} d={`M${x} 62 l-7 -7 a4 4 0 0 1 7 -5 a4 4 0 0 1 7 5 z`} fill="#FF6F9C" stroke={ink} strokeWidth="2" />
        ))}
      </g>
    ),
  }[face];
  const mouth =
    face === 'wow' ? (
      <ellipse cx="60" cy="72" rx="4" ry="5" fill={ink} />
    ) : face === 'sad' ? (
      <path d="M54 75 q 6 -6 12 0" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
    ) : face === 'meh' ? (
      <path d="M55 72 h10" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    ) : (
      <path d="M54 70 q 3 5 6 1 q 3 4 6 -1" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
    );
  return (
    <g>
      {eyes}
      {mouth}
    </g>
  );
}

function Outfit({ id }: { id: string }) {
  const ink = '#35465C';
  if (id === 'headphones')
    return (
      <g>
        <path d="M24 56 C 24 24, 96 24, 96 56" stroke={ink} strokeWidth="5" fill="none" />
        <rect x="14" y="50" width="14" height="22" rx="6" fill="#FFA9C5" stroke={ink} strokeWidth="3" />
        <rect x="92" y="50" width="14" height="22" rx="6" fill="#FFA9C5" stroke={ink} strokeWidth="3" />
      </g>
    );
  if (id === 'scarf')
    return (
      <g>
        <path d="M26 80 q 34 12 68 0 l 0 9 q -34 12 -68 0 z" fill="#B7E8D0" stroke={ink} strokeWidth="3" />
        <rect x="70" y="84" width="10" height="20" rx="4" fill="#B7E8D0" stroke={ink} strokeWidth="3" />
      </g>
    );
  if (id === 'cap')
    return (
      <g>
        <path d="M32 36 C 34 14, 86 14, 88 36 Z" fill="#A9D9F8" stroke={ink} strokeWidth="3" />
        <path d="M84 34 q 18 0 22 6 l -22 2 z" fill="#A9D9F8" stroke={ink} strokeWidth="3" />
        <circle cx="60" cy="18" r="3" fill="#FFE49A" stroke={ink} strokeWidth="2" />
        <text x="60" y="33" textAnchor="middle" fontSize="9" fontWeight="900" fill={ink}>
          UX
        </text>
      </g>
    );
  if (id === 'crown')
    return (
      <path d="M40 26 L40 8 L50 18 L60 4 L70 18 L80 8 L80 26 Z" fill="#FFD45E" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
    );
  return null;
}
