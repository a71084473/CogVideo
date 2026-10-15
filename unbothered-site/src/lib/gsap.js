import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/** "Full motion" = desktop-sized and the user hasn't asked for reduced motion. */
export const SCRUB_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'
export const DESKTOP_QUERY = '(min-width: 1024px)'
export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
