import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Then } = createBdd();

Then('I see the {string} logo with the duck feet icon', async ({ page }, name) => {
  const logo = page.getByRole('banner').getByRole('link', { name });
  await expect(logo).toBeVisible();
  await expect(logo.getByTestId('duck-feet')).toBeVisible();
});

Then('the navigation contains the links:', async ({ page }, table) => {
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const [label] of table.raw()) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible();
  }
});

Then('I see an outlined {string} pill in the navigation', async ({ page }, name) => {
  const pill = page.getByRole('banner').getByRole('link', { name });
  await expect(pill).toBeVisible();
  const style = await pill.evaluate((el) => {
    const s = getComputedStyle(el);
    return { border: parseFloat(s.borderTopWidth), radius: parseFloat(s.borderTopLeftRadius), bg: s.backgroundColor };
  });
  expect(style.border).toBeGreaterThanOrEqual(1);
  expect(style.radius).toBeGreaterThanOrEqual(16);
  expect(style.bg).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
});
