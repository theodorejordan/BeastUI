import { expect, test } from '@playwright/test';
import { hydrated, open } from './themes';

test('disabled buttons leave the tab order; pending ones stay in it', async ({ page }) => {
  await open(page, '/components/button/', 'core', 'light');
  const stage = page.locator('.docs-demo__stage', { has: page.locator('[data-pending]') });
  const buttons = stage.locator('.b-btn');
  await buttons.nth(0).evaluate((b) => (b.closest('.docs-demo') as HTMLElement).scrollIntoView());
  // Start from the element before the demo, then Tab through it.
  await page.locator('h2', { hasText: 'Disabled and pending' }).evaluate((h) => {
    h.setAttribute('tabindex', '-1');
    h.focus();
  });
  await page.keyboard.press('Tab');
  await expect(buttons.nth(2)).toBeFocused(); // the first pending one: the two disabled are skipped
  await page.keyboard.press('Tab');
  await expect(buttons.nth(3)).toBeFocused();
});

test('pending: Enter starts the save, further presses are refused, focus stays', async ({ page }) => {
  await open(page, '/components/button/', 'core', 'light');
  const save = page.locator('astro-island .b-btn', { hasText: 'Save' }).last();
  await hydrated(page, '[aria-live]');
  await save.focus();
  await page.keyboard.press('Enter');
  await expect(save).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(save).toBeFocused();
  await expect(page.getByText('Saved once.')).toBeVisible({ timeout: 5000 });
  await expect(save).not.toHaveAttribute('aria-disabled');
});

test('the theme switcher works from the keyboard and is remembered', async ({ page }) => {
  await open(page, '/components/button/', 'core', 'light');
  const theme = page.getByRole('radiogroup', { name: 'Theme' });
  await hydrated(page, '.docs-switch');
  await theme.getByRole('radio', { name: 'Core' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'tool');
  await expect(theme.getByRole('radio', { name: 'Tool' })).toBeChecked();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'tool');
  // After the reload the switcher starts on the saved choice: no slide from the default.
  await hydrated(page, '.docs-switch');
  await expect(theme.getByRole('radio', { name: 'Tool' })).toBeChecked();
  const thumb = await theme.evaluate((group) => getComputedStyle(group.querySelector('.b-seg__thumb')!).transform);
  const tool = await theme.getByText('Tool').evaluate((span) => (span.parentElement as HTMLElement).offsetLeft);
  expect(thumb).toBe(`matrix(1, 0, 0, 1, ${tool}, 0)`);
});
