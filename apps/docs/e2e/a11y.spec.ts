// axe on every page, in every theme and mode: WCAG 2.1 A and AA rules (decision 0009).
// axe finds part of WCAG only; keyboard.spec.ts and manual checks cover more.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { MODES, PAGES, THEMES, open } from './themes';

for (const path of PAGES) {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`axe: ${path} in ${theme}, ${mode}`, async ({ page }) => {
        await open(page, path, theme, mode);
        await expect(page.locator('html')).toHaveAttribute('data-mode', mode);
        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(summary).toEqual([]);
      });
    }
  }
}

// The pages above are checked with their modals closed. Open ones live in the top layer, on
// their own ground: check them open too.
const OPEN = [
  { path: '/components/modal/', button: /^Rename/ },
  { path: '/components/drawer/', button: 'Details' },
] as const;

for (const { path, button } of OPEN) {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`axe: ${path} open, in ${theme}, ${mode}`, async ({ page }) => {
        await open(page, path, theme, mode);
        await page.getByRole('button', { name: button }).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        const { violations } = await new AxeBuilder({ page })
          .include('dialog[open]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(summary).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(page.getByRole('button', { name: button })).toBeFocused();
      });
    }
  }
}

// The veil open: its card sits on a washed, blurred list, a ground of its own.
for (const theme of THEMES) {
  for (const mode of MODES) {
    test(`axe: /components/veil/ busy, in ${theme}, ${mode}`, async ({ page }) => {
      await open(page, '/components/veil/', theme, mode);
      await page.getByRole('button', { name: 'Export folder' }).click();
      const card = page.locator('.b-veil-card');
      await expect(card).toBeVisible();
      await expect(page.locator('.b-veil')).toHaveCSS('opacity', '1');
      const { violations } = await new AxeBuilder({ page })
        .include('.b-veil-region')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary).toEqual([]);
      // The button outside the region stays usable, and the focus stays on it.
      await expect(page.getByRole('button', { name: 'Cancel export' })).toBeFocused();
      await page.getByRole('button', { name: 'Cancel export' }).click();
      await expect(card).toBeHidden();
    });
  }
}
