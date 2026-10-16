import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useMotionMode, scrollToY } from '../motion/MotionProvider.jsx';
import { createScrubber } from '../lib/scrubber.js';
import { DisplayText } from './DisplayText.jsx';
import { Grid } from './Grid.jsx';
import { LazyVideo } from './LazyVideo.jsx';
import { Footprint, Play } from './Icons.jsx';

const LINES = [
  { text: 'SHIP', italic: [2], indent: '0em' },
  { text: 'WITHOUT', italic: [3], indent: '1em' },
  { text: 'THE SH*T', italic: [1], indent: '2em' },
];

const PRINTS = [
  { x: '-12%', y: '-30%', r: '-35deg' },
  { x: '18%', y: '-62%', r: '-10deg' },
  { x: '52%', y: '-58%', r: '8deg' },
  { x: '86%', y: '-60%', r: '24deg' },
  { x: '112%', y: '-20%', r: '60deg' },
  { x: '108%', y: '128%', r: '140deg' },
  { x: '62%', y: '160%', r: '170deg' },
  { x: '-8%', y: '125%', r: '-140deg' },
];

const STATS = [
  ['180+', 'Regions worldwide'],
  ['2.4B+', 'Requests handled'],
];

export const heroState = { inset: [0, 0, 0, 0] };
const insetCss = ([t, r, b, l], round) => `inset(${t}px ${r}px ${b}px ${l}px round ${round}px)`;

