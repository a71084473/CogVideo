import { useEffect, useState } from 'react';
import { DisplayText } from './DisplayText.jsx';
import { DuckFeet } from './Icons.jsx';

const LINKS = [
  ['Solutions', '#moving'],
  ['Features', '#inner-workings'],
  ['Pricing', '#demo'],
  ['Resources', '#demo'],
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled ? 'border-white/15 bg-lagoon/55 backdrop-blur-lg' : 'border-transparent'
      }`}
    >
      <div className="flex h-20 items-center justify-between px-[4vw]">
        <a href="#top" className="group flex items-center gap-2 font-display text-[1.45rem] leading-none tracking-tight">
          <DisplayText text="UNBOTHERED" italic={[2, 7]} />
          <DuckFeet
            data-testid="duck-feet"
            className="h-[1.05rem] w-[1.8rem] -translate-y-1 text-volt transition-transform duration-300 group-hover:-rotate-12"
          />
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-10 text-[0.9rem] font-medium text-white/85">
            {LINKS.map(([label, href]) => (
              <li key={label}>
                <a href={href} className="relative transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-volt after:transition-all hover:after:w-full">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="#demo"
          className="rounded-full border border-white/70 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-volt hover:bg-volt hover:text-ink"
        >
          Book a Demo
        </a>
      </div>
    </header>
  );
}
