import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, DESKTOP_QUERY, REDUCED_QUERY } from '../lib/gsap'
import { useMediaQuery } from '../lib/useMediaQuery'
import LazyVideo from './LazyVideo'
import Grid from './Grid'
import Display from './Display'

// x/y = position in the section (%), m = mobile position, size in vw (clamped), speed = parallax travel in px
const BUBBLES = [
  { label: 'Scaling', x: 10, y: 50, m: [4, 54], size: 17, speed: 140, dur: 7, dx: 12, dy: 18 },
  { label: 'Routing', x: 66, y: 34, m: [58, 46], size: 12, speed: 300, dur: 6, dx: -10, dy: 14 },
  { label: 'Recovery', x: 70, y: 58, m: [46, 70], size: 19, speed: 90, dur: 8.5, dx: 8, dy: 20 },
  { label: 'Monitor', x: 34, y: 74, m: [12, 80], size: 10.5, speed: 380, dur: 5.5, dx: -14, dy: 10 },
]

export default function KeepMoving() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const reduced = useMediaQuery(REDUCED_QUERY)
  const root = useRef(null)
  const bubbles = useRef([])
  const headline = useRef(null)

  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      bubbles.current.forEach((el, i) => {
        const s = BUBBLES[i].speed * (isDesktop ? 1 : 0.5)
        gsap.fromTo(
          el,
          { y: s },
          {
            y: -s,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
      gsap.from(headline.current.children, {
        yPercent: 60,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 65%' },
      })
    }, root)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [isDesktop, reduced])

  return (
    <section id="solutions" ref={root} className="relative isolate h-[115svh] min-h-[640px] overflow-hidden">
      <LazyVideo
        src={isDesktop ? '/duck-float.mp4' : '/duck-float-mobile.mp4'}
        poster="/duck-float-poster.jpg"
        mode={reduced ? 'static' : 'autoplay'}
        playbackRate={0.75}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-pond-deep/70 via-pond-deep/10 to-pond-deep/80" />
      <Grid cols={['0%', '33.333%', '66.666%', '100%']} rows={['0px']} />

      <div className="relative pt-24 lg:pt-28" style={{ paddingInline: 'var(--gutter)' }}>
        <h2 ref={headline} className="text-[clamp(3rem,10vw,9rem)] lg:pl-6" aria-label="We keep all moving">
          <Display className="block">We k_e_ep</Display>
          <Display className="block pl-[0.6em]">all m_o_ving</Display>
        </h2>
        <p className="mt-6 max-w-sm text-base leading-relaxed text-white/85 lg:ml-6">
          Four systems paddle 24/7 so your dashboard stays a flat, boring line. Hover a bubble — they don't mind.
        </p>
      </div>

      {BUBBLES.map((b, i) => (
        <div
          key={b.label}
          ref={(el) => (bubbles.current[i] = el)}
          className="absolute will-change-transform"
          style={{
            left: `${isDesktop ? b.x : b.m[0]}%`,
            top: `${isDesktop ? b.y : b.m[1]}%`,
            width: `clamp(96px, ${b.size * (isDesktop ? 1 : 1.9)}vw, 300px)`,
            aspectRatio: '1',
          }}
        >
          <div className="bubble-drift h-full w-full" style={{ '--dur': `${b.dur}s`, '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, '--delay': `${-i * 1.3}s` }}>
            <button type="button" className="bubble-wrap block h-full w-full rounded-full focus:outline-none" aria-label={b.label}>
              <span className="bubble">
                <span className="relative z-[1] text-[10px] font-bold uppercase tracking-[0.28em] drop-shadow-[0_1px_6px_rgba(22,60,71,0.6)] lg:text-xs">
                  {b.label}
                </span>
              </span>
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}
