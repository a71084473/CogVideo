import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { rect, scrollThrough, section } from './fixtures.js';

const { When, Then } = createBdd();

const bubbleOffsets = (page) =>
  section(page, 'moving')
    .getByTestId('bubble')
    .evaluateAll((els) => {
      const sec = els[0].closest('section').getBoundingClientRect().top;
      return els.map((el) => el.getBoundingClientRect().top - sec);
    });

Then('I see the headline {string}', async ({ page }, text) => {
  await expect(page.getByRole('heading', { name: text })).toBeVisible();
});

Then('the {string} section has a full-screen video', async ({ page }, id) => {
  const v = section(page, id).locator('video');
  const r = await rect(v);
  const vp = page.viewportSize();
  expect(r.width).toBeGreaterThanOrEqual(vp.width - 1);
  expect(r.height).toBeGreaterThanOrEqual(vp.height - 1);
});

Then('I see the bubbles:', async ({ page }, table) => {
  const bubbles = section(page, 'moving').getByTestId('bubble');
  for (const [label] of table.raw()) {
    await expect(bubbles.filter({ hasText: label })).toBeVisible();
  }
});

Then('the bubbles have moved by different amounts', async ({ page }) => {
  await scrollThrough(page, 'moving', 0);
  const before = await bubbleOffsets(page);
  await scrollThrough(page, 'moving', 100);
  const after = await bubbleOffsets(page);
  const deltas = before.map((b, i) => Math.round(after[i] - b));
  expect(deltas.some((d) => Math.abs(d) > 20)).toBe(true);
  expect(new Set(deltas).size).toBeGreaterThan(1);
});

When('I hover the {string} bubble', async ({ page }, label) => {
  await section(page, 'moving').getByTestId('bubble').filter({ hasText: label }).hover({ force: true });
});

Then('the {string} bubble is wobbling', async ({ page }, label) => {
  const body = section(page, 'moving').getByTestId('bubble').filter({ hasText: label }).locator('.bubble-body');
  await expect.poll(() => body.evaluate((el) => getComputedStyle(el).animationName)).toContain('wobble');
});
