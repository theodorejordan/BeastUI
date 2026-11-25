/**
 * Table: building blocks, not a data grid. The app writes its own <table class="b-table">, so
 * any cell can hold anything (a tag, a button, a waveform). BeastUI adds the two behaviours a
 * table needs and markup can't do alone:
 *
 * - Sorting: useSort keeps which column and which way; SortHeader is the header cell, a
 *   <button> with aria-sort on the <th> (WAI-ARIA APG, sortable table). The app can sort the
 *   rows itself (useSort sorts them with the comparators given) or on a server (read `state`).
 * - Selection: useSelection keeps the selected ids and wires the checkboxes, "select all" with
 *   the mixed state included, and the rows: Shift+click selects a range and Cmd+click (Ctrl+click
 *   on Windows and Linux) adds or removes one row, like Finder. A plain click stays the app's.
 * - Detail rows: useDetail keeps the open rows (one at a time, or several with `multiple`) and
 *   wires the disclosure: data-open, aria-expanded, aria-controls and the detail row's id.
 */
import type { ComponentChildren, JSX } from 'preact';
import { useId, useMemo, useRef, useState } from 'preact/hooks';

/* ----- Sorting ----- */

export type SortDirection = 'ascending' | 'descending';
export type SortState<K extends string> = { key: K; direction: SortDirection } | null;

export type Sort<T, K extends string> = {
  /** The rows in sorted order (a copy; the input is not touched). */
  rows: T[];
  state: SortState<K>;
  /** A header click: ascending, then descending, then back to the original order. */
  toggle: (key: K) => void;
  setState: (state: SortState<K>) => void;
};

/** Text, the way people expect it: case and accents ignored, "File 2" before "File 10". */
export const compareText: (a: string, b: string) => number = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
}).compare;

/**
 * Sorts `rows` by one column at a time. `compare` gives one ascending comparator per sortable
 * column. Equal rows keep their order (Array.prototype.sort is stable), so descending is the
 * comparator negated, not the result reversed.
 */
export function useSort<T, K extends string>(
  rows: readonly T[],
  compare: Record<K, (a: T, b: T) => number>,
  initial: SortState<K> = null,
): Sort<T, K> {
  const [state, setState] = useState<SortState<K>>(initial);
  const sorted = useMemo(() => {
    if (!state) return [...rows];
    const by = compare[state.key];
    const sign = state.direction === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => sign * by(a, b));
    // Not on `compare`: it is usually an inline object, so it would re-sort on every render.
  }, [rows, state]);
  // Three steps, so the original order (a folder's, a list's) is one more click away.
  const toggle = (key: K): void => {
    if (state?.key !== key) setState({ key, direction: 'ascending' });
    else if (state.direction === 'ascending') setState({ key, direction: 'descending' });
    else setState(null);
  };
  return { rows: sorted, state, toggle, setState };
}

export type SortHeaderProps<K extends string> = {
  /** The column this header sorts. */
  column: K;
  /** What useSort returned (only `state` and `toggle` are read). */
  sort: Pick<Sort<unknown, K>, 'state' | 'toggle'>;
  /** `end` for long numbers (the arrow on the left), `center` for short values of one width. */
  align?: 'start' | 'center' | 'end';
  /** The column that takes the room left and shrinks first (data-grow). */
  grow?: boolean;
  children: ComponentChildren;
  class?: string;
};

/** A sortable header cell. Only the sorted column carries aria-sort (APG). */
export function SortHeader<K extends string>({
  column,
  sort,
  align,
  grow = false,
  children,
  class: extraClass,
}: SortHeaderProps<K>): JSX.Element {
  const direction = sort.state?.key === column ? sort.state.direction : undefined;
  return (
    <th
      aria-sort={direction}
      data-align={align === 'start' ? undefined : align}
      data-grow={grow || undefined}
      class={extraClass}
    >
      <button type="button" class="b-table-sort" onClick={() => sort.toggle(column)}>
        <span>{children}</span>
        {/* An arrow up: ascending. Rotated by the CSS when descending. */}
        <svg class="b-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </button>
    </th>
  );
}

/* ----- Selection ----- */

type RowCheckbox = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onClick: (event: MouseEvent) => void;
};
type AllCheckbox = {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
};
type RowProps = {
  'data-selected': true | undefined;
  'data-clickable': true | undefined;
  onClick: (event: MouseEvent) => void;
  onMouseDown: (event: MouseEvent) => void;
};

export type Selection<Id> = {
  /** Every selected id, shown or not. */
  selected: ReadonlySet<Id>;
  isSelected: (id: Id) => boolean;
  /** Props for a row's <Checkbox>. Shift+click sets the range from the last click. */
  checkbox: (id: Id) => RowCheckbox;
  /** Props for the "select all" <Checkbox> in the header. */
  allCheckbox: () => AllCheckbox;
  /**
   * Props for the <tr>: data-selected, and the clicks. Cmd/Ctrl+click toggles the row,
   * Shift+click selects a range, a click in the checkbox cell toggles it; a plain click
   * elsewhere calls `onOpen` (open the item, preview the file).
   */
  row: (id: Id, onOpen?: (event: MouseEvent) => void) => RowProps;
  setSelected: (ids: Iterable<Id>) => void;
  clear: () => void;
};

/** A click on one of these inside a row is the control's own, not the row's. */
const CONTROLS = 'input, button, a, select, textarea, label, [role="button"], [contenteditable]';

