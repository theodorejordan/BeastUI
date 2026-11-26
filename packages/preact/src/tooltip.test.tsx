import '@beastui/css/beastui.css';
import { render } from 'preact';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Button } from './button';
import { Modal } from './modal';
import { Tooltip } from './tooltip';

const root = document.body.appendChild(document.createElement('div'));
afterEach(async () => {
  render(null, root);
  // Let the skip-delay window of the previous test pass, so each test starts cold.
  await new Promise((r) => setTimeout(r, 350));
});

const tip = (): HTMLElement => document.querySelector('.b-tooltip')!;
const isOpen = (): boolean => tip().matches(':popover-open');
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Focus as a keyboard user would: after a key press, focus() counts as :focus-visible. */
const keyFocus = async (name: string): Promise<void> => {
  await userEvent.keyboard('{Shift}');
  (page.getByRole('button', { name }).element() as HTMLElement).focus();
};

function Example(props: { mode?: 'description' | 'label' }) {
  return (
    <>
      <button type="button">Before</button>
      <Tooltip content="Download the file" mode={props.mode}>
        <Button iconOnly aria-label="Download">
          ↓
        </Button>
      </Tooltip>
    </>
  );
}

describe('Tooltip', () => {
  it('is closed at first, and describes the element', () => {
    render(<Example />, root);
    const button = page.getByRole('button', { name: 'Download' }).element();
    expect(isOpen()).toBe(false);
    expect(tip().getAttribute('role')).toBe('tooltip');
    expect(button.getAttribute('aria-describedby')).toBe(tip().id);
  });

  it('mode="label" names the element instead', async () => {
    render(<Example mode="label" />, root);
    const button = document.querySelector('.b-btn')!;
    expect(button.getAttribute('aria-labelledby')).toBe(tip().id);
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    await expect.element(page.getByRole('button', { name: 'Download the file' })).toBeInTheDocument();
  });

  it('opens at once on keyboard focus, and closes on blur', async () => {
    render(<Example />, root);
    await userEvent.click(page.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(isOpen()).toBe(true);
    await userEvent.tab({ shift: true });
    expect(isOpen()).toBe(false);
  });

  it('opens on hover, and closes when the pointer leaves', async () => {
    render(<Example />, root);
    await userEvent.hover(page.getByRole('button', { name: 'Download' }));
    await expect.poll(isOpen, { timeout: 1500 }).toBe(true);
    await userEvent.unhover(page.getByRole('button', { name: 'Download' }));
    await expect.poll(isOpen).toBe(false);
  });

  it('stays open while the pointer is on the tooltip itself', async () => {
    render(<Example />, root);
    await userEvent.hover(page.getByRole('button', { name: 'Download' }));
    await expect.poll(isOpen, { timeout: 1500 }).toBe(true);
    await userEvent.hover(page.getByRole('tooltip'));
    await wait(250);
    expect(isOpen()).toBe(true);
  });

  it('closes on Escape, and only the tooltip: the modal around it stays open', async () => {
    render(
      <Modal open title="Share" onClose={() => {}}>
        <Tooltip content="Copy the link">
          <button type="button">Copy</button>
        </Tooltip>
      </Modal>,
      root,
    );
    const dialog = document.querySelector('dialog')!;
    // A real user clicked to open the modal. Without such an activation the browser closes a
    // dialog on Escape with no cancellable event, and nothing can keep it open.
    await userEvent.click(page.getByText('Share'));
    await keyFocus('Copy');
    await expect.poll(isOpen).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect(dialog.open).toBe(true);
  });

  it('closes on click, and keeps the app’s own handlers', async () => {
    let clicks = 0;
    render(
      <Tooltip content="Download the file">
        <button type="button" onClick={() => clicks++} onFocus={() => clicks++}>
          Download
        </button>
      </Tooltip>,
      root,
    );
    const button = page.getByRole('button', { name: 'Download' });
    await userEvent.hover(button);
    await expect.poll(isOpen, { timeout: 1500 }).toBe(true);
    await userEvent.click(button);
    expect(isOpen()).toBe(false);
    expect(clicks).toBe(2);
  });

  it('sits above the element, inside the viewport', async () => {
    render(
      <div style="padding: 80px 0 0 0">
        <Tooltip content="A longer line that explains what this does">
          <button type="button">Sync</button>
        </Tooltip>
      </div>,
      root,
    );
    await keyFocus('Sync');
    await expect.poll(isOpen).toBe(true);
    const a = page.getByRole('button', { name: 'Sync' }).element().getBoundingClientRect();
    const b = tip().getBoundingClientRect();
    expect(tip().dataset.side).toBe('top');
    expect(b.bottom).toBeLessThanOrEqual(a.top);
    expect(b.left).toBeGreaterThanOrEqual(0);
  });

  it('flips below when there is no room above', async () => {
    render(
      <Tooltip content="Download the file">
        <button type="button">Download</button>
      </Tooltip>,
      root,
    );
    root.style.cssText = 'position: fixed; top: 0; left: 0';
    await keyFocus('Download');
    await expect.poll(isOpen).toBe(true);
    expect(tip().dataset.side).toBe('bottom');
    root.style.cssText = '';
  });
});
