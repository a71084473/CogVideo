import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToY, useMotionMode } from './motion/MotionProvider.jsx';
import { Nav } from './components/Nav.jsx';
import { Hero, heroState } from './components/Hero.jsx';
import { MovingSection } from './components/MovingSection.jsx';
import { InnerWorkings } from './components/InnerWorkings.jsx';
import { Footer } from './components/Footer.jsx';

/** Small, stable hook surface for the BDD suite (and handy in devtools). */
function exposeTestHooks() {
  window.__unbothered = {
    ready: false,
    scrollTo: (y) => scrollToY(y, { immediate: true }),
    range(id) {
      const st = ScrollTrigger.getById(id);
      if (st) return { start: st.start, end: st.end };
      const el = document.getElementById(id);
      const top = el.getBoundingClientRect().top + window.scrollY;
      return { start: top, end: top + Math.max(0, el.offsetHeight - window.innerHeight) };
    },
    heroInitialInset: () => heroState.inset.reduce((a, b) => a + b, 0),
  };
}

export default function App() {
  const mode = useMotionMode();

  useEffect(() => {
    exposeTestHooks();
    let cancelled = false;
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const timeout = new Promise((r) => setTimeout(r, 1500));
    Promise.race([fonts, timeout]).then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        window.__unbothered.ready = true;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <>
      <div id="top" />
      <Nav />
      <main>
        <Hero />
        <MovingSection />
        <InnerWorkings />
      </main>
      <Footer />
    </>
  );
}
