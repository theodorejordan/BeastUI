// The theme goes on the demos only; the docs' frame stays in core (owner, 2026-11-26).
import { expect, test, type Locator } from '@playwright/test';
import { open } from './themes';

/** A custom property's value as the element sees it. */
const token = (el: Locator, prop: string): Promise<string> =>
  el.evaluate((node, p) => getComputedStyle(node).getPropertyValue(p).trim(), prop);

test('a tool demo is in tool, its frame stays in core', async ({ page }) => {
  await open(page, '/components/button/', 'tool', 'light');
  const stage = page.locator('.docs-demo__stage').first();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  await expect(stage).toHaveAttribute('data-theme', 'tool');

  // The frame: core's sizes and case.
  const bar = page.locator('.docs-bar');
  expect(await token(bar, '--b-size-control')).toBe('32px');
  expect(await token(bar, '--b-case')).toBe('none');

  // The demo: tool's own values, aliases included. --b-radius-control is var(--b-radius-2): it
  // must follow tool's 4px, not keep core's value resolved on <html>.
  const button = stage.locator('.b-btn').first();
  expect(await token(button, '--b-size-control')).toBe('28px');
  expect(await token(button, '--b-radius-control')).toBe('4px');
  expect(await token(button, '--b-case')).toBe('lowercase');
  expect(await button.evaluate((el) => getComputedStyle(el).height)).toBe('28px');
});
