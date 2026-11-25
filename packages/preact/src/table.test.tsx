import '@beastui/css/beastui.css';
import { Fragment, render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { SortHeader, compareText, useDetail, useSelection, useSort } from './table';

const root = document.body.appendChild(document.createElement('div'));
afterEach(() => {
  render(null, root);
  root.style.width = '';
});

type Entry = { id: string; title: string; kb: number };
const FILES: Entry[] = [
  { id: 'a', title: 'Notes 10', kb: 124 },
  { id: 'b', title: 'notes 2', kb: 98 },
  { id: 'c', title: 'Budget', kb: 124 },
  { id: 'd', title: 'Contract', kb: 110 },
  { id: 'e', title: 'Agenda', kb: 90 },
];

function Files({ onOpen }: { onOpen?: (id: string) => void }) {
  const sort = useSort(FILES, {
    title: (a, b) => compareText(a.title, b.title),
    kb: (a, b) => a.kb - b.kb,
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
          <SortHeader column="kb" sort={sort} align="end">
            Size
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
            <td data-align="end">{t.kb}</td>
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
    render(<Files />, root);
    expect(sortedHeader()).toBeNull();

    await userEvent.click(header('Title'));
    // Case ignored, numbers read as numbers: "notes 2" before "Notes 10".
    expect(titles()).toEqual(['Agenda', 'Budget', 'Contract', 'notes 2', 'Notes 10']);
    expect(sortedHeader()!.textContent).toBe('Title');
    expect(sortedHeader()!.getAttribute('aria-sort')).toBe('ascending');

    await userEvent.click(header('Title'));
    expect(titles()).toEqual(['Notes 10', 'notes 2', 'Contract', 'Budget', 'Agenda']);
    expect(sortedHeader()!.getAttribute('aria-sort')).toBe('descending');

    await userEvent.click(header('Title'));
    expect(titles()).toEqual(['Notes 10', 'notes 2', 'Budget', 'Contract', 'Agenda']);
    expect(sortedHeader()).toBeNull();
  });

  it('starts another column ascending, and equal rows keep their order', async () => {
    render(<Files />, root);
    await userEvent.click(header('Title'));
    await userEvent.click(header('Size'));
    expect(titles()).toEqual(['Agenda', 'notes 2', 'Contract', 'Notes 10', 'Budget']);
    expect(root.querySelectorAll('[aria-sort]')).toHaveLength(1);
    // Descending keeps equal rows in place too (comparator negated, not the list reversed).
    await userEvent.click(header('Size'));
    expect(titles()).toEqual(['Notes 10', 'Budget', 'Contract', 'notes 2', 'Agenda']);
  });

  it('is a header button the keyboard reaches', async () => {
    render(<Files />, root);
    (header('Size').element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    expect(sortedHeader()!.textContent).toBe('Size');
  });
});

describe('Table selection', () => {
  it('selects a row with its box and marks it', async () => {
    render(<Files />, root);
    await userEvent.click(box('Budget'));
    expect((box('Budget').element() as HTMLInputElement).checked).toBe(true);
    expect(picked()).toEqual(['Budget']);
  });

  it('selects a range with Shift+click on the boxes, in the order shown', async () => {
    render(<Files />, root);
    await userEvent.click(header('Title')); // Agenda, Budget, Contract, notes 2, Notes 10
    await userEvent.click(box('Budget'));
    await userEvent.keyboard('{Shift>}');
    await userEvent.click(box('notes 2'));
    await userEvent.keyboard('{/Shift}');
    expect(picked()).toEqual(['Budget', 'Contract', 'notes 2']);
  });

  it('clears a range when the Shift+clicked box is turned off', async () => {
    render(<Files />, root);
    await userEvent.click(page.getByRole('checkbox', { name: 'Select all' }));
    await userEvent.click(box('Notes 10')); // off: the anchor
    await userEvent.keyboard('{Shift>}');
    await userEvent.click(box('Budget'));
    await userEvent.keyboard('{/Shift}');
    // Order shown (unsorted): Notes 10, notes 2, Budget, Contract, Agenda.
    expect(picked()).toEqual(['Contract', 'Agenda']);
  });

  it('"select all" is mixed when some rows are selected, and a click selects them all', async () => {
    render(<Files />, root);
    const all = () => page.getByRole('checkbox', { name: 'Select all' }).element() as HTMLInputElement;
    await userEvent.click(box('Agenda'));
    expect(all().indeterminate).toBe(true);
    await userEvent.click(all());
    expect(all().checked).toBe(true);
    expect(picked()).toHaveLength(5);
    await userEvent.click(all());
    expect(picked()).toHaveLength(0);
  });

  it('keeps the selection when the rows are sorted', async () => {
    render(<Files />, root);
    await userEvent.click(box('Contract'));
    await userEvent.click(header('Size'));
    expect((box('Contract').element() as HTMLInputElement).checked).toBe(true);
  });
});

describe('Table rows', () => {
  it('a plain click opens the row, not selects it', async () => {
    const onOpen = vi.fn();
    render(<Files onOpen={onOpen} />, root);
    await userEvent.click(cell('Contract'));
    expect(onOpen).toHaveBeenCalledWith('d');
    expect(picked()).toEqual([]);
  });

  // Cmd on macOS. Ctrl+click on macOS opens the context menu, so the row never gets the click;
  // on Windows and Linux, Ctrl is the same code path (event.ctrlKey).
  it('Cmd+click adds or removes one row, without opening it', async () => {
    const onOpen = vi.fn();
    render(<Files onOpen={onOpen} />, root);
    await userEvent.click(cell('Contract'), { modifiers: ['Meta'] });
    await userEvent.click(cell('Agenda'), { modifiers: ['Meta'] });
    expect(picked()).toEqual(['Contract', 'Agenda']);
    await userEvent.click(cell('Contract'), { modifiers: ['Meta'] });
    expect(picked()).toEqual(['Agenda']);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('Shift+click on a row selects the range from the last row clicked', async () => {
    render(<Files onOpen={() => {}} />, root);
    await userEvent.click(cell('notes 2'), { modifiers: ['Meta'] });
    await userEvent.click(cell('Contract'), { modifiers: ['Shift'] });
    expect(picked()).toEqual(['notes 2', 'Budget', 'Contract']);
  });

  it('a click anywhere in the checkbox cell toggles the row', async () => {
    render(<Files />, root);
    const td = box('Agenda').element().closest('td')!;
    await userEvent.click(td, { position: { x: 2, y: 2 } });
    expect(picked()).toEqual(['Agenda']);
  });

  it('a button in the row keeps its own click', async () => {
    const onOpen = vi.fn();
    render(<Files onOpen={onOpen} />, root);
    await userEvent.click(page.getByRole('button', { name: 'Open' }).first());
    expect(onOpen).not.toHaveBeenCalled();
    expect(picked()).toEqual([]);
  });
});

/** Rows that open a detail: the name is the open button (b-table-open). */
function Openable({ onOpen, multiple }: { onOpen?: (id: string) => void; multiple?: boolean }) {
  const selection = useSelection(FILES.map((t) => t.id));
  const detail = useDetail<string>({ multiple });
  return (
    <table class="b-table">
      <tbody>
        {FILES.map((t) => (
          <Fragment key={t.id}>
            <tr
              {...detail.row(t.id)}
              {...selection.row(t.id, () => {
                onOpen?.(t.id);
                detail.toggle(t.id);
              })}
            >
              <td data-grow>
                <button class="b-table-open" {...detail.button(t.id)}>
                  {t.title}
                </button>
              </td>
            </tr>
            {detail.isOpen(t.id) && (
              <tr {...detail.detail(t.id)}>
                <td>Details of {t.title}</td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

const openButton = (title: string) => page.getByRole('button', { name: title, exact: true });
const details = (): string[] => [...root.querySelectorAll('tr[data-detail]')].map((tr) => tr.textContent!);

describe('Table detail rows', () => {
  it('the open button is the row: a click or Enter opens it', async () => {
    const onOpen = vi.fn();
    render(<Openable onOpen={onOpen} />, root);
    await userEvent.click(openButton('Contract'));
    expect(onOpen).toHaveBeenCalledWith('d');
    (openButton('Budget').element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    expect(onOpen).toHaveBeenLastCalledWith('c');
  });

  it('Cmd+click on the open button selects, without opening', async () => {
    const onOpen = vi.fn();
    render(<Openable onOpen={onOpen} />, root);
    await userEvent.click(openButton('Agenda'), { modifiers: ['Meta'] });
    expect(root.querySelector('tr[data-selected]')?.textContent).toBe('Agenda');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('opens one row at a time by default, and a second click closes it', async () => {
    render(<Openable />, root);
    await userEvent.click(openButton('Contract'));
    await userEvent.click(openButton('Budget'));
    expect(details()).toEqual(['Details of Budget']);
    await userEvent.click(openButton('Budget'));
    expect(details()).toEqual([]);
  });

  it('opens several rows with multiple', async () => {
    render(<Openable multiple />, root);
    await userEvent.click(openButton('Contract'));
    await userEvent.click(openButton('Budget'));
    expect(details()).toEqual(['Details of Budget', 'Details of Contract']);
  });

  it('wires the disclosure: aria-expanded, aria-controls to the detail, data-open', async () => {
    render(<Openable />, root);
    const button = openButton('Contract').element();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.hasAttribute('aria-controls')).toBe(false);
    await userEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    const detail = document.getElementById(button.getAttribute('aria-controls')!);
    expect(detail?.textContent).toBe('Details of Contract');
    expect(button.closest('tr')!.hasAttribute('data-open')).toBe(true);
  });
});

describe('Table foundations', () => {
  const px = (name: string): number => parseFloat(getComputedStyle(root).getPropertyValue(name));

  it('rows are the row height, the header the control height', () => {
    render(<Files />, root);
    expect(root.querySelector('tbody tr')!.getBoundingClientRect().height).toBe(px('--b-size-row'));
    expect(root.querySelector('thead tr')!.getBoundingClientRect().height).toBe(px('--b-size-control'));
  });

  it('has one even gap between all columns, and the control inset at the edges', () => {
    render(<Files />, root);
    const cells = [...root.querySelector('tbody tr')!.children].map((c) => getComputedStyle(c));
    const gap = px('--b-space-4');
    const inset = px('--b-inset-control');
    cells.forEach((c, i) => {
      expect(parseFloat(c.paddingLeft)).toBe(i === 0 ? inset : gap / 2);
      expect(parseFloat(c.paddingRight)).toBe(i === cells.length - 1 ? inset : gap / 2);
    });
  });

  it('a button in a row is the small control, with air above and below', () => {
    render(<Files />, root);
    const button = root.querySelector('tbody .b-btn')!.getBoundingClientRect();
    expect(button.height).toBe(px('--b-size-control') - px('--b-size-step'));
  });

  it('fits a narrow box: the grow column truncates, rows keep their height', () => {
    root.style.width = '200px';
    render(<Files />, root);
    const table = root.querySelector('table')!;
    expect(table.getBoundingClientRect().width).toBeLessThanOrEqual(200);
    const title = root.querySelector<HTMLElement>('tbody td[data-grow]')!;
    // The text is laid out wider than its cell: cut, with an ellipsis.
    const text = document.createRange();
    text.selectNodeContents(title);
    expect(text.getBoundingClientRect().width).toBeGreaterThan(title.clientWidth);
    expect(getComputedStyle(title).textOverflow).toBe('ellipsis');
    expect(root.querySelector('tbody tr')!.getBoundingClientRect().height).toBe(px('--b-size-row'));
  });
});
