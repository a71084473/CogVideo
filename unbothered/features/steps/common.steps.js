import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { scrollThrough, scrollToY, sectionRange, section } from './fixtures.js';

const { Given, When, Then } = createBdd();

Given('I open the landing page', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__unbothered?.ready === true, null, { timeout: 15_000 });
});

Given('I am on a phone-sized screen', async ({ page }) => {
  const vp = page.viewportSize();
  expect(vp.width).toBeLessThan(768);
});

Given('I prefer reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

When('I scroll to the {string} section', async ({ page }, id) => {
  const top = await section(page, id).evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const { start } = await sectionRange(page, id);
  await scrollToY(page, Math.max(start, top));
});

When('I scroll to the start of the {string} section', async ({ page }, id) => {
  await scrollThrough(page, id, 0);
});

When('I scroll {int}% through the {string} section', async ({ page }, pct, id) => {
  await scrollThrough(page, id, pct);
});

When('I scroll through the {string} section', async ({ page }, id) => {
  await scrollThrough(page, id, 100);
});

Then('the page is in {string} motion mode', async ({ page }, mode) => {
  await expect(page.locator('html')).toHaveAttribute('data-motion', mode);
});

Then('the hero is not pinned', async ({ page }) => {
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

Then('smooth scrolling is disabled', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-smooth', 'off');
});

Then('smooth scrolling is enabled', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-smooth', 'on');
});

Then('the page does not scroll horizontally', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

Then('the {string} video has not started loading', async ({ page }, id) => {
  const v = section(page, id).locator('video');
  expect(await v.evaluate((el) => el.currentSrc)).toBe('');
  await expect(v.locator('source[src]')).toHaveCount(0);
});

Then('the {string} video has a source', async ({ page }, id) => {
  const v = section(page, id).locator('video');
  await expect(v.locator('source[src]')).not.toHaveCount(0);
  await expect.poll(() => v.evaluate((el) => el.currentSrc)).not.toBe('');
});

