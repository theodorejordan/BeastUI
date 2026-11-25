import '@beastui/css/beastui.css';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Drawer, Modal } from './modal';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

const dialog = (): HTMLDialogElement => document.querySelector('dialog')!;
const button = (name: string): HTMLElement => page.getByRole('button', { name }).element() as HTMLElement;
// The motion runs to its end only in a real page; here we wait for the 'close' of the native dialog.
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

/** An app that owns the state, the way it will in real use. */
function App(props: { drawer?: boolean; onClose?: () => void; side?: 'start' | 'end' }) {
  const [open, setOpen] = useState(false);
  const close = (): void => {
    props.onClose?.();
    setOpen(false);
  };
  const Shell = props.drawer ? Drawer : Modal;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Details
      </button>
      <Shell open={open} onClose={close} title="Contract.pdf" side={props.side} footer={<button type="button">Save</button>}>
        <p>Modified yesterday</p>
      </Shell>
    </>
  );
}

describe('Modal and Drawer', () => {
  it('opens as a modal named by its title, with the focus inside', async () => {
    render(<App />, root);
    await userEvent.click(button('Details'));
    const el = dialog();
    expect(el.open).toBe(true);
    expect(el.matches(':modal')).toBe(true);
    expect(page.getByRole('dialog', { name: 'Contract.pdf' }).element()).toBe(el);
    expect(el.contains(document.activeElement)).toBe(true);
    expect(el.className).toBe('b-modal');
  });

  it('closes on Escape, tells the app, and gives the focus back to the opener', async () => {
    const onClose = vi.fn();
    render(<App onClose={onClose} />, root);
    await userEvent.click(button('Details'));
    await userEvent.keyboard('{Escape}');
    await tick();
    expect(dialog().open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(button('Details'));
  });

  it('closes with its close button, once', async () => {
    const onClose = vi.fn();
    render(<App onClose={onClose} />, root);
    await userEvent.click(button('Details'));
    await userEvent.click(button('Close'));
    await tick();
    expect(dialog().open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on a click on the backdrop, not on a click inside', async () => {
    const onClose = vi.fn();
    render(<App drawer onClose={onClose} />, root);
    await userEvent.click(button('Details'));
    await userEvent.click(page.getByText('Modified yesterday'));
    expect(dialog().open).toBe(true);
    // The drawer is on the right: the left of the screen is backdrop.
    await userEvent.click(dialog(), { position: { x: -50, y: 50 } });
    await tick();
    expect(dialog().open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('the drawer sits on the end edge by default, on the start edge when asked', async () => {
    render(<App drawer />, root);
    await userEvent.click(button('Details'));
    expect(dialog().className).toBe('b-modal b-drawer');
    // offsetLeft leaves out the slide (translate), which may still be running.
    const right = (el: HTMLElement): number => el.offsetLeft + el.offsetWidth;
    expect(right(dialog())).toBe(document.documentElement.clientWidth);
    render(null, root);
    render(<App drawer side="start" />, root);
    await userEvent.click(button('Details'));
    expect(dialog().dataset.side).toBe('start');
    expect(dialog().offsetLeft).toBe(0);
  });

  it('keeps the head and foot in view: only the body scrolls', async () => {
    render(<App />, root);
    await userEvent.click(button('Details'));
    const body = dialog().querySelector('.b-modal-body')!;
    expect(getComputedStyle(body).overflowY).toBe('auto');
    expect(dialog().querySelector('.b-modal-foot')!.textContent).toBe('Save');
  });

  it('unmounted while open, leaves no inert page behind', async () => {
    render(<App />, root);
    await userEvent.click(button('Details'));
    render(null, root);
    expect(document.querySelector(':modal')).toBe(null);
  });
});
