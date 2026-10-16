import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { clipInsets, rect, scrollThrough, section, waitForVideo } from './fixtures.js';

const { Given, When, Then } = createBdd();

const hero = (page) => section(page, 'hero');
const heroVideo = (page) => page.getByTestId('hero-video');

Then('the hero headline reads {string} for assistive technology', async ({ page }, text) => {
  const h1 = hero(page).getByRole('heading', { level: 1 });
  await expect(h1).toHaveAccessibleName(text.replaceAll(' / ', ' '));
});

Then('the headline lines are indented in a staircase', async ({ page }) => {
  const lines = hero(page).getByTestId('headline-line');
  await expect(lines).toHaveCount(3);
  const lefts = await lines.evaluateAll((els) =>
    els.map((el) => el.firstElementChild.getBoundingClientRect().left),
  );
  expect(lefts[1]).toBeGreaterThan(lefts[0]);
  expect(lefts[2]).toBeGreaterThan(lefts[1]);
});

Then('the {string} in {string} is replaced by a duck icon', async ({ page }, letter, word) => {
  const line = hero(page).getByTestId('headline-line').nth(2);
  await expect(line.getByTestId('duck-i')).toBeVisible();
  await expect(line).not.toContainText(word.replace('*', letter));
});

Then('some headline letters are set in italic', async ({ page }) => {
  const italics = await hero(page)
    .locator('h1 *')
    .evaluateAll((els) => els.filter((el) => getComputedStyle(el).fontStyle === 'italic').length);
  expect(italics).toBeGreaterThan(0);
});

Then('I see the hero video inside a frame with {int} crosshair corners', async ({ page }, n) => {
  const frame = page.getByTestId('hero-frame');
  await expect(frame).toBeVisible();
  await expect(frame.getByTestId('crosshair-corner')).toHaveCount(n);
  await expect(heroVideo(page)).toBeVisible();
});

Then('a blurred yellow glow sits behind the video frame', async ({ page }) => {
  const glow = page.getByTestId('hero-glow');
  const s = await glow.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { filter: cs.filter, bg: cs.backgroundImage, z: cs.zIndex };
  });
  expect(s.filter).toContain('blur');
  expect(s.bg).toContain('255, 242, 0');
});

Then(
  'I see a yellow {string} button and an outlined {string} button with a play icon',
  async ({ page }, primary, secondary) => {
    const cta = hero(page).getByRole('link', { name: primary });
    await expect(cta).toBeVisible();
    expect(await cta.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 242, 0)');
    const how = hero(page).getByRole('button', { name: secondary });
    await expect(how).toBeVisible();
    await expect(how.locator('svg[data-icon="play"]')).toBeVisible();
  },
);

Then('I see the stat cards:', async ({ page }, table) => {
  const cards = hero(page).getByTestId('stat-card');
  for (const { value, label } of table.hashes()) {
    const card = cards.filter({ hasText: label });
    await expect(card).toBeVisible();
    await expect(card).toContainText(value);
    expect(await card.evaluate((el) => getComputedStyle(el).backdropFilter)).toContain('blur');
  }
});

When('I hover the hero {string} button', async ({ page }, name) => {
  await hero(page).getByRole('link', { name }).hover();
});

Then('duck footprints appear around the button', async ({ page }) => {
  const prints = hero(page).getByTestId('footprint');
  expect(await prints.count()).toBeGreaterThanOrEqual(4);
  await expect
    .poll(() => prints.first().evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.5);
});

Given('the hero video is ready to scrub', async ({ page }) => {
  await waitForVideo(heroVideo(page));
});

When('I scroll {int}% through the hero', async ({ page }, pct) => {
  await scrollThrough(page, 'hero', pct);
});

When('I scroll to the end of the hero pin', async ({ page }) => {
  await scrollThrough(page, 'hero', 100);
});

Then('the hero stays pinned to the top of the viewport', async ({ page }) => {
  const r = await rect(hero(page));
  expect(Math.abs(r.top)).toBeLessThanOrEqual(2);
});

Then('the hero video is less clipped than at the start', async ({ page }) => {
  const media = page.getByTestId('hero-media');
  const now = (await clipInsets(media)).reduce((a, b) => a + b, 0);
  const initial = await page.evaluate(() => window.__unbothered.heroInitialInset());
  expect(initial).toBeGreaterThan(0);
  expect(now).toBeLessThan(initial * 0.8);
});

Then('the hero video has advanced past the first frame', async ({ page }) => {
  await expect.poll(() => heroVideo(page).evaluate((v) => v.currentTime)).toBeGreaterThan(0.5);
});

Then('the hero video fills the viewport', async ({ page }) => {
  const media = page.getByTestId('hero-media');
  const insets = await clipInsets(media);
  for (const v of insets) expect(v).toBeLessThanOrEqual(1);
  const r = await rect(media);
  const vp = page.viewportSize();
  expect(r.left).toBeLessThanOrEqual(0.5);
  expect(r.top).toBeLessThanOrEqual(0.5);
  expect(r.right).toBeGreaterThanOrEqual(vp.width - 0.5);
  expect(r.bottom).toBeGreaterThanOrEqual(vp.height - 0.5);
});

Then('the hero video autoplays on a muted loop', async ({ page }) => {
  const v = heroVideo(page);
  const s = await v.evaluate((el) => ({ autoplay: el.autoplay, loop: el.loop, muted: el.muted }));
  expect(s).toEqual({ autoplay: true, loop: true, muted: true });
});
