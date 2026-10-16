import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useMotionMode } from '../motion/MotionProvider.jsx';
import { DisplayText } from './DisplayText.jsx';
import { Grid } from './Grid.jsx';
import { LazyVideo } from './LazyVideo.jsx';

// x/y: desktop position, mx/my: mobile position, speed: parallax multiplier.
const BUBBLES = [
  { label: 'SCALING', x: '58%', y: '16%', mx: '8%', my: '38%', size: 'clamp(8.5rem, 15vw, 15rem)', speed: 1.35, bob: '6.5s' },
  { label: 'ROUTING', x: '78%', y: '44%', mx: '52%', my: '46%', size: 'clamp(7rem, 11vw, 11rem)', speed: 0.55, bob: '8s' },
  { label: 'RECOVERY', x: '40%', y: '58%', mx: '12%', my: '66%', size: 'clamp(7.5rem, 12.5vw, 12.5rem)', speed: 1.9, bob: '7.2s' },
  { label: 'MONITOR', x: '12%', y: '64%', mx: '56%', my: '74%', size: 'clamp(6.5rem, 9.5vw, 9.5rem)', speed: 0.9, bob: '9s' },
];

export function MovingSection() {
  const mode = useMotionMode();
  const root = useRef(null);

  useLayoutEffect(() => {
    if (mode !== 'scrub') return undefined;
    const ctx = gsap.context(() => {
      const bubbles = gsap.utils.toArray('[data-testid="bubble"]');
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { id: 'moving', trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
      });
      bubbles.forEach((el, i) => {
        const s = BUBBLES[i].speed;
        tl.fromTo(
          el,
          { y: 170 * s, x: -14 * s, rotate: -6 * s },
          { y: -170 * s, x: 14 * s, rotate: 6 * s, duration: 1 },
          0,
        );
      });
      tl.fromTo('[data-parallax="head"]', { y: 50 }, { y: -30, duration: 1 }, 0);
    }, root);
    return () => ctx.revert();
  }, [mode]);

  return (
    <section id="moving" ref={root} className="relative isolate min-h-[100svh] overflow-hidden md:h-[125vh]">
      <LazyVideo
        name="duck-float"
        mode={mode === 'static' ? 'static' : 'autoplay'}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/50 via-ink/5 to-lagoon/60" />
      <Grid cols={['4vw', 'calc(100% - 4vw)']} rows={['1px', '50%']} />

      <div data-parallax="head" className="relative z-10 max-w-3xl px-[4vw] pt-28 md:pt-[20vh]">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-volt">(02) — Always paddling</p>
        <h2 className="font-display text-[clamp(3rem,8.5vw,8.5rem)] leading-[0.86]">
          <DisplayText text="WE KEEP ALL MOVING" italic={[1, 9, 14]} />
        </h2>
        <p className="mt-6 max-w-sm text-[1.02rem] leading-relaxed text-white/85">
          Four systems working the water around the clock. You only ever see the calm part.
        </p>
      </div>

      <ul className="absolute inset-0 z-20" aria-label="What runs under the surface">
        {BUBBLES.map((b) => (
          <li
            key={b.label}
            data-testid="bubble"
            className="bubble absolute left-[var(--mx)] top-[var(--my)] w-[var(--size)] will-change-transform md:left-[var(--x)] md:top-[var(--y)]"
            style={{ '--x': b.x, '--y': b.y, '--mx': b.mx, '--my': b.my, '--size': `min(${b.size}, 40vw)` }}
          >
            <div className="bubble-float" style={{ '--bob': b.bob, '--bob-delay': `-${b.speed * 2}s` }}>
              <div className="bubble-body">
                <span className="relative rounded-full bg-ink/25 px-3 py-1 text-[0.68rem] font-bold tracking-[0.2em] backdrop-blur-[2px] md:text-xs">
                  {b.label}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
