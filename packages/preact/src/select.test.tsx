import '@beastui/css/beastui.css';
import { render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Field } from './field';
import { Select } from './select';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

const FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
] as const;

describe('Select', () => {
  it('is a native select named by its Field, with the hint read after', () => {
    render(
      <Field label="Export as" hint="CSV keeps only the first sheet.">
        <Select options={FORMATS} value="pdf" onChange={() => {}} />
      </Field>,
      root,
    );
    const select = page.getByRole('combobox', { name: 'Export as' }).element() as HTMLSelectElement;
    expect(select).toBeInstanceOf(HTMLSelectElement);
    expect(select.value).toBe('pdf');
    expect(document.getElementById(select.getAttribute('aria-describedby')!)?.textContent).toBe(
      'CSV keeps only the first sheet.',
    );
  });

  it('reports the chosen value', async () => {
    const onChange = vi.fn();
    render(<Select aria-label="Export as" options={FORMATS} value="pdf" onChange={onChange} />, root);
    await userEvent.selectOptions(page.getByRole('combobox').element() as HTMLSelectElement, 'csv');
    expect(onChange).toHaveBeenCalledWith('csv');
  });

  it('shows the placeholder while empty, and marks the select invalid on an error', () => {
    render(
      <Field label="Export as" error="Choose a format.">
        <Select options={FORMATS} value="" placeholder="Choose a format" onChange={() => {}} />
      </Field>,
      root,
    );
    const select = root.querySelector('select')!;
    expect(select.selectedOptions[0]?.textContent).toBe('Choose a format');
    expect(select.getAttribute('aria-invalid')).toBe('true');
  });
});
