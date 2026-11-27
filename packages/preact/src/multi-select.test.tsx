import '@beastui/css/beastui.css';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Field } from './field';
import { MultiSelect, type MultiSelectProps } from './multi-select';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

type Format = 'pdf' | 'docx' | 'csv' | 'xlsx' | 'json';
const FORMATS: MultiSelectProps<Format>['options'] = [
  {
    label: 'Documents',
    options: [
      { value: 'pdf', label: 'PDF' },
      { value: 'docx', label: 'Word' },
    ],
  },
  {
    label: 'Data',
    options: [
      { value: 'csv', label: 'CSV' },
      { value: 'xlsx', label: 'Excel', disabled: true },
      { value: 'json', label: 'JSON' },
    ],
  },
];

const list = (): HTMLElement => document.querySelector('.b-listbox')!;
const isOpen = (): boolean => list().matches(':popover-open');
const button = (): HTMLElement => root.querySelector('button.b-select')!;
const focused = (): string => document.activeElement?.textContent?.trim() ?? '';
// The toggle event is a task: let it run.
const settle = () => new Promise((r) => setTimeout(r, 30));

function Example(props: { initial?: Format[]; onChange?: (v: Format[]) => void; error?: string; width?: string }) {
  const [value, setValue] = useState<Format[]>(props.initial ?? []);
  return (
    <div style={{ width: props.width ?? '240px' }}>
      <Field label="Formats" hint="Each file is exported once per format." error={props.error}>
        <MultiSelect
          options={FORMATS}
          value={value}
          placeholder="Any format"
          onChange={(next) => {
            setValue(next);
            props.onChange?.(next);
          }}
        />
      </Field>
    </div>
  );
}

describe('MultiSelect', () => {
  it('names the button with the label then the whole value, and wires the Field', () => {
    render(<Example initial={['pdf', 'csv']} error="Pick one." />, root);
    const b = page.getByRole('button', { name: 'Formats PDF, CSV' }).element();
    expect(b.getAttribute('aria-haspopup')).toBe('listbox');
    expect(b.getAttribute('aria-expanded')).toBe('false');
    expect(b.getAttribute('aria-controls')).toBe(list().id);
    expect(b.getAttribute('aria-invalid')).toBe('true');
    expect(b.getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);
    expect(list().getAttribute('aria-multiselectable')).toBe('true');
    expect(document.getElementById(list().getAttribute('aria-labelledby')!)?.textContent).toBe('Formats');
  });

  it('shows the placeholder while empty', () => {
    render(<Example />, root);
    expect(button().querySelector('.b-select__placeholder')?.textContent).toBe('Any format');
    expect(page.getByRole('button', { name: 'Formats Any format' }).element()).toBe(button());
  });

  it('cuts the value where the box ends: "PDF, Word +2"', async () => {
    render(<Example initial={['pdf', 'docx', 'csv', 'json']} width="150px" />, root);
    await settle();
    const shown = button().querySelector('.b-select__value')!.textContent!;
    const more = button().querySelector('.b-select__more')?.textContent;
    const count = shown.split(', ').length;
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThan(4);
    expect(more).toBe(`+${4 - count}`);
    const text = button().querySelector('.b-select__text') as HTMLElement;
    expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
  });

  it('opens on a click with the list focused, checks on click and stays open', async () => {
    const onChange = vi.fn();
    render(<Example onChange={onChange} />, root);
    await userEvent.click(button());
    await settle();
    expect(isOpen()).toBe(true);
    expect(document.activeElement).toBe(list());
    expect(button().getAttribute('aria-expanded')).toBe('true');
    await userEvent.click(page.getByRole('option', { name: 'JSON' }));
    await userEvent.click(page.getByRole('option', { name: 'PDF' }));
    expect(onChange).toHaveBeenLastCalledWith(['pdf', 'json']);
    expect(isOpen()).toBe(true);
    expect(page.getByRole('option', { name: 'PDF' }).element().getAttribute('aria-selected')).toBe('true');
  });

  it('does nothing on a disabled option', async () => {
    const onChange = vi.fn();
    render(<Example onChange={onChange} />, root);
    await userEvent.click(button());
    await settle();
    // A real click: the locator would wait for an enabled option.
    (page.getByRole('option', { name: 'Excel' }).element() as HTMLElement).click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('follows the APG listbox keys', async () => {
    const onChange = vi.fn();
    render(<Example initial={['docx']} onChange={onChange} />, root);
    button().focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(focused()).toBe('Word'); // the first chosen option
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('CSV');
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('JSON'); // Excel is disabled: skipped
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('JSON'); // no wrap
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe('PDF');
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(['pdf', 'docx']);
    await userEvent.keyboard('{End}');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['pdf', 'docx', 'json']);
    expect(isOpen()).toBe(true);
    await userEvent.keyboard('c');
    expect(focused()).toBe('CSV');
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(button());
  });

  it('closes on Tab with focus back on the button', async () => {
    render(<Example />, root);
    button().focus();
    await userEvent.keyboard('{ArrowUp}');
    await settle();
    expect(focused()).toBe('JSON');
    await userEvent.keyboard('{Tab}');
    await settle();
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(button());
  });

  it('takes aria-label when there is no Field', () => {
    render(<MultiSelect aria-label="Formats" options={FORMATS} value={['csv']} onChange={() => {}} />, root);
    expect(page.getByRole('button', { name: 'Formats CSV' }).element()).toBe(button());
    expect(document.getElementById(list().getAttribute('aria-labelledby')!)?.textContent).toBe('Formats');
  });
});
