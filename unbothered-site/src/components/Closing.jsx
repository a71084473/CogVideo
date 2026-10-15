import Grid from './Grid'
import Display from './Display'
import { DemoButton } from './Buttons'
import { DuckFeet } from './Icons'

export default function Closing() {
  return (
    <>
      <section id="cta" className="relative isolate overflow-hidden py-28 lg:py-40" style={{ paddingInline: 'var(--gutter)' }}>
        <Grid cols={['0%', '50%', '100%']} rows={['0px', 'calc(100% - 1px)']} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,63,164,0.35),transparent)] blur-3xl" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-volt">Plans from $0 · Scale without a pricing call</p>
          <h2 className="mt-6 text-[clamp(3rem,11vw,10rem)]">
            <Display className="block">St_a_y</Display>
            <Display className="block">unbot_h_ered</Display>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-white/80">
            Fifteen minutes, one engineer, zero slides. We'll show you what's happening beneath the water.
          </p>
          <div className="mt-10 flex justify-center">
            <DemoButton />
          </div>
        </div>
      </section>

      <footer id="footer" className="relative border-t border-white/20 py-10 text-sm text-white/70" style={{ paddingInline: 'var(--gutter)' }}>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <a href="#top" className="flex items-end gap-1.5 text-white">
            <span className="display text-xl">UNB<em>O</em>THERED</span>
            <DuckFeet className="mb-1 h-3 w-4" />
          </a>
          <ul className="flex flex-wrap gap-6">
            {['Docs', 'Status', 'Changelog', 'Security', 'Careers'].map((l) => (
              <li key={l}><a href="#footer" className="hover:text-white">{l}</a></li>
            ))}
          </ul>
          <p>© {new Date().getFullYear()} Unbothered Cloud, Inc.</p>
        </div>
      </footer>
    </>
  )
}
