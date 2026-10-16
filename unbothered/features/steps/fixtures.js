import { expect } from '@playwright/test';

/** Scroll instantly (through Lenis when active) and let ScrollTrigger + scrub smoothing settle. */
export async function scrollToY(page, y) {
  await page.evaluate((target) => window.__unbothered.scrollTo(target), y);
  await settle(page);
}

/** Wait until a few animation frames pass without the scrubbed values changing. */
export async function settle(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        let frames = 0;
        const tick = () => (++frames > 70 ? resolve() : requestAnimationFrame(tick));
        requestAnimationFrame(tick);
      }),
  );
}

/** Scroll range [start, end] (in px) over which a section's scroll animation runs. */
export async function sectionRange(page, id) {
  return page.evaluate((sectionId) => window.__unbothered.range(sectionId), id);
}

export async function scrollThrough(page, id, pct) {
  const { start, end } = await sectionRange(page, id);
  await scrollToY(page, start + ((end - start) * pct) / 100);
}

export const section = (page, id) => page.locator(`section#${id}`);

export async function rect(locator) {
  return locator.evaluate((el) => el.getBoundingClientRect().toJSON());
}

export async function waitForVideo(locator) {
  await expect
    .poll(() => locator.evaluate((v) => v.readyState), { timeout: 15_000 })
    .toBeGreaterThanOrEqual(2);
}

/** Parses `inset(a b c d round r)` into numbers (px). */
export async function clipInsets(locator) {
  const clip = await locator.evaluate((el) => getComputedStyle(el).clipPath);
  const m = clip.match(/inset\(([^)]*)\)/);
  if (!m) return [0, 0, 0, 0];
  const parts = m[1].split('round')[0].trim().split(/\s+/).map(parseFloat);
  const [t, r = t, b = t, l = r] = parts;
  return [t, r, b, l];
}
