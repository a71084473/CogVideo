import { forwardRef, useEffect, useRef, useState } from 'react'

/**
 * Video that only fetches its source once it's near the viewport.
 *  mode="scrub"    -> preload fully, never autoplays (a scrubber drives currentTime)
 *  mode="autoplay" -> loops while on screen, pauses when off screen
 *  mode="static"   -> poster only, the file is never downloaded (reduced motion)
 */
// Public paths are written as "/file.mp4"; resolve them against Vite's base
const asset = (p) => (p && p.startsWith('/') ? import.meta.env.BASE_URL + p.slice(1) : p)

/**
 * Scrub videos are fetched whole into a blob URL: blobs are always seekable,
 * even when the host doesn't answer HTTP range requests. Falls back to the
 * plain URL if fetching fails.
 */
function useScrubSource(src, enabled) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    if (!enabled || !src) return
    let objectUrl = null
    let cancelled = false
    fetch(src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((b) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(b)
        setUrl(objectUrl)
      })
      .catch(() => !cancelled && setUrl(src))
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setUrl(null)
    }
  }, [src, enabled])
  return url
}

const LazyVideo = forwardRef(function LazyVideo(
  { src, poster, mode = 'autoplay', eager = false, className = '', playbackRate = 1, ...rest },
  forwardedRef,
) {
  const ref = useRef(null)
  const [load, setLoad] = useState(eager && mode !== 'static')
  const resolved = asset(src)
  const scrubSrc = useScrubSource(resolved, mode === 'scrub' && load)
  const finalSrc = !load ? undefined : mode === 'scrub' ? scrubSrc ?? undefined : resolved

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
      poster={asset(poster)}
      src={finalSrc}
      onError={(e) => {
        // blob: media blocked or broken -> retry with the direct URL
        if (finalSrc?.startsWith('blob:')) e.currentTarget.src = resolved
      }}
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
