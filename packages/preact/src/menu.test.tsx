import '@beastui/css/beastui.css';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Button } from './button';
import { Menu, MenuGroup, MenuItem, MenuSeparator } from './menu';
import { Modal } from './modal';
import { Popover } from './popover';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => {
  render(null, root);
});

const menu = (): HTMLElement => document.querySelector('.b-menu')!;
const isOpen = (el: HTMLElement): boolean => el.matches(':popover-open');
const trigger = (): HTMLElement => page.getByRole('button', { name: 'More' }).element() as HTMLElement;
const focused = (): string => document.activeElement?.textContent?.trim() ?? '';
// The toggle event is a task: let it run.
const settle = () => new Promise((r) => setTimeout(r, 30));

function Example(props: { onRename?: () => void; onDelete?: () => void }) {
  return (
    <>
      <button type="button">Before</button>
      <Menu trigger={<Button>More</Button>}>
        <MenuGroup label="File">
          <MenuItem onSelect={props.onRename}>Rename</MenuItem>
          <MenuItem disabled>Move</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem tone="danger" onSelect={props.onDelete}>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

describe('Menu', () => {
  it('ties the button to the menu', () => {
    render(<Example />, root);
    const button = trigger();
    expect(isOpen(menu())).toBe(false);
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(menu().id);
    expect(menu().getAttribute('aria-labelledby')).toBe(button.id);
    const group = menu().querySelector('[role="group"]')!;
    expect(document.getElementById(group.getAttribute('aria-labelledby')!)?.textContent).toBe('File');
  });

  it('a click opens it under the button, focus on the menu, no item lit', async () => {
    render(<Example />, root);
    await userEvent.click(trigger());
    await settle();
    expect(isOpen(menu())).toBe(true);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(menu());
    const b = trigger().getBoundingClientRect();
    const m = menu().getBoundingClientRect();
    expect(Math.round(m.left)).toBe(Math.round(b.left));
    expect(m.top).toBeGreaterThan(b.bottom);
  });

  it('a second click on the button closes it', async () => {
    render(<Example />, root);
    await userEvent.click(trigger());
    await settle();
    await userEvent.click(trigger());
    await settle();
    expect(isOpen(menu())).toBe(false);
  });

  it('keys: ↓ opens on the first item, arrows skip disabled and wrap, Home/End, letters', async () => {
    render(<Example />, root);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(focused()).toBe('Rename');
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('Duplicate');
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('Delete');
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('Rename');
    await userEvent.keyboard('{End}');
    expect(focused()).toBe('Delete');
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe('Rename');
    await userEvent.keyboard('d');
    expect(focused()).toBe('Duplicate');
    await userEvent.keyboard('d');
    expect(focused()).toBe('Delete');
  });

  it('↑ opens on the last item', async () => {
    render(<Example />, root);
    trigger().focus();
    await userEvent.keyboard('{ArrowUp}');
    await settle();
    expect(focused()).toBe('Delete');
  });

  it('Enter runs the item, closes, and gives focus back to the button', async () => {
    const onRename = vi.fn();
    render(<Example onRename={onRename} />, root);
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(focused()).toBe('Rename');
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(onRename).toHaveBeenCalledTimes(1);
    expect(isOpen(menu())).toBe(false);
    expect(document.activeElement).toBe(trigger());
  });

  it('a disabled item does nothing', async () => {
    render(<Example />, root);
    await userEvent.click(trigger());
    await settle();
    // force: Playwright won't click an aria-disabled element; a user still can.
    await userEvent.click(page.getByRole('menuitem', { name: 'Move' }), { force: true });
    await settle();
    expect(isOpen(menu())).toBe(true);
  });

  it('Escape and Tab close it, focus back on the button', async () => {
    render(<Example />, root);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(isOpen(menu())).toBe(false);
    expect(document.activeElement).toBe(trigger());
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    await userEvent.keyboard('{Tab}');
    await settle();
    expect(isOpen(menu())).toBe(false);
    expect(document.activeElement).toBe(trigger());
  });

  it('a click outside closes it and leaves focus where it was clicked', async () => {
    render(<Example />, root);
    await userEvent.click(trigger());
    await settle();
    const before = page.getByRole('button', { name: 'Before' });
    await userEvent.click(before);
    await settle();
    expect(isOpen(menu())).toBe(false);
    expect(document.activeElement).toBe(before.element());
  });

  it('the pointer moves the focus: one highlight', async () => {
    render(<Example />, root);
    await userEvent.click(trigger());
    await settle();
    await userEvent.hover(page.getByRole('menuitem', { name: 'Duplicate' }));
    expect(focused()).toBe('Duplicate');
  });

  it('Escape in a modal closes the menu, not the modal', async () => {
    render(
      <Modal open title="Files" onClose={() => {}}>
        <Menu trigger={<Button>More</Button>}>
          <MenuItem>Rename</MenuItem>
        </Menu>
      </Modal>,
      root,
    );
    await settle();
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(isOpen(menu())).toBe(false);
    expect((document.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
  });
});

describe('Popover', () => {
  const box = (): HTMLElement => document.querySelector('.b-popover')!;
  const filter = (): HTMLElement => page.getByRole('button', { name: 'Filter' }).element() as HTMLElement;

  it('opens on click, focus stays on the button, Tab goes in', async () => {
    render(
      <Popover trigger={<Button>Filter</Button>} label="Filter files">
        <button type="button">Apply</button>
      </Popover>,
      root,
    );
    expect(box().getAttribute('role')).toBe('dialog');
    expect(filter().getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(filter());
    await settle();
    expect(isOpen(box())).toBe(true);
    expect(filter().getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(filter());
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe('Apply');
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(isOpen(box())).toBe(false);
    expect(document.activeElement).toBe(filter());
  });

  it('controlled: the app closes it from inside', async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Popover
          trigger={<Button>Filter</Button>}
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        >
          <button type="button" onClick={() => setOpen(false)}>
            Apply
          </button>
        </Popover>
      );
    }
    render(<Controlled />, root);
    await userEvent.click(filter());
    await settle();
    expect(isOpen(box())).toBe(true);
    expect(box().getAttribute('aria-labelledby')).toBe(filter().id);
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await settle();
    expect(isOpen(box())).toBe(false);
    expect(document.activeElement).toBe(filter());
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });
});
