const FOOT =
  'M12 21C8.5 18.5 4.6 13 3.3 7.6Q3 5.6 4.9 6.1Q8.5 8.2 10.8 3.3Q12 1 13.2 3.3Q15.5 8.2 19.1 6.1Q21 5.6 20.7 7.6C19.4 13 15.5 18.5 12 21ZM11.2 20h1.6v3a.8.8 0 0 1-1.6 0Z';

/** One webbed duck foot, toes up. */
export function Footprint(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d={FOOT} />
    </svg>
  );
}

/** Pair of tiny duck feet used next to the wordmark. */
export function DuckFeet(props) {
  return (
    <svg viewBox="0 0 44 26" fill="currentColor" aria-hidden="true" {...props}>
      <path d={FOOT} transform="translate(1 1) rotate(-14 12 12)" />
      <path d={FOOT} transform="translate(19 0) rotate(12 12 12)" />
    </svg>
  );
}

/** Tiny rubber duck that stands in for the censored "I". */
export function Duck(props) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <path d="M50 30c4-1 9-5 11-9 1 7-1 13-5 17Z" fill="#FFF200" />
      <ellipse cx="34" cy="43" rx="24" ry="14" fill="#FFF200" />
      <circle cx="22" cy="23" r="12.5" fill="#FFF200" />
      <path d="M31 41c6-6 15-6 20-1-6 6-14 7-20 1Z" fill="#E8D600" />
      <path d="M10.5 21.5 1 24.5l9.8 5.2c2.2-2.5 2-5.8-.3-8.2Z" fill="#FF3FA4" />
      <circle cx="19" cy="19.5" r="2.4" fill="#0D2B35" />
      <circle cx="19.8" cy="18.7" r=".7" fill="#fff" />
    </svg>
  );
}

export function Play(props) {
  return (
    <svg viewBox="0 0 24 24" data-icon="play" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 8.2v7.6l6-3.8Z" fill="currentColor" />
    </svg>
  );
}

export function Arrow(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
