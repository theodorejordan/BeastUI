import '@beastui/css/beastui.css';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Tree, type TreeItem } from './tree';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

const CRATES: TreeItem[] = [
  {
    id: 'house',
    label: 'House',
    count: 42,
    children: [
      { id: 'house/deep', label: 'Deep', count: 12 },
      { id: 'house/tech', label: 'Tech', count: 30 },
    ],
  },
  { id: 'techno', label: 'Techno', count: 7 },
];

const name = (label: string): HTMLElement => page.getByRole('button', { name: label, exact: true }).element() as HTMLElement;
const toggle = (label: string): HTMLElement => page.getByRole('button', { name: `Expand ${label}` }).element() as HTMLElement;

describe('Tree', () => {
  it('folds and unfolds a branch', async () => {
    const onOpenChange = vi.fn();
    render(<Tree items={CRATES} onOpenChange={onOpenChange} />, root);
    expect(toggle('House').getAttribute('aria-expanded')).toBe('false');
    expect(root.textContent).not.toContain('Deep');

    await userEvent.click(toggle('House'));
    expect(toggle('House').getAttribute('aria-expanded')).toBe('true');
    expect(name('Deep')).toBeTruthy();
    expect(onOpenChange).toHaveBeenLastCalledWith(new Set(['house']));

    await userEvent.click(toggle('House'));
    expect(root.textContent).not.toContain('Deep');
  });

  it('gives a toggle to branches only', () => {
    render(<Tree items={CRATES} />, root);
    expect(root.querySelectorAll('.b-tree-toggle')).toHaveLength(1);
  });

  it('chooses an item, and marks it current', async () => {
    function Chosen() {
      const [selected, setSelected] = useState<string | null>(null);
      return <Tree items={CRATES} selected={selected} onSelect={setSelected} />;
    }
    render(<Chosen />, root);
    await userEvent.click(name('Techno'));
    expect(name('Techno').getAttribute('aria-current')).toBe('true');
    expect(name('House').hasAttribute('aria-current')).toBe(false);
  });

  it('chooses from anywhere on the row, but the toggle only folds', async () => {
    const onSelect = vi.fn();
    render(<Tree items={CRATES} onSelect={onSelect} />, root);
    // The count sits under the name's stretched target.
    const count = root.querySelector('.b-tree-count')!.getBoundingClientRect();
    const hit = document.elementFromPoint(count.x + count.width / 2, count.y + count.height / 2);
    expect(hit).toBe(name('House'));

    await userEvent.click(toggle('House'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('folds a group from anywhere on its row, and never chooses it', async () => {
    const onSelect = vi.fn();
    const items: TreeItem[] = [
      { id: 'sets', label: 'Sets', count: 2, group: true, children: [{ id: 'sets/fri', label: 'Friday' }] },
      { id: 'techno', label: 'Techno', count: 7 },
    ];
    render(<Tree items={items} onSelect={onSelect} />, root);
    // One button, named by its label.
    const group = page.getByRole('button', { name: 'Sets' }).element() as HTMLElement;
    expect(group.getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelectorAll('.b-tree-row')[0]!.querySelectorAll('button')).toHaveLength(1);

    // The count sits under the group's stretched target.
    const count = root.querySelector('.b-tree-count')!.getBoundingClientRect();
    expect(document.elementFromPoint(count.x + count.width / 2, count.y + count.height / 2)).toBe(group);

    await userEvent.click(group);
    expect(group.getAttribute('aria-expanded')).toBe('true');
    expect(name('Friday')).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();

    // Its label lines up with an item's name.
    expect(group.querySelector('span')!.getBoundingClientRect().x).toBe(name('Techno').getBoundingClientRect().x);
  });

  it('tints every parent of the chosen item, open or closed', async () => {
    const items: TreeItem[] = [
      { id: 'house', label: 'House', children: [{ id: 'tech', label: 'Tech', children: [{ id: 'peak', label: 'Peak' }] }] },
      { id: 'techno', label: 'Techno' },
    ];
    render(<Tree items={items} selected="peak" defaultOpen={['house', 'tech']} />, root);
    const row = (label: string): Element => name(label).closest('.b-tree-row')!;
    const tint = getComputedStyle(row('Peak')).backgroundColor;
    expect(row('House').hasAttribute('data-trail')).toBe(true);
    expect(row('Tech').hasAttribute('data-trail')).toBe(true);
    expect(row('Peak').hasAttribute('data-trail')).toBe(false);
    expect(row('Techno').hasAttribute('data-trail')).toBe(false);
    expect(getComputedStyle(row('House')).backgroundColor).toBe(tint);

    await userEvent.click(toggle('House')); // closed: the choice is hidden, the tint stays
    expect(row('House').hasAttribute('data-trail')).toBe(true);
  });

  it('lets the app keep the open branches', async () => {
    function Kept() {
      const [open, setOpen] = useState<ReadonlySet<string>>(new Set(['house']));
      return <Tree items={CRATES} open={open} onOpenChange={setOpen} />;
    }
    render(<Kept />, root);
    expect(name('Deep')).toBeTruthy();
    await userEvent.click(toggle('House'));
    expect(root.textContent).not.toContain('Deep');
  });

  it('indents one 12px step per level, and lines names up at each level', () => {
    render(<Tree items={CRATES} defaultOpen={['house']} />, root);
    const x = (label: string): number => name(label).getBoundingClientRect().x;
    expect(x('Techno')).toBe(x('House')); // a leaf lines up with a branch
    expect(x('Deep') - x('House')).toBe(12);
  });

  it('centres the arrow between the selected edge and the name, and a child arrow under its parent name', () => {
    const items: TreeItem[] = [
      { id: 'house', label: 'House', children: [{ id: 'tech', label: 'Tech', children: [{ id: 'peak', label: 'Peak' }] }] },
    ];
    render(<Tree items={items} selected="house" defaultOpen={['house']} />, root);
    const centre = (el: Element): number => {
      const box = el.getBoundingClientRect();
      return box.x + box.width / 2;
    };
    const row = root.querySelector('.b-tree-row')!;
    // The inner side of the bold edge: the row's edge plus the edge's width.
    const edge = row.getBoundingClientRect().x + parseFloat(getComputedStyle(row).boxShadow.match(/(\d+(?:\.\d+)?)px/)![1]!);
    const arrow = centre(toggle('House').querySelector('svg')!);
    const text = name('House').getBoundingClientRect().x;
    expect(arrow - edge).toBe(text - arrow);
    expect(centre(toggle('Tech').querySelector('svg')!)).toBe(text);
  });

  it('keeps rows at the row height', () => {
    render(<Tree items={CRATES} />, root);
    expect(root.querySelector('.b-tree-row')!.getBoundingClientRect().height).toBe(36);
  });

  it('moves with Tab: toggle, then name', async () => {
    render(<Tree items={CRATES} />, root);
    toggle('House').focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(name('House'));
    await userEvent.tab();
    expect(document.activeElement).toBe(name('Techno'));
  });
});
