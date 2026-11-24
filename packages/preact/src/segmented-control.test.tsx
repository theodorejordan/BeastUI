import '@beastui/css/beastui.css';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { SegmentedControl } from './segmented-control';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => render(null, root));

const OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'size', label: 'Size' },
] as const;
type Sort = (typeof OPTIONS)[number]['value'];

/** A parent that owns the value, as an app would. */
function Sorter({ onChange }: { onChange?: (value: Sort) => void }) {
  const [sort, setSort] = useState<Sort>('name');
  return (
    <SegmentedControl
      label="Sort"
      options={OPTIONS}
      value={sort}
      onChange={(next) => {
        setSort(next);
        onChange?.(next);
      }}
    />
  );
}

const group = (): HTMLDivElement => root.querySelector('.b-seg')!;
const thumbX = (): string => group().style.getPropertyValue('--b-seg-x');

describe('SegmentedControl', () => {
  it('is a named radio group of native radios sharing one name', () => {
    render(<Sorter />, root);
    expect(page.getByRole('radiogroup', { name: 'Sort' }).element()).toBe(group());
    const radios = [...root.querySelectorAll<HTMLInputElement>('input[type=radio]')];
    expect(radios).toHaveLength(3);
    expect(new Set(radios.map((r) => r.name)).size).toBe(1);
    expect(radios.map((r) => r.checked)).toEqual([true, false, false]);
  });

  it('picks an option on click and reports it', async () => {
    const onChange = vi.fn();
    render(<Sorter onChange={onChange} />, root);
    await userEvent.click(page.getByRole('radio', { name: 'Date' }));
    expect(onChange).toHaveBeenCalledWith('date');
    expect(page.getByRole('radio', { name: 'Date' }).element()).toHaveProperty('checked', true);
  });

  it('moves with the arrow keys, from one tab stop', async () => {
    const onChange = vi.fn();
    render(
      <>
        <button type="button">before</button>
        <Sorter onChange={onChange} />
        <button type="button">after</button>
      </>,
      root,
    );
    page.getByRole('button', { name: 'before' }).element().focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(page.getByRole('radio', { name: 'Name' }).element());
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('date');
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'after' }).element());
  });

  it('places the outline under the picked option and follows it', async () => {
    render(<Sorter />, root);
    expect(group().hasAttribute('data-thumb')).toBe(true);
    const labels = root.querySelectorAll('label');
    expect(thumbX()).toBe(`${labels[0]!.offsetLeft}px`);
    await userEvent.click(page.getByRole('radio', { name: 'Size' }));
    expect(thumbX()).toBe(`${labels[2]!.offsetLeft}px`);
    expect(group().style.getPropertyValue('--b-seg-w')).toBe(`${labels[2]!.offsetWidth}px`);
  });

  it('slides only when the user picks; jumps when the app sets the value', async () => {
    const view = (value: Sort) => <SegmentedControl label="Sort" options={OPTIONS} value={value} onChange={() => {}} />;
    render(view('name'), root);
    render(view('date'), root); // the app changes the value, e.g. a saved choice
    expect(group().hasAttribute('data-jump')).toBe(true);
    render(null, root);
    render(<Sorter />, root);
    await userEvent.click(page.getByRole('radio', { name: 'Date' }));
    await new Promise(requestAnimationFrame); // let the ResizeObserver's first callback run
    expect(group().hasAttribute('data-jump')).toBe(false);
  });

  it('skips a disabled option', async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="Version"
        options={[
          { value: 'a', label: 'Original' },
          { value: 'b', label: 'Master', disabled: true },
        ]}
        value="a"
        onChange={onChange}
      />,
      root,
    );
    expect(page.getByRole('radio', { name: 'Master' }).element()).toHaveProperty('disabled', true);
    await userEvent.click(page.getByRole('radio', { name: 'Master' }), { force: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('uses the name it is given', () => {
    render(<SegmentedControl label="Mode" name="mode" options={OPTIONS} value="name" onChange={() => {}} />, root);
    expect(root.querySelector('input')!.name).toBe('mode');
  });
});
