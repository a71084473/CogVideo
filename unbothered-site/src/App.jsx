import { useEffect } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { useSmoothScroll } from './lib/smoothScroll'
import Nav from './components/Nav'
import Hero from './components/Hero'
import KeepMoving from './components/KeepMoving'
import InnerWorkings from './components/InnerWorkings'
import Closing from './components/Closing'

export default function App() {
  useSmoothScroll()

  // Re-measure once everything (fonts, posters) has settled
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <KeepMoving />
        <InnerWorkings />
        <Closing />
      </main>
    </>
  )
}
