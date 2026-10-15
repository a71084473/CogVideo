export function Duck({ className = '', title }) {
  return (
    <svg className={className} viewBox="0 0 32 32" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path d="M3 17.5c2.5.8 4.2.4 6-.6 1.5 5.6 18 6.4 18-2.6 0-1.4-.6-2.4-1.6-2.8-1 3.2-5.3 4.4-9 3.6C11.6 14.2 6.5 13 3 17.5Z" fill="#FFF200" />
      <ellipse cx="15.5" cy="21" rx="11.5" ry="6.2" fill="#FFF200" />
      <circle cx="20.5" cy="10.5" r="5.6" fill="#FFF200" />
      <path d="M25.6 9.6 31 10.9l-5.3 2.2Z" fill="#FF3FA4" />
      <circle cx="21.9" cy="9.3" r="1.05" fill="#163C47" />
      <path d="M10.5 20.5c3 2.6 7.4 2.7 10.6.2" fill="none" stroke="#E2D500" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** A single webbed duck footprint, toes pointing up. */
export function Footprint({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 22c-.7-2.4-1-4.3-1-6.2L6.2 18.6c-.7.4-1.5-.2-1.3-1L7.6 4.5c.1-.6.9-.8 1.3-.3L11 7.6V2.8c0-.7.9-1 1.3-.4l.7 1 .7-1c.4-.6 1.3-.3 1.3.4v4.8l2.1-3.4c.4-.5 1.2-.3 1.3.3l2.7 13.1c.2.8-.6 1.4-1.3 1L15 15.8c0 1.9-.3 3.8-1 6.2-.3 1-1.7 1-2 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Pair of tiny duck feet used in the logo. */
export function DuckFeet({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 28 20" aria-hidden="true">
      <g fill="#FFF200">
        <path d="M7 19 6.3 13 2 15.4c-.6.3-1.2-.2-1-.8L3.5 3.4c.1-.5.8-.6 1.1-.2L6.5 6V1.4c0-.6.8-.8 1.1-.3L8.5 2.4l.9-1.3c.3-.5 1.1-.3 1.1.3V6l1.9-2.8c.3-.4 1-.3 1.1.2l2.5 11.2c.2.6-.4 1.1-1 .8L10.7 13 10 19c-.2.9-1.5 1.3-3 0Z" transform="rotate(-12 8 10)" />
        <path d="M18 19 17.3 13 13 15.4c-.6.3-1.2-.2-1-.8l2.5-11.2c.1-.5.8-.6 1.1-.2L17.5 6V1.4c0-.6.8-.8 1.1-.3l.9 1.3.9-1.3c.3-.5 1.1-.3 1.1.3V6l1.9-2.8c.3-.4 1-.3 1.1.2l2.5 11.2c.2.6-.4 1.1-1 .8L21.7 13 21 19c-.2.9-1.5 1.3-3 0Z" transform="rotate(10 19 10) translate(1 1)" />
      </g>
    </svg>
  )
}

export function Play({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 3.5v9l7.5-4.5Z" fill="currentColor" />
    </svg>
  )
}

export function Arrow({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
