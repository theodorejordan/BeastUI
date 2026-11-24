// The docs menu: a column on wide screens, a drawer on small ones.
import { expect, test } from '@playwright/test';

test('wide: the menu lists every component and marks the page', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('/components/table/');
  const menu = page.getByRole('navigation', { name: 'Docs' });
  await expect(menu.getByRole('link', { name: 'Table', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(menu.getByRole('link', { name: 'Button', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
});

test('small: the menu opens in a drawer that holds focus and closes with Esc', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/components/table/');
  const open = page.getByRole('button', { name: 'Menu' });
  const drawer = page.getByRole('dialog', { name: 'Docs' });
  await expect(drawer).toBeHidden();

  await open.click();
  await expect(drawer).toBeVisible();
  // A modal dialog moves focus inside it.
  await expect(drawer.locator(':focus')).toHaveCount(1);
  await expect(drawer.getByRole('link', { name: 'Table', exact: true })).toHaveAttribute('aria-current', 'page');

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  // Back on the button that opened it.
  await expect(open).toBeFocused();
});

test('small: a click beside the drawer closes it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/components/table/');
  await page.getByRole('button', { name: 'Menu' }).click();
  const drawer = page.getByRole('dialog', { name: 'Docs' });
  await expect(drawer).toBeVisible();
  await page.mouse.click(370, 400);
  await expect(drawer).toBeHidden();
});
