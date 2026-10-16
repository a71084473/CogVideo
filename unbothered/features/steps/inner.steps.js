import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { rect, scrollThrough, section, waitForVideo } from './fixtures.js';

const { Given, When, Then } = createBdd();

const inner = (page) => section(page, 'inner-workings');
const item = (page, number) => inner(page).locator(`[data-testid="accordion-item"][data-number="${number}"]`);

Then('I see the tag pill {string}', async ({ page }, text) => {
  await expect(inner(page).getByTestId('tag-pill')).toHaveText(text);
});

Then('the accordion lists:', async ({ page }, table) => {
  const items = inner(page).getByTestId('accordion-item');
  await expect(items).toHaveCount(table.hashes().length);
  for (const { number, title } of table.hashes()) {
    const it = item(page, number);
    await expect(it).toContainText(number);
    await expect(it.getByRole('button')).toHaveAccessibleName(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

Then('the left panel is off-screen to the left', async ({ page }) => {
  const r = await rect(inner(page).getByTestId('inner-left'));
  expect(r.right).toBeLessThanOrEqual(1);
});

Then('the left panel is fully in view', async ({ page }) => {
  const r = await rect(inner(page).getByTestId('inner-left'));
  expect(r.left).toBeGreaterThanOrEqual(-1);
});

Then('accordion item {string} is expanded with a description and a mini chart', async ({ page }, number) => {
  const it = item(page, number);
  await expect(it.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  await expect(it.getByTestId('step-description')).toBeVisible();
  await expect(it.getByTestId('mini-chart')).toBeVisible();
});

Then('the other accordion items are collapsed', async ({ page }) => {
  const expanded = inner(page).locator('[data-testid="accordion-item"] button[aria-expanded="true"]');
  await expect(expanded).toHaveCount(1);
});

Given('the dive video is ready to scrub', async ({ page }) => {
  await scrollThrough(page, 'inner-workings', 0);
  await waitForVideo(inner(page).getByTestId('dive-video'));
});

Then('the dive video has advanced past the first frame', async ({ page }) => {
  await expect
    .poll(() => inner(page).getByTestId('dive-video').evaluate((v) => v.currentTime))
    .toBeGreaterThan(1);
});

Then('the left panel is stacked above the dive video', async ({ page }) => {
  const left = await rect(inner(page).getByTestId('inner-left'));
  const video = await rect(inner(page).getByTestId('dive-video'));
  expect(left.bottom).toBeLessThanOrEqual(video.top + 1);
});

When('I tap accordion item {string}', async ({ page }, number) => {
  await item(page, number).getByRole('button').tap();
});
