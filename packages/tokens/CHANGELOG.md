# @beastui/tokens

## 0.0.2

### Patch Changes

- 3b9d051: Field, checkbox and tag. Field: a label, a box with an optional unit, a hint and an error, wired with `aria-describedby` and `aria-invalid`; numbers have tabular figures and no spin buttons. CSS: `.b-field`, `.b-input`. Preact: `Field`, `Input`. Checkbox: a native checkbox drawn from tokens, with the mixed state. CSS: `.b-check`, `.b-checkbox`. Preact: `Checkbox`. Tag: filled, read only, neutral or warn. CSS: `.b-tag`. Tokens: `color.warning` and `color.on-warning`. Segmented control: options take the Button hover fill.
- 78771d8: Font size 3 is back: `font.size.3` (16px) with `font.line-height.3` (24px), for section headings. 14px to 20px left no step between body text and a panel title.
- 1761432: Table, and a see-through hover. Table: a native table with 36px one-line rows, a sticky header, a `data-grow` column that takes the room left and truncates (the table fits its box), right-aligned numbers, and selected rows (tint and bold edge). CSS: `.b-table`, `.b-table-sort`. Preact: `SortHeader`, `useSort` (ascending, descending, original order), `useSelection` (checkboxes with "select all", Shift+click ranges, Cmd/Ctrl+click on rows, a plain row click left to the app), `compareText`. Hover: `--b-color-hover`, a 6% ink tint that stacks over any ground; Button (secondary, quiet, danger in red) and the segmented control use it. Tokens: `color.danger` is darker in light mode and lighter in dark, so red text keeps 4.5:1 on a hovered row.

## 0.0.1

### Patch Changes

- 8d9abd9: First release: the tokens (three themes, light and dark), the CSS layers and base, and the Button (four variants, icon-only, disabled and pending).
