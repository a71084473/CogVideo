# UNBOTHERED — landing page

Single-page landing site for **UNBOTHERED**, a (fictional) cloud infrastructure SaaS.
Concept: a duck looks calm above water while paddling hard below — *we handle the chaos so you don't have to.*

**Stack:** Vite · React 18 · Tailwind CSS 3 · GSAP ScrollTrigger · Lenis smooth scroll.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build && npm run preview
```

## Sections

| # | Section | Desktop behaviour |
|---|---------|-------------------|
| 1 | Nav | Fixed; frosted background after scrolling |
| 2 | Hero — *SHIP / WITHOUT / THE SH🦆T* | Pinned. The framed video grows to full-bleed (clip-path + transform) while `duck-float.mp4` is scrubbed. The yellow CTA pops duck footprints on hover |
| 3 | *WE KEEP ALL MOVING* | Full-screen looping video; 4 iridescent bubbles with parallax, idle drift and a wobble on hover |
| 4 | *The inner workings (3)* | Left panel slides in, then the section pins for 300 vh: `duck-dive.mp4` is scrubbed and the accordion item (with its line-art chart) follows scroll progress. Clicking an item scrolls to its segment |
| 5 | CTA + footer | — |

### Responsive & accessibility
* **< 1024 px**: no pinning or scrubbing. The split layout stacks, and videos autoplay (looping, muted) from the lighter `*-mobile.mp4` encodes.
* **`prefers-reduced-motion: reduce`**: Lenis, pinning, scrubbing, parallax and CSS animations are all off, and videos show their poster frame only (no download).
* Videos are lazy-loaded with an IntersectionObserver (`src/components/LazyVideo.jsx`); autoplay videos pause when off-screen.

## Video assets (`/public`)

| File | Use | Encoding |
|------|-----|----------|
| `duck-float.mp4` | Hero scrub + section 3 (desktop) | H.264, **all keyframes (`-g 1`)** for instant seeking |
| `duck-dive.mp4` | Section 4 scrub (desktop) | H.264, all keyframes |
| `duck-*-mobile.mp4` | Mobile autoplay | H.264, normal GOP (smaller) |
| `duck-*-poster.jpg` | Posters / reduced-motion | — |

The current clips are cut from the supplied source footage (a 24 s POV ride): 0–12 s (outdoors, "above the surface") → `duck-float`, and 12–24 s (the museum interior, "beneath") → `duck-dive`.
To swap in new footage, run:

```bash
npm run encode -- path/to/source.mp4   # see scripts/encode-videos.sh
```

or encode each clip by hand:

```bash
ffmpeg -i in.mp4 -an -vf scale=720:-2,fps=30 -c:v libx264 -pix_fmt yuv420p -g 1 -crf 30 -movflags +faststart public/duck-float.mp4
```

Scrubbing (`src/lib/videoScrubber.js`) eases `currentTime` toward the scroll target on GSAP's ticker and skips frames while a seek is still in progress, which keeps it at 60 fps.
