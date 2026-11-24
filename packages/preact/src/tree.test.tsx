import '@beastui/css/beastui.css';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Tree, type TreeItem } from './tree';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

const FOLDERS: TreeItem[] = [
  {
    id: 'projects',
    label: 'Projects',
    count: 42,
    children: [
      { id: 'projects/website', label: 'Website', count: 12 },
      { id: 'projects/app', label: 'App', count: 30 },
    ],
  },
  { id: 'finance', label: 'Finance', count: 7 },
];

const name = (label: string): HTMLElement => page.getByRole('button', { name: label, exact: true }).element() as HTMLElement;
const toggle = (label: string): HTMLElement => page.getByRole('button', { name: `Expand ${label}` }).element() as HTMLElement;

describe('Tree', () => {
  it('folds and unfolds a branch', async () => {
    const onOpenChange = vi.fn();
    render(<Tree items={FOLDERS} onOpenChange={onOpenChange} />, root);
    expect(toggle('Projects').getAttribute('aria-expanded')).toBe('false');
    expect(root.textContent).not.toContain('Website');

    await userEvent.click(toggle('Projects'));
    expect(toggle('Projects').getAttribute('aria-expanded')).toBe('true');
    expect(name('Website')).toBeTruthy();
    expect(onOpenChange).toHaveBeenLastCalledWith(new Set(['projects']));

    await userEvent.click(toggle('Projects'));
    expect(root.textContent).not.toContain('Website');
  });

  it('gives a toggle to branches only', () => {
    render(<Tree items={FOLDERS} />, root);
    expect(root.querySelectorAll('.b-tree-toggle')).toHaveLength(1);
  });

  it('chooses an item, and marks it current', async () => {
    function Chosen() {
      const [selected, setSelected] = useState<string | null>(null);
      return <Tree items={FOLDERS} selected={selected} onSelect={setSelected} />;
    }
    render(<Chosen />, root);
    await userEvent.click(name('Finance'));
    expect(name('Finance').getAttribute('aria-current')).toBe('true');
    expect(name('Projects').hasAttribute('aria-current')).toBe(false);
  });

  it('chooses from anywhere on the row, but the toggle only folds', async () => {
    const onSelect = vi.fn();
    render(<Tree items={FOLDERS} onSelect={onSelect} />, root);
    // The count sits under the name's stretched target.
    const count = root.querySelector('.b-tree-count')!.getBoundingClientRect();
    const hit = document.elementFromPoint(count.x + count.width / 2, count.y + count.height / 2);
    expect(hit).toBe(name('Projects'));

    await userEvent.click(toggle('Projects'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('folds a group from anywhere on its row, and never chooses it', async () => {
    const onSelect = vi.fn();
    const items: TreeItem[] = [
      { id: 'shared', label: 'Shared', count: 2, group: true, children: [{ id: 'shared/team', label: 'Team' }] },
      { id: 'finance', label: 'Finance', count: 7 },
    ];
    render(<Tree items={items} onSelect={onSelect} />, root);
    // One button, named by its label.
    const group = page.getByRole('button', { name: 'Shared' }).element() as HTMLElement;
    expect(group.getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelectorAll('.b-tree-row')[0]!.querySelectorAll('button')).toHaveLength(1);

    // The count sits under the group's stretched target.
    const count = root.querySelector('.b-tree-count')!.getBoundingClientRect();
    expect(document.elementFromPoint(count.x + count.width / 2, count.y + count.height / 2)).toBe(group);

    await userEvent.click(group);
    expect(group.getAttribute('aria-expanded')).toBe('true');
    expect(name('Team')).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();

    // Its label lines up with an item's name.
    expect(group.querySelector('span')!.getBoundingClientRect().x).toBe(name('Finance').getBoundingClientRect().x);
  });

  it('tints every parent of the chosen item, open or closed', async () => {
    const items: TreeItem[] = [
      { id: 'projects', label: 'Projects', children: [{ id: 'app', label: 'App', children: [{ id: 'design', label: 'Design' }] }] },
      { id: 'finance', label: 'Finance' },
    ];
    render(<Tree items={items} selected="design" defaultOpen={['projects', 'app']} />, root);
    const row = (label: string): Element => name(label).closest('.b-tree-row')!;
    const tint = getComputedStyle(row('Design')).backgroundColor;
    expect(row('Projects').hasAttribute('data-trail')).toBe(true);
    expect(row('App').hasAttribute('data-trail')).toBe(true);
    expect(row('Design').hasAttribute('data-trail')).toBe(false);
    expect(row('Finance').hasAttribute('data-trail')).toBe(false);
    expect(getComputedStyle(row('Projects')).backgroundColor).toBe(tint);

    await userEvent.click(toggle('Projects')); // closed: the choice is hidden, the tint stays
    expect(row('Projects').hasAttribute('data-trail')).toBe(true);
  });

  it('lets the app keep the open branches', async () => {
    function Kept() {
      const [open, setOpen] = useState<ReadonlySet<string>>(new Set(['projects']));
      return <Tree items={FOLDERS} open={open} onOpenChange={setOpen} />;
    }
    render(<Kept />, root);
    expect(name('Website')).toBeTruthy();
    await userEvent.click(toggle('Projects'));
    expect(root.textContent).not.toContain('Website');
  });

  it('indents one 12px step per level, and lines names up at each level', () => {
    render(<Tree items={FOLDERS} defaultOpen={['projects']} />, root);
    const x = (label: string): number => name(label).getBoundingClientRect().x;
    expect(x('Finance')).toBe(x('Projects')); // a leaf lines up with a branch
    expect(x('Website') - x('Projects')).toBe(12);
  });

  it('centres the arrow between the selected edge and the name, and a child arrow under its parent name', () => {
    const items: TreeItem[] = [
      { id: 'projects', label: 'Projects', children: [{ id: 'app', label: 'App', children: [{ id: 'design', label: 'Design' }] }] },
    ];
    render(<Tree items={items} selected="projects" defaultOpen={['projects']} />, root);
    const centre = (el: Element): number => {
      const box = el.getBoundingClientRect();
      return box.x + box.width / 2;
    };
    const row = root.querySelector('.b-tree-row')!;
    // The inner side of the bold edge: the row's edge plus the edge's width.
    const edge = row.getBoundingClientRect().x + parseFloat(getComputedStyle(row).boxShadow.match(/(\d+(?:\.\d+)?)px/)![1]!);
    const arrow = centre(toggle('Projects').querySelector('svg')!);
    const text = name('Projects').getBoundingClientRect().x;
    expect(arrow - edge).toBe(text - arrow);
    expect(centre(toggle('App').querySelector('svg')!)).toBe(text);
  });

  it('keeps rows at the row height', () => {
    render(<Tree items={FOLDERS} />, root);
    expect(root.querySelector('.b-tree-row')!.getBoundingClientRect().height).toBe(36);
  });

  it('moves with Tab: toggle, then name', async () => {
    render(<Tree items={FOLDERS} />, root);
    toggle('Projects').focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(name('Projects'));
    await userEvent.tab();
    expect(document.activeElement).toBe(name('Finance'));
  });
});
