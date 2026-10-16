import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { resolveMotionMode } from '../lib/motion.js';

gsap.registerPlugin(ScrollTrigger);

export const DESKTOP_QUERY = '(min-width: 768px)';
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

/** Mutable handle so non-React code (tests, click handlers) can reach the live Lenis instance. */
export const scroller = { lenis: null };

export function scrollToY(y, { immediate = false } = {}) {
  if (scroller.lenis) scroller.lenis.scrollTo(y, { immediate, force: true });
  else window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' });
  if (immediate) ScrollTrigger.update();
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

const MotionContext = createContext('static');
export const useMotionMode = () => useContext(MotionContext);

export function MotionProvider({ children }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_QUERY);
  const mode = resolveMotionMode({ isDesktop, reducedMotion });

  useLayoutEffect(() => {
    document.documentElement.dataset.motion = mode;
  }, [mode]);

  // Lenis smooth scroll only where we scrub; touch devices and reduced motion keep native scrolling.
  useEffect(() => {
    const html = document.documentElement;
    if (mode !== 'scrub') {
      html.dataset.smooth = 'off';
      return undefined;
    }
    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    const raf = (time) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    scroller.lenis = lenis;
    html.dataset.smooth = 'on';
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      scroller.lenis = null;
    };
  }, [mode]);

  return <MotionContext.Provider value={mode}>{children}</MotionContext.Provider>;
}
