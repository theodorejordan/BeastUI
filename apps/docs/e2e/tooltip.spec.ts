import { expect, test } from '@playwright/test';
import { open } from './themes';

// WCAG 1.4.13: the pointer can go from the control to the tooltip. It stops in the 4 px gap
// between them, longer than the close delay, and the tooltip must still be open.
test('tooltip: the pointer crosses the gap to the tooltip without closing it', async ({ page }) => {
  await open(page, '/components/tooltip/', 'core', 'light');
  const button = page.getByRole('button', { name: 'Budget 2027.xlsx' });
  await button.hover();
  const tip = page.getByRole('tooltip', { name: /Last synced/ });
  await expect(tip).toBeVisible();

  const a = (await button.boundingBox())!;
  const b = (await tip.boundingBox())!;
  const x = a.x + a.width / 2;
  // Halfway between the tooltip's bottom and the button's top: over nothing but the bridge.
  await page.mouse.move(x, (b.y + b.height + a.y) / 2);
  await page.waitForTimeout(100);
  await expect(tip).toBeVisible();
  await page.mouse.move(x, b.y + b.height / 2);
  await page.waitForTimeout(100);
  await expect(tip).toBeVisible();

  // Off both: it closes.
  await page.mouse.move(x, a.y + a.height + 80);
  await expect(tip).toBeHidden();
});
