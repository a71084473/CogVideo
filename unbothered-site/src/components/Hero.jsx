import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { createScrubber } from '../lib/videoScrubber'
import { useMediaQuery } from '../lib/useMediaQuery'
import { DESKTOP_QUERY, REDUCED_QUERY } from '../lib/gsap'
import LazyVideo from './LazyVideo'
import Grid, { CornerMarks } from './Grid'
import Display from './Display'
import { Duck } from './Icons'
import { DemoButton, OutlineButton } from './Buttons'
import StatCard from './StatCard'

const RADIUS = 24
const VIDEO_AR = 720 / 1280 // fallback until metadata arrives

export default function Hero() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const reduced = useMediaQuery(REDUCED_QUERY)
  const scrub = isDesktop && !reduced

  const root = useRef(null)
  const slot = useRef(null)
  const layer = useRef(null)
  const video = useRef(null)
  const mover = useRef(null)
  const frame = useRef(null)
  const fadeEls = useRef([])
  const caption = useRef(null)
  const timecode = useRef(null)

  // Geometry of the framed box relative to the hero. The video is sized to its
  // natural aspect ("cover" for the whole hero) inside a mover that starts
  // scaled/translated so the footage fits the box, then relaxes to full-bleed.
  const measure = () => {
    const h = root.current.getBoundingClientRect()
    const b = slot.current.getBoundingClientRect()
    const v = video.current
    const ar = v.videoWidth ? v.videoWidth / v.videoHeight : VIDEO_AR
    const vw = Math.max(h.width, h.height * ar)
    const vh = vw / ar
    gsap.set(v, { width: vw, height: vh, left: (h.width - vw) / 2, top: (h.height - vh) / 2 })
    return {
      clip: `inset(${b.top - h.top}px ${h.right - b.right}px ${h.bottom - b.bottom}px ${b.left - h.left}px round ${RADIUS}px)`,
      x: b.left - h.left + b.width / 2 - h.width / 2,
      y: b.top - h.top + b.height / 2 - h.height / 2,
      scale: (Math.max(b.width, b.height * ar) / vw) * 1.04,
    }
  }

  useLayoutEffect(() => {
    if (!isDesktop) return

    // Desktop + reduced motion: keep the video sitting in its box, no pinning
    if (!scrub) {
      const place = () => {
        const m = measure()
        gsap.set(layer.current, { clipPath: m.clip })
        gsap.set(mover.current, { x: m.x, y: m.y, scale: m.scale })
      }
      place()
      window.addEventListener('resize', place)
      return () => window.removeEventListener('resize', place)
    }

    const scrubber = createScrubber(video.current)
    const onMeta = () => ScrollTrigger.refresh()
    video.current.addEventListener('loadedmetadata', onMeta)

    const ctx = gsap.context(() => {
      let m = measure()
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: () => (m = measure()),
          onUpdate: (self) => {
            scrubber.set(self.progress)
            if (timecode.current) {
              const d = video.current?.duration || 12
              timecode.current.textContent = `00:${String(Math.floor(self.progress * d)).padStart(2, '0')}`
            }
          },
        },
      })

      tl.fromTo(
        layer.current,
        { clipPath: () => m.clip },
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1, ease: 'power2.inOut' },
        0,
      )
        .fromTo(
          mover.current,
          { x: () => m.x, y: () => m.y, scale: () => m.scale },
          { x: 0, y: 0, scale: 1, duration: 1, ease: 'power2.inOut' },
          0,
        )
        .to(frame.current, { autoAlpha: 0, duration: 0.25 }, 0)
        .to(
          fadeEls.current,
          { autoAlpha: 0, y: -40, stagger: 0.04, duration: 0.35, ease: 'power1.in' },
          0.05,
        )
        .fromTo(caption.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.75)
        .to({}, { duration: 0.15 }) // short hold on the full-bleed shot
    }, root)

    // Fonts change headline metrics -> re-measure the box
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      video.current?.removeEventListener('loadedmetadata', onMeta)
      ctx.revert()
      scrubber.kill()
    }
  }, [isDesktop, scrub])

  const fade = (i) => (el) => (fadeEls.current[i] = el)

  return (
    <section id="top" ref={root} className="relative isolate overflow-hidden lg:h-[100svh] lg:min-h-[680px]">
      <Grid cols={['0%', '62%', '100%']} rows={['80px', 'calc(100% - 1px)']} className="hidden lg:block" />
      <Grid cols={['0%', '100%']} rows={['64px']} className="lg:hidden" />

      {/* Desktop: full-hero video layer clipped down to the box, opened up on scroll */}
      {isDesktop && (
        <div ref={layer} className="absolute inset-0 z-[1] overflow-hidden" style={{ clipPath: 'inset(50% 50% 50% 50%)' }}>
          <div ref={mover} className="absolute inset-0 will-change-transform">
            <LazyVideo
              ref={video}
              eager
              src="/duck-float.mp4"
              poster="/duck-float-poster.jpg"
              mode={scrub ? 'scrub' : 'static'}
              className="absolute max-w-none object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-pond-ink/80 via-pond-deep/10 to-pond-deep/30" />
          <div ref={caption} className="invisible absolute bottom-12 left-[var(--gutter)] max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-volt">Above the surface</p>
            <Display as="p" className="mt-3 text-5xl drop-shadow-[0_2px_20px_rgba(22,60,71,0.5)] xl:text-6xl">C_a_lm. Al_w_ays.</Display>
          </div>
        </div>
      )}

      <div
        className="relative flex flex-col pb-10 pt-24 lg:grid lg:h-full lg:grid-cols-[62%_38%] lg:grid-rows-[1fr_auto] lg:pb-10 lg:pt-28"
        style={{ paddingInline: 'var(--gutter)' }}
      >
        {/* Headline */}
        <h1
          ref={fade(0)}
          className="relative z-[2] self-center text-[clamp(3rem,13.5vw,6rem)] lg:pl-6 lg:text-[clamp(4rem,8.2vw,9.5rem)]"
          aria-label="Ship without the sh*t"
        >
          <Display className="block">S_h_ip</Display>
          <Display className="block pl-[0.9em]">Wi_t_hout</Display>
          <span className="display block whitespace-nowrap pl-[1.8em]">
            THE <em>S</em>H
            <Duck className="mx-[0.02em] inline-block h-[0.62em] w-[0.62em] -translate-y-[0.04em] align-baseline" title="i" />T
          </span>
        </h1>

        {/* Framed video box */}
        <div className="relative mt-12 flex items-center justify-center lg:row-span-1 lg:mt-0 lg:pl-10">
          <div ref={slot} className="relative aspect-[4/5] w-full max-w-[420px] lg:aspect-auto lg:h-[min(62vh,620px)] lg:max-w-none">
            {/* blurred yellow glow, sits under the video layer */}
            <div className="pointer-events-none absolute -inset-16 z-0 rounded-full bg-[radial-gradient(closest-side,rgba(255,242,0,0.8),rgba(255,242,0,0.25)_55%,transparent)] blur-2xl" />

            {!isDesktop && (
              <LazyVideo
                eager
                src="/duck-float-mobile.mp4"
                poster="/duck-float-poster.jpg"
                mode={reduced ? 'static' : 'autoplay'}
                className="relative z-[1] h-full w-full rounded-3xl object-cover"
              />
            )}

            <div ref={frame} className="absolute inset-0 z-[3]">
              <div className="absolute -inset-3 border border-white/30" style={{ borderRadius: RADIUS + 10 }} />
              <CornerMarks className="-inset-3" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-pond-ink/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-hot" />
                Surface cam
              </div>
              <div ref={timecode} className="absolute bottom-4 right-4 rounded-full bg-pond-ink/40 px-3 py-1 font-mono text-[10px] tracking-widest backdrop-blur-md">
                00:00
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-left: copy + CTAs */}
        <div ref={fade(1)} className="relative z-[2] mt-14 max-w-md lg:mt-0 lg:self-end lg:pl-6">
          <p className="text-base leading-relaxed text-white/85 lg:text-lg">
            Autoscaling, routing, recovery and monitoring — handled below the surface. You glide. We paddle like hell underneath.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <DemoButton />
            <OutlineButton href="#features">How it works</OutlineButton>
          </div>
        </div>

        {/* Bottom-right: stats */}
        <div ref={fade(2)} className="relative z-[2] mt-10 grid grid-cols-2 gap-3 lg:mt-0 lg:self-end lg:pl-10">
          <StatCard value="180+" label="Regions worldwide" />
          <StatCard value="2.4B+" label="Requests handled" />
        </div>
      </div>
    </section>
  )
}
