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

// A tooltip open: an ink box on the page, in every theme and mode.
for (const theme of THEMES) {
  for (const mode of MODES) {
    test(`axe: /components/tooltip/ open, in ${theme}, ${mode}`, async ({ page }) => {
      await open(page, '/components/tooltip/', theme, mode);
      const button = page.getByRole('button', { name: 'Download' });
      await button.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      const tip = page.getByRole('tooltip', { name: 'Download' });
      await expect(tip).toBeVisible();
      await expect(tip).toHaveCSS('opacity', '1');
      const { violations } = await new AxeBuilder({ page })
        .include('.docs-demo')
        .include('.b-tooltip')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(tip).toBeHidden();
    });
  }
}

// A menu, a multi-select's list and a popover open, in every theme and mode.
for (const theme of THEMES) {
  for (const mode of MODES) {
    test(`axe: /components/menu/ open, in ${theme}, ${mode}`, async ({ page }) => {
      await open(page, '/components/menu/', theme, mode);
      await page.getByRole('button', { name: 'Actions' }).focus();
      await page.keyboard.press('ArrowDown');
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();
      await expect(menu).toHaveCSS('opacity', '1');
      await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeFocused();
      const { violations } = await new AxeBuilder({ page })
        .include('.docs-demo')
        .include('.b-menu')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(page.getByRole('button', { name: 'Actions' })).toBeFocused();
    });

    test(`axe: /components/multi-select/ open, in ${theme}, ${mode}`, async ({ page }) => {
      await open(page, '/components/multi-select/', theme, mode);
      const box = page.getByRole('button', { name: /^Export as/ });
      await box.focus();
      await page.keyboard.press('ArrowDown');
      const list = page.getByRole('listbox', { name: 'Export as' });
      await expect(list).toBeVisible();
      await expect(list).toHaveCSS('opacity', '1');
      await expect(page.getByRole('option', { name: 'PDF' })).toBeFocused();
      const { violations } = await new AxeBuilder({ page })
        .include('.docs-demo')
        .include('.b-listbox')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(list).toBeHidden();
      await expect(box).toBeFocused();
    });

    test(`axe: /components/popover/ open, in ${theme}, ${mode}`, async ({ page }) => {
      await open(page, '/components/popover/', theme, mode);
      await page.getByRole('button', { name: 'Filter' }).click();
      const box = page.getByRole('dialog', { name: 'Filter files' });
      await expect(box).toBeVisible();
      await expect(box).toHaveCSS('opacity', '1');
      const { violations } = await new AxeBuilder({ page })
        .include('.docs-demo')
        .include('.b-popover')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const summary = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(box).toBeHidden();
    });
  }
}
