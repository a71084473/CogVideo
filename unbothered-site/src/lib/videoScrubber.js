import { gsap } from './gsap'

/**
 * Drives video.currentTime from a 0..1 progress value with a little easing,
 * so wheel steps turn into smooth frame changes. Works best with
 * all-keyframe encodes (ffmpeg -g 1) where every seek is cheap.
 */
export function createScrubber(video, { ease = 0.2 } = {}) {
  let target = 0
  let current = 0
  let primed = false

  const prime = () => {
    if (primed) return
    primed = true
    // Some browsers won't paint seeked frames until the video has played once.
    const p = video.play()
    if (p && p.then) p.then(() => video.pause()).catch(() => {})
    else video.pause()
  }
  if (video.readyState >= 1) prime()
  video.addEventListener('loadedmetadata', prime)

  const tick = () => {
    const d = video.duration
    if (!d || video.readyState < 1) return
    const t = target * (d - 0.05)
    current += (t - current) * ease
    if (Math.abs(t - current) < 0.001) current = t
    if (!video.seeking && Math.abs(video.currentTime - current) > 1 / 120) {
      video.currentTime = current
    }
  }
  gsap.ticker.add(tick)

  return {
    set(progress) {
      target = Math.min(1, Math.max(0, progress))
    },
    kill() {
      gsap.ticker.remove(tick)
      video.removeEventListener('loadedmetadata', prime)
    },
  }
}
