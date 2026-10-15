import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, REDUCED_QUERY } from './gsap'

let lenis = null

/** Scroll to an element or y-offset, smoothly when Lenis is running. */
export function scrollToTarget(target, opts = {}) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.4, ...opts })
    return
  }
  const y =
    typeof target === 'number'
      ? target
      : (typeof target === 'string' ? document.querySelector(target) : target)?.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top: y ?? 0, behavior: 'auto' })
}

/** Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function useSmoothScroll() {
  useEffect(() => {
    const mql = window.matchMedia(REDUCED_QUERY)
    let tick = null

    const start = () => {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
      lenis.on('scroll', ScrollTrigger.update)
      tick = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }
    const stop = () => {
      if (tick) gsap.ticker.remove(tick)
      lenis?.destroy()
      lenis = null
      tick = null
    }
    const sync = () => (mql.matches ? stop() : !lenis && start())

    sync()
    mql.addEventListener('change', sync)

    // In-page anchors go through Lenis
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')
      if (id.length < 2) return
      const el = document.querySelector(id)
      if (!el) return
      e.preventDefault()
      scrollToTarget(el)
    }
    document.addEventListener('click', onClick)

    return () => {
      mql.removeEventListener('change', sync)
      document.removeEventListener('click', onClick)
      stop()
    }
  }, [])
}
