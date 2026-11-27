import { expect, type Page } from '@playwright/test';

export const THEMES = ['core', 'tool', 'playful'] as const;
export const MODES = ['light', 'dark'] as const;
export const PAGES = [
  '/',
  '/components/button/',
  '/components/segmented-control/',
  '/components/field/',
  '/components/checkbox/',
  '/components/radio/',
  '/components/switch/',
  '/components/textarea/',
  '/components/select/',
  '/components/multi-select/',
  '/components/tag/',
  '/components/table/',
  '/components/tree/',
  '/components/progress/',
  '/components/modal/',
  '/components/drawer/',
  '/components/empty/',
  '/components/veil/',
  '/components/skeleton/',
  '/components/alert/',
  '/components/tooltip/',
  '/components/menu/',
  '/components/popover/',
] as const;

/** Opens a page in a theme and mode, the way the docs remember a visitor's choice. */
export async function open(page: Page, path: string, theme: string, mode: string): Promise<void> {
  // Only on a fresh visit: a reload must find what the page itself saved.
  await page.addInitScript((saved) => {
    if (!localStorage.getItem('beastui-docs')) localStorage.setItem('beastui-docs', saved);
  }, JSON.stringify({ theme, mode }));
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

/** Waits until an island's JS is wired: Astro removes its ssr attribute once it has hydrated. */
export async function hydrated(page: Page, inside: string): Promise<void> {
  const island = page.locator('astro-island', { has: page.locator(inside) });
  await island.scrollIntoViewIfNeeded(); // client:visible islands hydrate only once seen
  await expect(island).not.toHaveAttribute('ssr');
}
