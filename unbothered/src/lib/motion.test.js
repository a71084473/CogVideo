import { describe, expect, it } from 'vitest';
import { progressToTime, resolveMotionMode, segmentProgress, stepFromProgress } from './motion.js';

describe('Feature: choosing how the page moves', () => {
  it('Given a desktop visitor with no motion preference, Then videos are scroll-scrubbed', () => {
    expect(resolveMotionMode({ isDesktop: true, reducedMotion: false })).toBe('scrub');
  });
  it('Given a phone visitor, Then videos simply autoplay', () => {
    expect(resolveMotionMode({ isDesktop: false, reducedMotion: false })).toBe('autoplay');
  });
  it('Given a visitor who prefers reduced motion, Then everything is static on any device', () => {
    expect(resolveMotionMode({ isDesktop: true, reducedMotion: true })).toBe('static');
    expect(resolveMotionMode({ isDesktop: false, reducedMotion: true })).toBe('static');
  });
});

describe('Feature: mapping scroll progress to video time', () => {
  it('Given progress 0, Then the first frame is shown', () => {
    expect(progressToTime(0, 12)).toBe(0);
  });
  it('Given half progress, Then the middle of the clip is shown', () => {
    expect(progressToTime(0.5, 12)).toBeCloseTo(6, 1);
  });
  it('Given full progress, Then it stops just short of the end so the frame never blanks', () => {
    const t = progressToTime(1, 12);
    expect(t).toBeLessThan(12);
    expect(t).toBeGreaterThan(11.8);
  });
  it('Given out-of-range progress or unknown duration, Then it is clamped safely', () => {
    expect(progressToTime(-1, 12)).toBe(0);
    expect(progressToTime(2, 12)).toBeLessThan(12);
    expect(progressToTime(0.5, NaN)).toBe(0);
  });
});

describe('Feature: sub-ranges of a pinned timeline', () => {
  it('When progress is inside the segment, Then it is normalised to 0..1', () => {
    expect(segmentProgress(0.6, 0.2, 1)).toBeCloseTo(0.5);
  });
  it('When progress is outside the segment, Then it is clamped', () => {
    expect(segmentProgress(0.1, 0.2, 1)).toBe(0);
    expect(segmentProgress(1.2, 0.2, 1)).toBe(1);
  });
});

describe('Feature: the active "inner workings" step follows scroll', () => {
  const opts = { count: 3, introEnd: 0.2 };
  it('Given the panel is still sliding in, Then step 001 is active', () => {
    expect(stepFromProgress(0, opts)).toBe(0);
    expect(stepFromProgress(0.19, opts)).toBe(0);
  });
  it('Given progress moves through the remaining scroll, Then each step gets an equal share', () => {
    expect(stepFromProgress(0.35, opts)).toBe(0);
    expect(stepFromProgress(0.5, opts)).toBe(1);
    expect(stepFromProgress(0.65, opts)).toBe(1);
    expect(stepFromProgress(0.8, opts)).toBe(2);
  });
  it('Given the very end, Then the last step stays active', () => {
    expect(stepFromProgress(1, opts)).toBe(2);
  });
});
