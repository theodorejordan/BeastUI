import '@beastui/css/beastui.css';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Alert } from './alert';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

const box = (): HTMLElement => document.querySelector('.b-alert')!;

describe('Alert', () => {
  it('neutral by default: no tone attribute, no role, the information icon', () => {
    render(<Alert>Files over 2 GB upload in parts.</Alert>, root);
    expect(box().hasAttribute('data-tone')).toBe(false);
    expect(box().hasAttribute('role')).toBe(false);
    expect(box().querySelector('.b-alert__icon svg')).not.toBeNull();
    expect(box().querySelector('.b-alert__description')!.textContent).toBe('Files over 2 GB upload in parts.');
  });

  it('puts the tone on the box and draws only the parts it is given', () => {
    render(
      <Alert tone="danger" title="Couldn’t sync 2 files">
        Contract.pdf and Logo.svg are too large.
      </Alert>,
      root,
    );
    expect(box().dataset.tone).toBe('danger');
    expect(box().querySelector('.b-alert__title')!.textContent).toBe('Couldn’t sync 2 files');
    expect(box().querySelector('.b-alert__actions')).toBeNull();
    expect(box().querySelector('.b-alert__close')).toBeNull();
  });

  it('icon={false} leaves the icon out; a custom icon replaces the tone’s', () => {
    render(<Alert icon={false}>No icon</Alert>, root);
    expect(box().querySelector('.b-alert__icon')).toBeNull();
    render(<Alert icon={<b class="mine">!</b>}>Mine</Alert>, root);
    expect(box().querySelector('.b-alert__icon .mine')).not.toBeNull();
  });

  it('passes role and other attributes through', () => {
    render(
      <Alert role="status" id="sync">
        Synced
      </Alert>,
      root,
    );
    expect(page.getByRole('status').element()).toBe(box());
    expect(box().id).toBe('sync');
  });

  it('with onDismiss, a named Dismiss button; the app removes the alert', async () => {
    function App() {
      const [shown, setShown] = useState(true);
      return shown ? (
        <Alert tone="warning" onDismiss={() => setShown(false)} dismissLabel="Hide this tip">
          Two files share a name.
        </Alert>
      ) : (
        <p>gone</p>
      );
    }
    render(<App />, root);
    expect(box().dataset.tone).toBe('warning');
    await userEvent.click(page.getByRole('button', { name: 'Hide this tip' }));
    expect(document.querySelector('.b-alert')).toBeNull();
  });
});
