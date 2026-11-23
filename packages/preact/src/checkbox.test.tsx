import '@beastui/css/beastui.css';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Checkbox } from './checkbox';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

describe('Checkbox', () => {
  it('is a native checkbox named by its label, and the label toggles it', async () => {
    const onChange = vi.fn();
    render(
      <Checkbox checked={false} onChange={onChange}>
        Turn louder tracks down
      </Checkbox>,
      root,
    );
    await userEvent.click(page.getByText('Turn louder tracks down'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(page.getByRole('checkbox', { name: 'Turn louder tracks down' }).element()).toBeInstanceOf(HTMLInputElement);
  });

  it('sets the indeterminate property, which has no attribute', () => {
    render(<Checkbox aria-label="Select all" checked={false} indeterminate onChange={() => {}} />, root);
    const box = root.querySelector('input')!;
    expect(box.indeterminate).toBe(true);
    expect(box.matches(':indeterminate')).toBe(true);
  });

  it('a click on a partly selected "select all" checks it, then the app decides', async () => {
    function SelectAll() {
      const [picked, setPicked] = useState(1);
      return (
        <Checkbox
          aria-label="Select all"
          checked={picked === 3}
          indeterminate={picked > 0 && picked < 3}
          onChange={(all) => setPicked(all ? 3 : 0)}
        />
      );
    }
    render(<SelectAll />, root);
    const box = root.querySelector('input')!;
    await userEvent.click(box);
    expect(box.checked).toBe(true);
    expect(box.indeterminate).toBe(false);
  });

  it('takes the 16px glyph slot', () => {
    render(<Checkbox aria-label="Row" checked onChange={() => {}} />, root);
    const { width, height } = root.querySelector('input')!.getBoundingClientRect();
    expect([width, height]).toEqual([16, 16]);
  });
});
