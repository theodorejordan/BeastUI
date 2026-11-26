# @beastui/css

## 0.0.4

### Patch Changes

- 333ee1b: Empty: what a region shows when it has nothing to show, or could not load it (`.b-empty`, with `data-tone="danger"` and `data-frame="dashed"`). A table row holding one has no hover and no line.

## 0.0.3

### Patch Changes

- c0647f3: The modal and the drawer, on a native `<dialog>` opened with `showModal()`: inert page, Escape, focus kept inside and given back. `.b-modal` is a 400px box in the middle; `.b-modal.b-drawer` is the same on an edge (360px, `data-side="start"` for the other one), sliding in. Head, scrolling body and an optional foot. `Modal` and `Drawer` in Preact share one hook: `open` state to `showModal()`/`close()`, a click on the backdrop closes, focus back to the opener. New tokens: `--b-color-backdrop` and `--b-blur-backdrop` (2px), behind a modal; and `--b-color-veil` (a busy part of the page).
- 78eec45: The progress bar: how far a job has gone, or that one is running when its length is unknown. `.b-progress` (4px, or 2px with `data-size="thin"`) reads its state from the ARIA: no `aria-valuenow` = a segment that sways. A `Progress` in Preact sets the ARIA and the fill from `value` and `max`.
- dc21ec7: The table's detail row: a second row that opens under a row (the disclosure pattern). The row is the target, no arrow column: its name is a `.b-table-open` button for the keyboard, `data-open` marks the open row, `data-detail` the row under it (one tint for both, any height, text wraps; a selected row's edge runs down its detail). `useDetail` keeps the open rows, one at a time or several with `multiple`, and wires `aria-expanded` and `aria-controls`. `useSelection` treats a click on `.b-table-open` as the row's, so Cmd and Shift still select.
- 7e69307: The tree: nested items that fold (disclosure navigation). `.b-tree` rows with a toggle, a name and a count in the CSS; a data-driven `Tree` in Preact that keeps the open branches, or lets the app keep them. A parent is an item (chosen on click) or a group (`group: true`: the whole row folds it). The parents of the chosen item keep the hover tint (`data-trail`).

## 0.0.2

### Patch Changes

- 3b9d051: Field, checkbox and tag. Field: a label, a box with an optional unit, a hint and an error, wired with `aria-describedby` and `aria-invalid`; numbers have tabular figures and no spin buttons. CSS: `.b-field`, `.b-input`. Preact: `Field`, `Input`. Checkbox: a native checkbox drawn from tokens, with the mixed state. CSS: `.b-check`, `.b-checkbox`. Preact: `Checkbox`. Tag: filled, read only, neutral or warn. CSS: `.b-tag`. Tokens: `color.warning` and `color.on-warning`. Segmented control: options take the Button hover fill.
- 16ce9c7: Segmented control: pick one of 2–5 options, side by side. Native radios (one tab stop, arrow keys, form values); the picked option has no fill, one outline slides to it. CSS: `.b-seg`. Preact: `SegmentedControl`.
- 1761432: Table, and a see-through hover. Table: a native table with 36px one-line rows, a sticky header, a `data-grow` column that takes the room left and truncates (the table fits its box), right-aligned numbers, and selected rows (tint and bold edge). CSS: `.b-table`, `.b-table-sort`. Preact: `SortHeader`, `useSort` (ascending, descending, original order), `useSelection` (checkboxes with "select all", Shift+click ranges, Cmd/Ctrl+click on rows, a plain row click left to the app), `compareText`. Hover: `--b-color-hover`, a 6% ink tint that stacks over any ground; Button (secondary, quiet, danger in red) and the segmented control use it. Tokens: `color.danger` is darker in light mode and lighter in dark, so red text keeps 4.5:1 on a hovered row.

## 0.0.1

### Patch Changes

- 8d9abd9: First release: the tokens (three themes, light and dark), the CSS layers and base, and the Button (four variants, icon-only, disabled and pending).