/**
 * `ids` are the rows on screen, in the order shown (after sorting), so a range follows what
 * the user sees. "Select all" acts on those rows only.
 */
export function useSelection<Id>(ids: readonly Id[], initial: Iterable<Id> = []): Selection<Id> {
  const [selected, setSelectedState] = useState<ReadonlySet<Id>>(() => new Set(initial));
  // The last row clicked: where a Shift+click range starts.
  const anchor = useRef<Id | null>(null);
  // Set by a checkbox click, read by the change that follows it (a change has no shiftKey).
  const shift = useRef(false);

  /** Sets one row, or the range from the anchor when `range`. The range takes the new state of
      the row clicked, so Shift+click can also clear one. */
  const set = (id: Id, on: boolean, range: boolean): void => {
    const next = new Set(selected);
    const from = anchor.current === null ? -1 : ids.indexOf(anchor.current);
    const to = ids.indexOf(id);
    const span = range && from !== -1 && to !== -1 ? ids.slice(Math.min(from, to), Math.max(from, to) + 1) : [id];
    for (const each of span) {
      if (on) next.add(each);
      else next.delete(each);
    }
    anchor.current = id;
    setSelectedState(next);
  };

  const shown = ids.filter((id) => selected.has(id)).length;

  return {
    selected,
    isSelected: (id) => selected.has(id),
    checkbox: (id) => ({
      checked: selected.has(id),
      onChange: (on) => {
        set(id, on, shift.current);
        shift.current = false;
      },
      onClick: (event) => {
        shift.current = event.shiftKey;
      },
    }),
    allCheckbox: () => ({
      checked: ids.length > 0 && shown === ids.length,
      indeterminate: shown > 0 && shown < ids.length,
      onChange: (on) => {
        const next = new Set(selected);
        for (const id of ids) {
          if (on) next.add(id);
          else next.delete(id);
        }
        setSelectedState(next);
      },
    }),
    row: (id, onOpen) => ({
      'data-selected': selected.has(id) || undefined,
      'data-clickable': onOpen ? true : undefined,
      // Keeps Shift+click from selecting the page's text.
      onMouseDown: (event) => {
        if (event.shiftKey || event.metaKey || event.ctrlKey) event.preventDefault();
      },
      onClick: (event) => {
        const target = event.target as Element;
        // The checkbox, a button: they handle their click. Not the row's open button (b-table-open):
        // it is the row, for the keyboard, so Cmd and Shift still select.
        if (target.closest(CONTROLS) && !target.closest('.b-table-open')) return;
        const inBoxCell = target.closest('[data-select]') !== null;
        if (event.metaKey || event.ctrlKey || event.shiftKey || inBoxCell) {
          set(id, !selected.has(id), event.shiftKey);
        } else {
          onOpen?.(event);
        }
      },
    }),
    setSelected: (next) => setSelectedState(new Set(next)),
    clear: () => setSelectedState(new Set()),
  };
}

/* ----- Detail rows ----- */

export type DetailOptions<Id> = {
  /** Several rows open at once. Off by default: opening a row closes the other. */
  multiple?: boolean;
  /** The rows open at first. */
  initial?: Iterable<Id>;
};

export type Detail<Id> = {
  /** Every open id. */
  open: ReadonlySet<Id>;
  isOpen: (id: Id) => boolean;
  /** Opens a closed row, closes an open one. Without `multiple`, opening closes the others. */
  toggle: (id: Id) => void;
  /** Closes every row. */
  close: () => void;
  /** Props for the row's <tr>: data-open. */
  row: (id: Id) => { 'data-open'?: true };
  /** Props for the row's open button (class="b-table-open"): the disclosure state. */
  button: (id: Id) => { type: 'button'; 'aria-expanded': boolean; 'aria-controls'?: string };
  /** Props for the detail's <tr>: data-detail and the id the button points at. */
  detail: (id: Id) => { id: string; 'data-detail': true };
};

/**
 * Rows that open a detail row under them. The open rows are kept by id, so a sort or a filter
 * keeps them open. Pair `toggle` with useSelection's `row(id, onOpen)`, or a click on the <tr>.
 */
export function useDetail<Id>({ multiple = false, initial = [] }: DetailOptions<Id> = {}): Detail<Id> {
  const [open, setOpenState] = useState<ReadonlySet<Id>>(() => {
    const first = [...initial];
    return new Set(multiple ? first : first.slice(0, 1));
  });
  // DOM ids from a counter, not from the app's ids: those may hold spaces, which aria-controls
  // would read as two ids.
  const prefix = useId();
  const numbers = useRef(new Map<Id, number>());
  const domId = (id: Id): string => {
    let n = numbers.current.get(id);
    if (n === undefined) {
      n = numbers.current.size;
      numbers.current.set(id, n);
    }
    return `${prefix}-detail-${n}`;
  };

  return {
    open,
    isOpen: (id) => open.has(id),
    toggle: (id) =>
      setOpenState((now) => {
        if (now.has(id)) {
          const next = new Set(now);
          next.delete(id);
          return next;
        }
        return multiple ? new Set(now).add(id) : new Set([id]);
      }),
    close: () => setOpenState(new Set()),
    row: (id) => ({ 'data-open': open.has(id) || undefined }),
    button: (id) => ({
      type: 'button',
      'aria-expanded': open.has(id),
      // Only while the detail is in the page: a reference to a missing id is an axe error.
      'aria-controls': open.has(id) ? domId(id) : undefined,
    }),
    detail: (id) => ({ id: domId(id), 'data-detail': true }),
  };
}
