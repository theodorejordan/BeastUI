// Every component page has the same chapters, in the same order, so a reader finds their way on
// any page. A page may leave out an optional chapter, never rename or move one. What differs
// between components goes in Examples, as h3.
import { expect, test } from '@playwright/test';
import { PAGES } from './themes';

const CHAPTERS = [
  'When to use it',
  'Examples',
  'How it behaves',
  'Writing it',
  'Accessibility',
  'In HTML',
  'In Preact',
];
const REQUIRED = ['When to use it', 'Accessibility', 'In HTML'];

for (const path of PAGES.filter((p) => p.startsWith('/components/'))) {
  test(`${path} follows the page structure`, async ({ page }) => {
    await page.goto(path);
    const main = page.locator('main');
    const chapters = await main.locator('h2:not([class])').allTextContents();

    for (const name of chapters) expect(CHAPTERS, `unknown chapter "${name}"`).toContain(name);
    const order = chapters.map((name) => CHAPTERS.indexOf(name));
    expect(order, 'chapters out of order').toEqual([...order].sort((a, b) => a - b));
    for (const name of REQUIRED) expect(chapters, `missing "${name}"`).toContain(name);

    // The component is shown before the first chapter.
    const before = await main.evaluate((el) => {
      const first = el.querySelector('h2:not([class])');
      return [...el.querySelectorAll('.docs-demo')].some(
        (demo) => first && demo.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
    expect(before, 'no demo above the first chapter').toBe(true);
  });
}
