import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

/**
 * Muted inline video that only attaches its sources when it nears the viewport.
 *   mode 'scrub'    → paused, fully preloaded; currentTime is driven by scroll.
 *   mode 'autoplay' → loops while on screen, pauses off screen.
 *   mode 'static'   → poster frame only (reduced motion).
 * MP4 (H.264) first, VP9 WebM as fallback for browsers without H.264.
 */
export const LazyVideo = forwardRef(function LazyVideo({ name, mode, eager = false, className = '', ...rest }, ref) {
  const video = useRef(null);
  const [load, setLoad] = useState(eager);
  useImperativeHandle(ref, () => video.current);

  useEffect(() => {
    const v = video.current;
    v.muted = true;
    v.defaultMuted = true;
  }, []);

  useEffect(() => {
    if (load) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(video.current);
    return () => io.disconnect();
  }, [load]);

  useEffect(() => {
    if (load && !eager) video.current.load();
  }, [load, eager]);

  useEffect(() => {
    const v = video.current;
    if (!load || mode !== 'autoplay') {
      v.pause();
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [load, mode]);

  const autoplay = mode === 'autoplay';
  return (
    <video
      ref={video}
      className={className}
      poster={`/${name}.jpg`}
      muted
      playsInline
      loop={autoplay}
      autoPlay={autoplay}
      preload={!load ? 'none' : mode === 'static' ? 'metadata' : 'auto'}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      {...rest}
    >
      {load && (
        <>
          <source src={`/${name}.mp4`} type="video/mp4" />
          <source src={`/${name}.webm`} type="video/webm" />
        </>
      )}
    </video>
  );
});
