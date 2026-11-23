// "On this page": every link reaches its heading, below the sticky bar, and marks its section.
import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1400, height: 900 } });

test('the menu lists the chapters and jumps to them', async ({ page }) => {
  await page.goto('/components/table/');
  const menu = page.getByRole('navigation', { name: 'On this page' });
  const links = menu.getByRole('link');
  await expect(links.first()).toHaveText('When to use it');

  for (const name of ['useSelection', 'Accessibility']) {
    await menu.getByRole('link', { name, exact: true }).click();
    const heading = page.getByRole('heading', { name, exact: true });
    await expect(heading).toBeInViewport();
    // Not hidden under the sticky bar.
    const bar = await page.locator('.docs-bar').boundingBox();
    const top = (await heading.boundingBox())!.y;
    expect(top).toBeGreaterThanOrEqual(bar!.y + bar!.height);
    await expect(menu.getByRole('link', { name, exact: true })).toHaveAttribute('aria-current', 'location');
  }
});

test('the menu hides when there is no room for it', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto('/components/table/');
  await expect(page.getByRole('navigation', { name: 'On this page' })).toBeHidden();
});
