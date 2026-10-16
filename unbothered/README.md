# UNBOTHERED — landing page

A duck looks calm above the water while paddling like mad underneath: *we handle the chaos so you don't have to.*

Vite + React 19 + Tailwind CSS v4 + GSAP ScrollTrigger + Lenis, built behaviour-first (BDD).

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit specs (Vitest) + browser scenarios (Gherkin → Playwright)
```

## BDD workflow

Behaviour is specified before it is implemented, at two levels:

| Level | Where | Runner |
| --- | --- | --- |
| User-facing scenarios (Gherkin) | `features/*.feature` | [playwright-bdd](https://github.com/vitalets/playwright-bdd) → Playwright |
| Step definitions | `features/steps/*.steps.js` | — |
| Pure motion logic (Given/When/Then style) | `src/lib/*.test.js` | Vitest |

Loop: write/extend a `.feature` → `npm run test:bdd` (red) → implement → green → refactor.

Projects in `playwright.config.js`:

- **desktop** (1440×900) runs everything except `@mobile`; `@desktop` scenarios need scroll scrubbing.
- **mobile** (Pixel 7) runs `@mobile` scenarios.
- `@reduced-motion` scenarios emulate `prefers-reduced-motion: reduce`.

The page exposes a tiny test surface on `window.__unbothered` (`ready`, `scrollTo(y)`, `range(sectionId)`,
`heroInitialInset()`) plus `data-motion` / `data-smooth` on `<html>`, so scenarios can assert on real scroll
positions instead of sleeping.

> Playwright's bundled Chromium has no H.264 decoder; that's why every clip also ships as VP9 WebM.
> If your Playwright version differs from the installed browsers, set `PW_CHROMIUM_PATH`.

## Motion modes

| Mode | When | Behaviour |
| --- | --- | --- |
| `scrub` | ≥ 768px, no reduced-motion | Lenis smooth scroll; hero + inner-workings pinned; videos scrubbed by scroll |
| `autoplay` | < 768px | native scroll, stacked layout, muted looping videos (paused off-screen) |
| `static` | `prefers-reduced-motion: reduce` | no pinning, no smooth scroll, no autoplay — poster frames only |

## Videos

`public/duck-float.*` and `public/duck-dive.*` are cut from the supplied source clip and re-encoded with
**every frame a keyframe** (`-g 1`), so seeking to any `currentTime` is instant:

```bash
npm run encode -- path/to/source.mp4   # → public/duck-{float,dive}.{mp4,webm,jpg}
```

To use real duck footage, replace the two files (or point the script at new sources and adjust the cut
points at the top of `scripts/encode-videos.sh`). Videos below the fold get their `<source>` only when they
come within one viewport (`LazyVideo`).

## Structure

```
src/
  motion/MotionProvider.jsx   motion mode, Lenis ↔ ScrollTrigger wiring
  lib/motion.js               progress → time / active step / mode (unit-tested)
  lib/scrubber.js             eased, non-stacking currentTime seeking on the GSAP ticker
  components/Hero.jsx         pinned hero, clip-path frame → full bleed, video scrub
  components/MovingSection.jsx  full-screen video + parallax soap bubbles
  components/InnerWorkings.jsx  sticky split, scroll-driven accordion, dive scrub
  components/MiniCharts.jsx   line-art charts (hatched bars / ellipses, yellow dotted traces)
```
