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
