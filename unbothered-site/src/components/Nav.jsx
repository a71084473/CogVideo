import { useEffect, useState } from 'react'
import { DuckFeet } from './Icons'

const LINKS = [
  { label: 'Solutions', href: '#solutions' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#cta' },
  { label: 'Resources', href: '#footer' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled ? 'border-b border-white/15 bg-pond-deep/40 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav className="flex h-16 items-center justify-between lg:h-20" style={{ paddingInline: 'var(--gutter)' }}>
        <a href="#top" className="group flex items-end gap-1.5" aria-label="UNBOTHERED home">
          <span className="display text-2xl tracking-tight lg:text-[1.7rem]">
            UNB<em>O</em>THERED
          </span>
          <DuckFeet className="mb-1 h-3 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125" />
        </a>

        <ul className="hidden items-center gap-9 text-sm font-medium text-white/85 md:flex">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="relative transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-volt after:transition-transform hover:after:scale-x-100">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#cta"
          className="rounded-full border border-white/70 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white hover:text-pond-deep lg:px-5"
        >
          Book a Demo
        </a>
      </nav>
    </header>
  )
}
