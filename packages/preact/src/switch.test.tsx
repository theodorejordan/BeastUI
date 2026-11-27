import '@beastui/css/beastui.css';
import { render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Switch } from './switch';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

describe('Switch', () => {
  it('is a native checkbox with the switch role, named by its label', async () => {
    const onChange = vi.fn();
    render(
      <Switch checked={false} onChange={onChange}>
        Show hidden files
      </Switch>,
      root,
    );
    const control = page.getByRole('switch', { name: 'Show hidden files' });
    expect(control.element()).toBeInstanceOf(HTMLInputElement);
    await userEvent.click(page.getByText('Show hidden files'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('turns off with Space when on', async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Sync" checked onChange={onChange} />, root);
    (root.querySelector('input') as HTMLInputElement).focus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('moves the thumb to the far end when on', () => {
    render(<Switch aria-label="Sync" checked onChange={() => {}} />, root);
    const control = root.querySelector('input')!;
    expect(getComputedStyle(control, '::before').translate).not.toBe('none');
  });
});
