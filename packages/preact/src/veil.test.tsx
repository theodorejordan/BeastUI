import '@beastui/css/beastui.css';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Veil } from './veil';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

const content = (): HTMLElement => document.querySelector('.b-veil-content')!;
const status = (): HTMLElement => page.getByRole('status').element() as HTMLElement;

/** An app that owns the state: a button outside the region starts and ends the job. */
function App(props: { start?: boolean; delay?: boolean }) {
  const [busy, setBusy] = useState(props.start ?? false);
  return (
    <>
      <button type="button" onClick={() => setBusy((b) => !b)}>
        Toggle
      </button>
      <Veil
        busy={busy}
        title="Exporting"
        delay={props.delay}
        content={<p>3 of 7 · Contract.pdf</p>}
        actions={
          <button type="button" onClick={() => setBusy(false)}>
            Cancel
          </button>
        }
      >
        <button type="button">Contract.pdf</button>
      </Veil>
    </>
  );
}

describe('Veil', () => {
  it('when free, shows the content and nothing else', () => {
    render(<App />, root);
    expect(content().inert).toBe(false);
    expect(content().hasAttribute('aria-busy')).toBe(false);
    expect(document.querySelector('.b-veil')).toBe(null);
    expect(status().textContent).toBe('');
  });

  it('when busy, puts the content out of reach and says what is happening', async () => {
    render(<App />, root);
    await userEvent.click(page.getByRole('button', { name: 'Toggle' }));
    expect(content().inert).toBe(true);
    expect(content().getAttribute('aria-busy')).toBe('true');
    expect(document.querySelector('.b-veil-title')!.textContent).toBe('Exporting');
    expect(document.querySelector('.b-veil-body')!.textContent).toBe('3 of 7 · Contract.pdf');
    // The live region says the title only, and it was there before the job started.
    expect(status().textContent).toBe('Exporting');
  });

  it('leaves the rest of the page usable, and the focus where it was', async () => {
    render(<App />, root);
    const toggle = page.getByRole('button', { name: 'Toggle' }).element() as HTMLElement;
    await userEvent.click(toggle);
    expect(document.activeElement).toBe(toggle);
    await userEvent.click(toggle);
    expect(content().inert).toBe(false);
  });

  it('keeps its own actions in reach', async () => {
    render(<App start />, root);
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    expect(content().inert).toBe(false);
    expect(document.querySelector('.b-veil')).toBe(null);
  });

  it('catches the focus that was in the region, then gives it back', async () => {
    let setBusy!: (b: boolean) => void;
    function Driven() {
      const [busy, set] = useState(false);
      setBusy = set;
      return (
        <Veil busy={busy} title="Exporting">
          <button type="button">Contract.pdf</button>
        </Veil>
      );
    }
    render(<Driven />, root);
    const file = page.getByRole('button', { name: 'Contract.pdf' }).element() as HTMLElement;
    file.focus();
    setBusy(true);
    await expect.poll(() => document.activeElement?.classList.contains('b-veil-card')).toBe(true);
    setBusy(false);
    await expect.poll(() => document.activeElement).toBe(file);
  });

  it('waits one beat with delay, without delaying the inert', () => {
    render(<App start delay />, root);
    expect(document.querySelector('.b-veil')!.hasAttribute('data-delay')).toBe(true);
    expect(content().inert).toBe(true);
  });
});
