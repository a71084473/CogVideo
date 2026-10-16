import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotionMode, scrollToY } from '../motion/MotionProvider.jsx';
import { createScrubber } from '../lib/scrubber.js';
import { stepFromProgress } from '../lib/motion.js';
import { DisplayText } from './DisplayText.jsx';
import { Grid } from './Grid.jsx';
import { LazyVideo } from './LazyVideo.jsx';
import { RecoveryChart, RouteChart, RushChart } from './MiniCharts.jsx';

export const INTRO_END = 0.2;

const STEPS = [
  {
    number: '001',
    title: 'READY FOR THE RUSH',
    italic: [1, 12],
    body: 'Launch day, Black Friday, a celebrity tweet. Capacity is pre-warmed across regions before the spike lands, so 40× traffic feels like a quiet Tuesday.',
    Chart: RushChart,
  },
  {
    number: '002',
    title: 'EVERY REQUEST, ON TRACK',
    italic: [3, 16],
    body: 'Latency-aware routing steers every request to the fastest healthy region in under 3 ms — retries and failover included, zero config changes.',
    Chart: RouteChart,
  },
  {
    number: '003',
    title: 'BACK UP BEFORE YOU NOTICE',
    italic: [2, 15],
    body: 'Rolling snapshots every 60 seconds and self-healing replicas mean incidents are resolved before your pager even thinks about buzzing.',
    Chart: RecoveryChart,
  },
];

export function InnerWorkings() {
  const mode = useMotionMode();
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const left = useRef(null);
  const right = useRef(null);
  const video = useRef(null);

  useLayoutEffect(() => {
    if (mode !== 'scrub') return undefined;
    const ctx = gsap.context(() => {
      const scrubber = createScrubber(video.current);
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            id: 'inner-workings',
            trigger: root.current,
            start: 'top top',
            end: '+=300%',
            pin: true,
            scrub: 0.5,
            onUpdate: (self) => {
              scrubber.setProgress(self.progress);
              setActive(stepFromProgress(self.progress, { count: STEPS.length, introEnd: INTRO_END }));
            },
          },
        })
        .fromTo(left.current, { xPercent: -100 }, { xPercent: 0, duration: INTRO_END, ease: 'power2.out' }, 0)
        .fromTo(right.current, { width: '100%' }, { width: '65%', duration: INTRO_END, ease: 'power2.out' }, 0)
        .to({}, { duration: 1 - INTRO_END });
      return () => scrubber.kill();
    }, root);
    return () => ctx.revert();
  }, [mode]);

  const open = (i) => {
    const st = ScrollTrigger.getById('inner-workings');
    if (mode !== 'scrub' || !st) return setActive(i);
    const p = INTRO_END + ((1 - INTRO_END) * (i + 0.5)) / STEPS.length;
    scrollToY(st.start + (st.end - st.start) * p);
  };

  return (
    <section id="inner-workings" ref={root} className="relative isolate flex flex-col bg-deep md:block md:h-screen md:overflow-hidden">
      <div
        ref={left}
        data-testid="inner-left"
        className="relative z-10 flex flex-col overflow-hidden border-white/20 bg-lagoon/95 px-[6vw] pb-12 pt-28 md:absolute md:inset-y-0 md:left-0 md:w-[35%] md:border-r md:px-[2.6vw] md:pb-[5vh] md:pt-[13vh]"
      >
        <Grid cols={['calc(100% - 1px)']} rows={['80px']} className="hidden md:block" />
        <span data-testid="tag-pill" className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/40 px-3.5 py-1.5 text-xs font-semibold tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-hot" aria-hidden="true" />
          The inner workings (3)
        </span>
        <h2 className="font-display text-[clamp(2.2rem,8vw,3.2rem)] leading-[0.92] md:text-[min(3.15vw,5.6vh)]">
          <DisplayText text="WHAT'S GOING ON BENEATH WATER?" italic={[2, 11, 20]} />
        </h2>

        <ol className="mt-[4vh] border-t border-white/20 md:mt-auto">
          {STEPS.map((s, i) => {
            const isOpen = i === active;
            const panelId = `step-panel-${s.number}`;
            return (
              <li key={s.number} data-testid="accordion-item" data-number={s.number} data-open={isOpen} className="border-b border-white/20">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => open(i)}
                  className="flex w-full items-baseline gap-4 py-[1.6vh] text-left"
                >
                  <span className={`text-xs font-bold tabular-nums transition-colors ${isOpen ? 'text-volt' : 'text-white/60'}`}>{s.number}</span>
                  <span className={`font-display text-[1.15rem] leading-tight transition-opacity md:text-[min(1.35vw,2.6vh)] ${isOpen ? '' : 'opacity-70'}`}>
                    <DisplayText text={s.title} italic={s.italic} />
                  </span>
                  <span aria-hidden="true" className={`ml-auto text-lg transition-transform duration-300 ${isOpen ? 'rotate-45 text-volt' : ''}`}>
                    +
                  </span>
                </button>
                <div
                  id={panelId}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p data-testid="step-description" className="pb-3 pl-9 text-[0.92rem] leading-relaxed text-white/80">
                      {s.body}
                    </p>
                    <div className="pb-[2vh] pl-9">
                      <s.Chart />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div ref={right} className="relative h-[85svh] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[65%]">
        <LazyVideo
          ref={video}
          name="duck-dive"
          mode={mode}
          data-testid="dive-video"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/30 via-transparent to-transparent" />
        <Grid cols={['50%', 'calc(100% - 4vw)']} rows={['80px', 'calc(100% - 6vh)']} />
        <p className="absolute bottom-[calc(6vh+14px)] right-[calc(4vw+14px)] text-right text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80">
          Below the waterline
          <br />
          <span className="text-volt">step {STEPS[active].number} / 003</span>
        </p>
      </div>
    </section>
  );
}
