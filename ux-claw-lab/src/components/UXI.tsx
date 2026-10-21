import { motion } from 'framer-motion';

export type UXIFace = 'meh' | 'happy' | 'wow' | 'sad' | 'sleepy' | 'love';

/**
 * UXI｜小優西 — a round, slightly-jaded little monster who is secretly very
 * into UX. Default face is "meh" (厭世, deadpan potato-ball style), and it lights up when you learn.
 */
export function UXI({ size = 96, face = 'meh', outfit = 'none', bob = true, className = '' }: { size?: number; face?: UXIFace; outfit?: string; bob?: boolean; className?: string }) {
  const ink = '#3E2A1F';
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
      <ellipse cx="60" cy="113" rx="36" ry="5" fill="rgba(62,42,31,0.2)" />
      {/* stubby feet */}
      <ellipse cx="44" cy="108" rx="9" ry="6" fill="#E8A93A" stroke={ink} strokeWidth="3.5" />
      <ellipse cx="76" cy="108" rx="9" ry="6" fill="#E8A93A" stroke={ink} strokeWidth="3.5" />
      {/* sprout */}
      <path d="M60 24 C 59 16, 62 11, 65 8" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M64 9 C 70 0, 82 4, 80 10 C 76 15, 68 13, 64 9 Z" fill="#9DBF6A" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      {/* round potato-ball body: flat fill + shade crescent */}
      <defs>
        <clipPath id="uxiClip">
          <path d="M14 70 C 14 38, 34 22, 60 22 C 86 22, 106 38, 106 70 C 106 96, 88 108, 60 108 C 32 108, 14 96, 14 70 Z" />
        </clipPath>
      </defs>
      <path d="M14 70 C 14 38, 34 22, 60 22 C 86 22, 106 38, 106 70 C 106 96, 88 108, 60 108 C 32 108, 14 96, 14 70 Z" fill="#FFC94A" />
      <g clipPath="url(#uxiClip)">
        <path d="M120 40 C 110 95, 70 112, 20 104 L 20 130 L 130 130 Z" fill="rgba(62,42,31,0.13)" />
        <ellipse cx="36" cy="40" rx="8" ry="4.5" fill="rgba(255,255,255,0.6)" transform="rotate(-35 36 40)" />
      </g>
      <path d="M14 70 C 14 38, 34 22, 60 22 C 86 22, 106 38, 106 70 C 106 96, 88 108, 60 108 C 32 108, 14 96, 14 70 Z" fill="none" stroke={ink} strokeWidth="4" />
      {/* the UX snack bag it hugs */}
      <g transform="rotate(8 82 84)">
        <path d="M70 70 L94 70 L96 100 L68 100 Z" fill="#FFFDF7" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        <path d="M70 70 l4 -3 l4 3 l4 -3 l4 3 l4 -3 l4 3" fill="none" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        <text x="82" y="91" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink} fontFamily="Baloo 2, sans-serif">
          UX
        </text>
        <ellipse cx="69" cy="86" rx="5" ry="4" fill="#FFC94A" stroke={ink} strokeWidth="2.5" />
      </g>
      <Face face={face} />
      {/* blush */}
      <ellipse cx="36" cy="66" rx="7" ry="3.5" fill="#D6605A" opacity="0.3" />
      <ellipse cx="84" cy="66" rx="7" ry="3.5" fill="#D6605A" opacity="0.3" />
      <Outfit id={outfit} />
    </motion.svg>
  );
}

function Face({ face }: { face: UXIFace }) {
  const ink = '#2A1A12';
  const xs = [48, 72];
  const eyes = {
    meh: (
      <g>
        {xs.map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="56" rx="3.6" ry="4.4" fill={ink} />
            <path d={`M${x - 6} 47 h12`} stroke={ink} strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </g>
    ),
    happy: (
      <g>
        {xs.map((x) => (
          <path key={x} d={`M${x - 5} 57 q 5 -7 10 0`} stroke={ink} strokeWidth="3.4" fill="none" strokeLinecap="round" />
        ))}
      </g>
    ),
    wow: (
      <g>
        {xs.map((x) => (
          <g key={x}>
            <circle cx={x} cy="55" r="5.5" fill={ink} />
            <circle cx={x - 1.8} cy="53" r="1.8" fill="#fff" />
          </g>
        ))}
      </g>
    ),
    sad: (
      <g>
        {xs.map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy="57" rx="3.4" ry="4.2" fill={ink} />
            <path d={i === 0 ? `M${x - 6} 46 L${x + 5} 49` : `M${x - 5} 49 L${x + 6} 46`} stroke={ink} strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </g>
    ),
    sleepy: (
      <g>
        {xs.map((x) => (
          <path key={x} d={`M${x - 5} 56 h10`} stroke={ink} strokeWidth="3.4" strokeLinecap="round" />
        ))}
        <text x="96" y="34" fontSize="13" fontWeight="800" fill={ink}>
          z
        </text>
      </g>
    ),
    love: (
      <g>
        {xs.map((x) => (
          <path key={x} d={`M${x} 61 l-6 -6 a3.5 3.5 0 0 1 6 -4.5 a3.5 3.5 0 0 1 6 4.5 z`} fill="#D6605A" stroke={ink} strokeWidth="2" />
        ))}
      </g>
    ),
  }[face];
  const mouth =
    face === 'wow' ? (
      <ellipse cx="60" cy="68" rx="3" ry="4" fill={ink} />
    ) : face === 'sad' || face === 'meh' ? (
      <path d="M56 67 h8" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    ) : (
      <path d="M55 66 q 2.5 4 5 0.5 q 2.5 3.5 5 -0.5" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
    );
  return (
    <g>
      {eyes}
      {mouth}
    </g>
  );
}

function Outfit({ id }: { id: string }) {
  const ink = '#3E2A1F';
  if (id === 'headphones')
    return (
      <g>
        <path d="M24 56 C 24 24, 96 24, 96 56" stroke={ink} strokeWidth="5" fill="none" />
        <rect x="14" y="50" width="14" height="22" rx="6" fill="#E9A29B" stroke={ink} strokeWidth="3" />
        <rect x="92" y="50" width="14" height="22" rx="6" fill="#E9A29B" stroke={ink} strokeWidth="3" />
      </g>
    );
  if (id === 'scarf')
    return (
      <g>
        <path d="M26 80 q 34 12 68 0 l 0 9 q -34 12 -68 0 z" fill="#BFDDA0" stroke={ink} strokeWidth="3" />
        <rect x="70" y="84" width="10" height="20" rx="4" fill="#BFDDA0" stroke={ink} strokeWidth="3" />
      </g>
    );
  if (id === 'cap')
    return (
      <g>
        <path d="M32 36 C 34 14, 86 14, 88 36 Z" fill="#F3D3A8" stroke={ink} strokeWidth="3" />
        <path d="M84 34 q 18 0 22 6 l -22 2 z" fill="#F3D3A8" stroke={ink} strokeWidth="3" />
        <circle cx="60" cy="18" r="3" fill="#FFCE55" stroke={ink} strokeWidth="2" />
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
