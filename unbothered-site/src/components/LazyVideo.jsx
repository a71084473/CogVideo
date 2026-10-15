import { forwardRef, useEffect, useRef, useState } from 'react'

/**
 * Video that only fetches its source once it's near the viewport.
 *  mode="scrub"    -> preload fully, never autoplays (a scrubber drives currentTime)
 *  mode="autoplay" -> loops while on screen, pauses when off screen
 *  mode="static"   -> poster only, the file is never downloaded (reduced motion)
 */
const LazyVideo = forwardRef(function LazyVideo(
  { src, poster, mode = 'autoplay', eager = false, className = '', playbackRate = 1, ...rest },
  forwardedRef,
) {
  const ref = useRef(null)
  const [load, setLoad] = useState(eager && mode !== 'static')

  const setRefs = (el) => {
    ref.current = el
    if (typeof forwardedRef === 'function') forwardedRef(el)
    else if (forwardedRef) forwardedRef.current = el
  }

  // Lazy-load when within ~1.5 screens
  useEffect(() => {
    if (mode === 'static' || load) return
    const el = ref.current
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true)
          io.disconnect()
        }
      },
      { rootMargin: '150% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [mode, load])

  // Play / pause autoplay videos with visibility
  useEffect(() => {
    if (mode !== 'autoplay' || !load) return
    const el = ref.current
    el.playbackRate = playbackRate
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [mode, load, playbackRate])

  return (
    <video
      ref={setRefs}
      className={className}
      poster={poster}
      src={load ? src : undefined}
      muted
      playsInline
      loop={mode === 'autoplay'}
      preload={mode === 'scrub' ? 'auto' : mode === 'autoplay' ? 'metadata' : 'none'}
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      {...rest}
    />
  )
})

export default LazyVideo