export function Hero() {
  const mode = useMotionMode();
  const root = useRef(null);
  const media = useRef(null);
  const frame = useRef(null);
  const video = useRef(null);
  const fade = useRef(null);
  const glow = useRef(null);
  const outro = useRef(null);

  // Where the framed box sits, expressed as an inset of the full-bleed media layer.
  const measure = () => {
    const h = root.current.getBoundingClientRect();
    const f = frame.current.getBoundingClientRect();
    heroState.inset = [f.top - h.top, h.right - f.right, h.bottom - f.bottom, f.left - h.left].map((n) =>
      Math.max(0, Math.round(n)),
    );
    return heroState.inset;
  };

  useLayoutEffect(() => {
    if (mode !== 'scrub') {
      const apply = () => {
        media.current.style.clipPath = insetCss(measure(), 22);
      };
      apply();
      const ro = new ResizeObserver(apply);
      ro.observe(root.current);
      return () => ro.disconnect();
    }

    const ctx = gsap.context(() => {
      const scrubber = createScrubber(video.current);
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'hero',
          trigger: root.current,
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => scrubber.setProgress(self.progress),
        },
      });
      tl.fromTo(
        media.current,
        { clipPath: () => insetCss(measure(), 22) },
        { clipPath: insetCss([0, 0, 0, 0], 0), ease: 'power2.inOut', duration: 0.8 },
        0,
      )
        .to(fade.current.querySelectorAll(':scope > [data-fade]'), { autoAlpha: 0, y: -50, stagger: 0.03, duration: 0.3, ease: 'power1.in' }, 0)
        .to(frame.current, { autoAlpha: 0, duration: 0.2 }, 0.05)
        .to(glow.current, { autoAlpha: 0, scale: 1.5, duration: 0.5 }, 0)
        .fromTo(outro.current, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' }, 0.75)
        .to({}, { duration: 0.05 });
      return () => scrubber.kill();
    }, root);
    return () => ctx.revert();
  }, [mode]);

  const goToInner = () => {
    const el = document.getElementById('inner-workings');
    scrollToY(el.getBoundingClientRect().top + window.scrollY);
  };

  return (
    <section
      id="hero"
      ref={root}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden px-[4vw] pb-8 pt-28 md:h-screen md:pb-[5vh] md:pt-[14vh]"
    >
      <Grid cols={['4vw', '50%', 'calc(100% - 4vw)']} rows={['80px', 'calc(100% - 1px)']} />

      {/* Yellow glow behind the framed video */}
      <div
        ref={glow}
        data-testid="hero-glow"
        aria-hidden="true"
        className="pointer-events-none absolute -z-0 h-[70vw] w-[70vw] max-h-[720px] max-w-[720px] rounded-full opacity-70 blur-[70px] left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 md:left-auto md:right-[-6vw] md:top-[44%] md:translate-x-0 md:h-[48vw] md:w-[48vw]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255, 242, 0, 0.85) 0%, rgba(255, 242, 0, 0.25) 45%, rgba(255, 242, 0, 0) 70%)' }}
      />

      {/* Full-bleed media layer, clipped down to the frame until the scroll opens it up */}
      <div ref={media} data-testid="hero-media" className="absolute inset-0 z-10 will-change-[clip-path]">
        <LazyVideo
          ref={video}
          name="duck-float"
          mode={mode}
          eager
          data-testid="hero-video"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-ink/10" />
      </div>

      <div ref={outro} className="invisible pointer-events-none absolute inset-x-[4vw] bottom-[8vh] z-20 opacity-0">
        <p className="font-display text-[clamp(2.4rem,6vw,6rem)] leading-[0.9]">
          <DisplayText text="CALM ON TOP." italic={[1, 9]} />
          <br />
          <DisplayText text="CHAOS HANDLED BELOW." italic={[6, 12]} className="text-volt" />
        </p>
      </div>

      <div ref={fade} className="relative z-20 flex flex-1 flex-col">
        <h1
          data-fade
          aria-label="SHIP WITHOUT THE SH*T"
          className="font-display text-[clamp(3.6rem,15vw,7rem)] leading-[0.88] md:text-[min(7.2vw,12.5vh)]"
        >
          {LINES.map((line) => (
            <span key={line.text} data-testid="headline-line" className="block" aria-hidden="true">
              <span className="inline-block whitespace-nowrap" style={{ marginLeft: line.indent }}>
                <DisplayText text={line.text} italic={line.italic} srText={null} />
              </span>
            </span>
          ))}
        </h1>

        {/* The framed box: crosshair corners + hairline border. In flow on mobile, right column on desktop. */}
        <div
          ref={frame}
          data-testid="hero-frame"
          className="pointer-events-none relative my-10 h-[62svh] rounded-[22px] border border-white/35 md:absolute md:right-[3vw] md:top-[1vh] md:my-0 md:h-[54vh] md:w-[27vw]"
        >
          {[
            ['0%', '0%'],
            ['100%', '0%'],
            ['0%', '100%'],
            ['100%', '100%'],
          ].map(([x, y]) => (
            <span key={x + y} data-testid="crosshair-corner" className="crosshair" style={{ left: x, top: y, margin: `${y === '0%' ? -10 : 10}px ${x === '0%' ? -10 : 10}px` }} />
          ))}
          <span className="absolute -top-7 left-0 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/70">
            Live · eu-west-3
          </span>
          <span className="absolute -bottom-7 right-0 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/70">
            p99 38ms
          </span>
        </div>

        <div data-fade className="mt-auto flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="mb-6 text-[1.02rem] leading-relaxed text-white/85">
              Calm on the surface, paddling like mad underneath. UNBOTHERED autoscales, routes and heals your
              infrastructure around the clock — so your team ships features, not incident reports.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="cta-prints relative">
                <a
                  href="#demo"
                  className="relative z-10 inline-flex items-center rounded-full bg-volt px-7 py-4 text-[0.95rem] font-bold text-ink shadow-[0_10px_30px_-10px_rgba(255,242,0,0.8)] transition-transform hover:-translate-y-0.5"
                >
                  Book a Demo
                </a>
                {PRINTS.map((p, i) => (
                  <Footprint
                    key={i}
                    data-testid="footprint"
                    className="footprint"
                    style={{ '--x': p.x, '--y': p.y, '--r': p.r, '--d': `${i * 45}ms` }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={goToInner}
                className="inline-flex items-center gap-3 rounded-full border border-white/60 py-3.5 pl-5 pr-6 text-[0.95rem] font-semibold transition-colors hover:border-white hover:bg-white/10"
              >
                <Play className="h-6 w-6" />
                How it works
              </button>
            </div>
          </div>

          <ul className="flex gap-3">
            {STATS.map(([value, label]) => (
              <li key={label} data-testid="stat-card" className="glass min-w-[9.5rem] rounded-2xl px-5 py-4">
                <p className="font-display text-[2rem] leading-none">{value}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-white/75">{label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </section>
  );
}
