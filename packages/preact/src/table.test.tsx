import '@beastui/css/beastui.css';
import { render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { SortHeader, compareText, useSelection, useSort } from './table';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => {
  render(null, root);
  root.style.width = '';
});

type Track = { id: string; title: string; bpm: number };
const TRACKS: Track[] = [
  { id: 'a', title: 'Track 10', bpm: 124 },
  { id: 'b', title: 'track 2', bpm: 98 },
  { id: 'c', title: 'Intro', bpm: 124 },
  { id: 'd', title: 'Outro', bpm: 110 },
  { id: 'e', title: 'Fog', bpm: 90 },
];

function Tracks({ onOpen }: { onOpen?: (id: string) => void }) {
  const sort = useSort(TRACKS, {
    title: (a, b) => compareText(a.title, b.title),
    bpm: (a, b) => a.bpm - b.bpm,
  });
  const selection = useSelection(sort.rows.map((t) => t.id));
  return (
    <table class="b-table">
      <thead>
        <tr>
          <th data-select>
            <Checkbox aria-label="Select all" {...selection.allCheckbox()} />
          </th>
          <SortHeader column="title" sort={sort} grow>
            Title
          </SortHeader>
          <SortHeader column="bpm" sort={sort} align="end">
            BPM
          </SortHeader>
          <th aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {sort.rows.map((t) => (
          <tr key={t.id} {...selection.row(t.id, onOpen && (() => onOpen(t.id)))}>
            <td data-select>
              <Checkbox aria-label={`Select ${t.title}`} {...selection.checkbox(t.id)} />
            </td>
            <td data-grow>{t.title}</td>
            <td data-align="end">{t.bpm}</td>
            <td>
              <Button variant="quiet">Open</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const titles = (): string[] => [...root.querySelectorAll('tbody tr td:nth-child(2)')].map((td) => td.textContent!);
const picked = (): string[] =>
  [...root.querySelectorAll('tr[data-selected] td:nth-child(2)')].map((td) => td.textContent!);
const header = (name: string) => page.getByRole('button', { name });
const box = (title: string) => page.getByRole('checkbox', { name: `Select ${title}` });
const cell = (title: string) => [...root.querySelectorAll('td')].find((td) => td.textContent === title)!;
const sortedHeader = () => root.querySelector('th[aria-sort]');

describe('Table sorting', () => {
  it('goes ascending, descending, then back to the original order', async () => {
    render(<Tracks />, root);
    expect(sortedHeader()).toBeNull();

    await userEvent.click(header('Title'));
    // Case ignored, numbers read as numbers: "track 2" before "Track 10".
    expect(titles()).toEqual(['Fog', 'Intro', 'Outro', 'track 2', 'Track 10']);
    expect(sortedHeader()!.textContent).toBe('Title');
    expect(sortedHeader()!.getAttribute('aria-sort')).toBe('ascending');

    await userEvent.click(header('Title'));
    expect(titles()).toEqual(['Track 10', 'track 2', 'Outro', 'Intro', 'Fog']);
    expect(sortedHeader()!.getAttribute('aria-sort')).toBe('descending');

    await userEvent.click(header('Title'));
    expect(titles()).toEqual(['Track 10', 'track 2', 'Intro', 'Outro', 'Fog']);
    expect(sortedHeader()).toBeNull();
  });

  it('starts another column ascending, and equal rows keep their order', async () => {
    render(<Tracks />, root);
    await userEvent.click(header('Title'));
    await userEvent.click(header('BPM'));
    expect(titles()).toEqual(['Fog', 'track 2', 'Outro', 'Track 10', 'Intro']);
    expect(root.querySelectorAll('[aria-sort]')).toHaveLength(1);
    // Descending keeps equal rows in place too (comparator negated, not the list reversed).
    await userEvent.click(header('BPM'));
    expect(titles()).toEqual(['Track 10', 'Intro', 'Outro', 'track 2', 'Fog']);
  });

  it('is a header button the keyboard reaches', async () => {
    render(<Tracks />, root);
    (header('BPM').element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    expect(sortedHeader()!.textContent).toBe('BPM');
  });
});

describe('Table selection', () => {
  it('selects a row with its box and marks it', async () => {
    render(<Tracks />, root);
    await userEvent.click(box('Intro'));
    expect((box('Intro').element() as HTMLInputElement).checked).toBe(true);
    expect(picked()).toEqual(['Intro']);
  });

  it('selects a range with Shift+click on the boxes, in the order shown', async () => {
    render(<Tracks />, root);
    await userEvent.click(header('Title')); // Fog, Intro, Outro, track 2, Track 10
    await userEvent.click(box('Intro'));
    await userEvent.keyboard('{Shift>}');
    await userEvent.click(box('track 2'));
    await userEvent.keyboard('{/Shift}');
    expect(picked()).toEqual(['Intro', 'Outro', 'track 2']);
  });

  it('clears a range when the Shift+clicked box is turned off', async () => {
    render(<Tracks />, root);
    await userEvent.click(page.getByRole('checkbox', { name: 'Select all' }));
    await userEvent.click(box('Track 10')); // off: the anchor
    await userEvent.keyboard('{Shift>}');
    await userEvent.click(box('Intro'));
    await userEvent.keyboard('{/Shift}');
    // Order shown (unsorted): Track 10, track 2, Intro, Outro, Fog.
    expect(picked()).toEqual(['Outro', 'Fog']);
  });

  it('"select all" is mixed when some rows are selected, and a click selects them all', async () => {
    render(<Tracks />, root);
    const all = () => page.getByRole('checkbox', { name: 'Select all' }).element() as HTMLInputElement;
    await userEvent.click(box('Fog'));
    expect(all().indeterminate).toBe(true);
    await userEvent.click(all());
    expect(all().checked).toBe(true);
    expect(picked()).toHaveLength(5);
    await userEvent.click(all());
    expect(picked()).toHaveLength(0);
  });

  it('keeps the selection when the rows are sorted', async () => {
    render(<Tracks />, root);
    await userEvent.click(box('Outro'));
    await userEvent.click(header('BPM'));
    expect((box('Outro').element() as HTMLInputElement).checked).toBe(true);
  });
});

describe('Table rows', () => {
  it('a plain click opens the row, not selects it', async () => {
    const onOpen = vi.fn();
    render(<Tracks onOpen={onOpen} />, root);
    await userEvent.click(cell('Outro'));
    expect(onOpen).toHaveBeenCalledWith('d');
    expect(picked()).toEqual([]);
  });

  // Cmd on macOS. Ctrl+click on macOS opens the context menu, so the row never gets the click;
  // on Windows and Linux, Ctrl is the same code path (event.ctrlKey).
  it('Cmd+click adds or removes one row, without opening it', async () => {
    const onOpen = vi.fn();
    render(<Tracks onOpen={onOpen} />, root);
    await userEvent.click(cell('Outro'), { modifiers: ['Meta'] });
    await userEvent.click(cell('Fog'), { modifiers: ['Meta'] });
    expect(picked()).toEqual(['Outro', 'Fog']);
    await userEvent.click(cell('Outro'), { modifiers: ['Meta'] });
    expect(picked()).toEqual(['Fog']);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('Shift+click on a row selects the range from the last row clicked', async () => {
    render(<Tracks onOpen={() => {}} />, root);
    await userEvent.click(cell('track 2'), { modifiers: ['Meta'] });
    await userEvent.click(cell('Outro'), { modifiers: ['Shift'] });
    expect(picked()).toEqual(['track 2', 'Intro', 'Outro']);
  });

  it('a click anywhere in the checkbox cell toggles the row', async () => {
    render(<Tracks />, root);
    const td = box('Fog').element().closest('td')!;
    await userEvent.click(td, { position: { x: 2, y: 2 } });
    expect(picked()).toEqual(['Fog']);
  });

  it('a button in the row keeps its own click', async () => {
    const onOpen = vi.fn();
    render(<Tracks onOpen={onOpen} />, root);
    await userEvent.click(page.getByRole('button', { name: 'Open' }).first());
    expect(onOpen).not.toHaveBeenCalled();
    expect(picked()).toEqual([]);
  });
});

describe('Table foundations', () => {
  const px = (name: string): number => parseFloat(getComputedStyle(root).getPropertyValue(name));

  it('rows are the row height, the header the control height', () => {
    render(<Tracks />, root);
    expect(root.querySelector('tbody tr')!.getBoundingClientRect().height).toBe(px('--b-size-row'));
    expect(root.querySelector('thead tr')!.getBoundingClientRect().height).toBe(px('--b-size-control'));
  });

  it('a button in a row is the small control, with air above and below', () => {
    render(<Tracks />, root);
    const button = root.querySelector('tbody .b-btn')!.getBoundingClientRect();
    expect(button.height).toBe(px('--b-size-control') - px('--b-size-step'));
  });

  it('fits a narrow box: the grow column truncates, rows keep their height', () => {
    root.style.width = '170px';
    render(<Tracks />, root);
    const table = root.querySelector('table')!;
    expect(table.getBoundingClientRect().width).toBeLessThanOrEqual(170);
    const title = root.querySelector<HTMLElement>('tbody td[data-grow]')!;
    // The text is laid out wider than its cell: cut, with an ellipsis.
    const text = document.createRange();
    text.selectNodeContents(title);
    expect(text.getBoundingClientRect().width).toBeGreaterThan(title.clientWidth);
    expect(getComputedStyle(title).textOverflow).toBe('ellipsis');
    expect(root.querySelector('tbody tr')!.getBoundingClientRect().height).toBe(px('--b-size-row'));
  });
});
