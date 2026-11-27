import '@beastui/css/beastui.css';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { RadioGroup } from './radio';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

const FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel' },
] as const;

function Controlled({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState<string>('pdf');
  return (
    <RadioGroup
      label="Export as"
      options={FORMATS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe('RadioGroup', () => {
  it('is a group named by its legend, with one radio per option', () => {
    render(<Controlled />, root);
    expect(page.getByRole('group', { name: 'Export as' }).element()).toBeInstanceOf(HTMLFieldSetElement);
    expect(root.querySelectorAll('input[type="radio"]')).toHaveLength(3);
    expect((page.getByRole('radio', { name: 'PDF' }).element() as HTMLInputElement).checked).toBe(true);
  });

  it('shares one name, so the arrow keys move the choice', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />, root);
    const names = new Set([...root.querySelectorAll('input')].map((input) => input.name));
    expect(names.size).toBe(1);
    (page.getByRole('radio', { name: 'PDF' }).element() as HTMLInputElement).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('csv');
    expect((page.getByRole('radio', { name: 'CSV' }).element() as HTMLInputElement).checked).toBe(true);
  });

  it('turns every option off with disabled', () => {
    render(<RadioGroup label="Export as" options={FORMATS} value="pdf" onChange={() => {}} disabled />, root);
    for (const input of root.querySelectorAll('input')) expect(input.matches(':disabled')).toBe(true);
  });
});
