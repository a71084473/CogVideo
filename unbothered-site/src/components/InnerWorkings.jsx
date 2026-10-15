import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, DESKTOP_QUERY, REDUCED_QUERY } from '../lib/gsap'
import { useMediaQuery } from '../lib/useMediaQuery'
import { createScrubber } from '../lib/videoScrubber'
import { scrollToTarget } from '../lib/smoothScroll'
import LazyVideo from './LazyVideo'
import Display from './Display'
import { CornerMarks, Crosshair } from './Grid'
import { RushChart, RouteChart, RecoveryChart } from './Charts'

const ITEMS = [
  {
    n: '001',
    title: 'Ready for the rush',
    body: 'Launch day, 40× traffic? Predictive autoscaling warms capacity across 180+ regions before the first request lands. You see a flat line. We see the paddling.',
    Chart: RushChart,
  },
  {
    n: '002',
    title: 'Every request, on track',
    body: 'Anycast routing steers each request to the healthiest edge, re-pathing around congestion and dead nodes mid-flight. P99 stays boring.',
    Chart: RouteChart,
  },
  {
    n: '003',
    title: 'Back up before you notice',
    body: 'Continuous snapshots and automated failover restore service in seconds — usually before your pager even thinks about buzzing.',
    Chart: RecoveryChart,
  },
]

export default function InnerWorkings() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const reduced = useMediaQuery(REDUCED_QUERY)
  const scrub = isDesktop && !reduced

  const [active, setActive] = useState(0)
  const root = useRef(null)
  const panel = useRef(null)
  const video = useRef(null)
  const items = useRef([])
  const pinST = useRef(null)

  useLayoutEffect(() => {
    if (!scrub) return
    const scrubber = createScrubber(video.current)

    const ctx = gsap.context(() => {
      pinST.current = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          scrubber.set(p)
          const idx = Math.min(ITEMS.length - 1, Math.floor(p * ITEMS.length))
          setActive(idx)
          items.current.forEach((el, i) => {
            const local = Math.min(1, Math.max(0, p * ITEMS.length - i))
            el?.style.setProperty('--p', local)
          })
        },
      })

      // Left panel slides in from the left as the section arrives
      gsap.fromTo(
        panel.current,
        { xPercent: -100 },
        {
          xPercent: 0,
          ease: 'power2.out',
          scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top top', scrub: true },
        },
      )
    }, root)

    ScrollTrigger.refresh()
    return () => {
      ctx.revert()
      scrubber.kill()
      pinST.current = null
    }
  }, [scrub])

  const select = (i) => {
    const st = pinST.current
    if (st) scrollToTarget(st.start + ((i + 0.5) / ITEMS.length) * (st.end - st.start))
    else setActive(i)
  }

  return (
    <section id="features" ref={root} className="relative isolate overflow-hidden lg:h-[100svh]">
      <div className="flex flex-col lg:grid lg:h-full lg:grid-cols-[35%_65%]">
        {/* Left panel */}
        <div
          ref={panel}
          className="relative z-[2] flex flex-col border-white/20 bg-pond-deep/85 px-[var(--gutter)] pb-12 pt-20 backdrop-blur-xl lg:h-full lg:overflow-y-auto lg:border-r lg:pb-8 lg:pt-24 xl:px-12"
        >
          <Crosshair className="right-0 top-0 hidden translate-x-1/2 lg:block" />
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
            <span className="h-1.5 w-1.5 rounded-full bg-volt" />
            The inner workings (3)
          </span>
          <h2 className="mt-5 text-[clamp(2.4rem,9vw,3rem)] lg:text-[clamp(2rem,3.1vw,3.4rem)]">
            <Display>What's g_o_ing on ben_e_ath water?</Display>
          </h2>

          <ol className="mt-8 border-b border-white/25 lg:mt-auto">
            {ITEMS.map(({ n, title, body, Chart }, i) => (
              <li
                key={n}
                ref={(el) => (items.current[i] = el)}
                className={`acc-item relative border-t border-white/25 ${active === i ? 'is-active' : ''}`}
                style={scrub ? undefined : { '--p': active === i ? 1 : 0 }}
              >
                <div
                  className="absolute left-0 top-[-1px] h-px w-full origin-left bg-volt"
                  style={{ transform: 'scaleX(var(--p, 0))' }}
                  aria-hidden="true"
                />
                <h3>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-expanded={active === i}
                    aria-controls={`acc-${n}`}
                    className="flex w-full items-center gap-4 py-4 text-left lg:py-[min(2.2vh,1.1rem)]"
                  >
                    <span className={`font-mono text-xs transition-colors ${active === i ? 'text-volt' : 'text-white/60'}`}>{n}</span>
                    <span className={`display text-xl transition-opacity xl:text-2xl ${active === i ? 'opacity-100' : 'opacity-70'}`}>{title}</span>
                    <span className="relative ml-auto h-3 w-3 shrink-0" aria-hidden="true">
                      <span className="absolute left-0 top-1/2 h-px w-3 bg-white" />
                      <span className={`absolute left-1/2 top-0 h-3 w-px bg-white transition-transform duration-500 ${active === i ? 'scale-y-0' : ''}`} />
                    </span>
                  </button>
                </h3>
                <div id={`acc-${n}`} className="acc-body" role="region">
                  <div>
                    <p className="max-w-sm pb-4 text-sm leading-relaxed text-white/80">{body}</p>
                    <div className="max-w-[300px] pb-5">
                      <Chart />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Right panel: dive video */}
        <div className="relative px-[var(--gutter)] pb-16 lg:h-full lg:p-0">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl lg:aspect-auto lg:h-full lg:rounded-none">
            <LazyVideo
              ref={video}
              src={isDesktop ? '/duck-dive.mp4' : '/duck-dive-mobile.mp4'}
              poster="/duck-dive-poster.jpg"
              mode={reduced ? 'static' : scrub ? 'scrub' : 'autoplay'}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pond-deep/50 via-transparent to-transparent" />
            <div className="absolute inset-6 hidden lg:block">
              <CornerMarks />
              <span className="absolute left-4 top-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80">Below the surface</span>
              <span className="display absolute bottom-0 right-4 text-[clamp(5rem,12vw,12rem)] leading-none text-white/90">
                {ITEMS[active].n.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
