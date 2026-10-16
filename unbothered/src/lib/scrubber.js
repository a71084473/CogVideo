import { gsap } from 'gsap';
import { progressToTime } from './motion.js';

/**
 * Drives `video.currentTime` from scroll progress. Seeks are eased on the GSAP
 * ticker and never stacked: while the decoder is still seeking we just wait.
 * Works best with all-keyframe encodes (ffmpeg -g 1).
 */
export function createScrubber(video, { ease = 0.22 } = {}) {
  let progress = 0;
  let current = 0;

  const tick = () => {
    if (!video || video.readyState < 1) return;
    const target = progressToTime(progress, video.duration);
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.002) current = target;
    if (!video.seeking && Math.abs(video.currentTime - current) > 1 / 60) {
      video.currentTime = current;
    }
  };

  video.pause();
  gsap.ticker.add(tick);

  return {
    setProgress(p) {
      progress = p;
    },
    kill() {
      gsap.ticker.remove(tick);
    },
  };
}
