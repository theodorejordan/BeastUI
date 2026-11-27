# @beastui/tokens

## 0.1.0

### Minor Changes

- 8ddf643: First release of the stable API.

### Patch Changes

- c8b7e25: Form controls: radio group, switch, textarea and select, all on native elements. CSS `.b-radio-group` + `.b-radio`, `.b-switch` (`role="switch"`), `textarea.b-input`, and `.b-select` (the field's frame around a `<select>`; the open list is drawn like the menu where `appearance: base-select` exists). Preact `RadioGroup`, `Switch`, `Textarea` and `Select` (the last two take a `Field`'s wiring, like `Input`).
  
  Lists breathe: `--b-gap-row` is now 1px (playful keeps 4px) between tree rows, menu items and select options. Group labels in the menu and the select are one style: light (new `--b-font-weight-light`, 300: load Inter Tight 300), `--b-color-text-label`, in capitals with a little tracking (`--b-case-label`, `--b-tracking-label`; lowercase in tool).
  
  Menu items and select options show the hand cursor like every other target (`not-allowed` when disabled).
- 411e0c5: Tree: rows take new tokens, `--b-radius-row` and `--b-gap-row`, and the chosen row's mark takes `--b-line-current` and `--b-font-weight-current`. Core and tool are unchanged: square rows, edge to edge, the bold edge on the chosen one. Playful: pills with 4px between them, like its buttons, and the chosen row's name in medium instead of the edge. The focus ring follows the row's corners.
- b109b0f: `data-theme` works on any element, not only `<html>`: one part of the page can use another theme. Each themed element declares the tokens again, so the aliases (`--b-radius-control`, `--b-color-hover`, `--b-case`…) follow its own theme. The colour mode (`data-mode`) stays on `<html>`.
- b2bbf87: Skeleton: the shape of content on its way. CSS `.b-skeleton` wraps sample text (invisible, gives the size) or stands alone as one line; `data-shape="circle"` / `"block"`, `data-delay`; pulse from light to dark grey, still under reduced motion.
  
  Alert: a message that stays in the page. CSS `.b-alert` and its parts, `data-tone="danger"` / `"warning"`. Preact `Alert` (`tone`, `title`, `icon`, `actions`, `onDismiss`, `dismissLabel`).
  
  Token `color.warning-text`: the warning alert's title and icon, a yellow that keeps 4.5:1 on the warning tint.

## 0.0.4

### Patch Changes

- cf6bb89: Playful is rounder: radius 8 / 20 / 24 (was 5 / 10 / 15), so controls are pills; the checkbox keeps a 5px corner so it never reads as a radio.

## 0.0.3

### Patch Changes

- c0647f3: The modal and the drawer, on a native `<dialog>` opened with `showModal()`: inert page, Escape, focus kept inside and given back. `.b-modal` is a 400px box in the middle; `.b-modal.b-drawer` is the same on an edge (360px, `data-side="start"` for the other one), sliding in. Head, scrolling body and an optional foot. `Modal` and `Drawer` in Preact share one hook: `open` state to `showModal()`/`close()`, a click on the backdrop closes, focus back to the opener. New tokens: `--b-color-backdrop` and `--b-blur-backdrop` (2px), behind a modal; and `--b-color-veil` (a busy part of the page).

## 0.0.2

### Patch Changes

- 3b9d051: Field, checkbox and tag. Field: a label, a box with an optional unit, a hint and an error, wired with `aria-describedby` and `aria-invalid`; numbers have tabular figures and no spin buttons. CSS: `.b-field`, `.b-input`. Preact: `Field`, `Input`. Checkbox: a native checkbox drawn from tokens, with the mixed state. CSS: `.b-check`, `.b-checkbox`. Preact: `Checkbox`. Tag: filled, read only, neutral or warn. CSS: `.b-tag`. Tokens: `color.warning` and `color.on-warning`. Segmented control: options take the Button hover fill.
- 78771d8: Font size 3 is back: `font.size.3` (16px) with `font.line-height.3` (24px), for section headings. 14px to 20px left no step between body text and a panel title.
- 1761432: Table, and a see-through hover. Table: a native table with 36px one-line rows, a sticky header, a `data-grow` column that takes the room left and truncates (the table fits its box), right-aligned numbers, and selected rows (tint and bold edge). CSS: `.b-table`, `.b-table-sort`. Preact: `SortHeader`, `useSort` (ascending, descending, original order), `useSelection` (checkboxes with "select all", Shift+click ranges, Cmd/Ctrl+click on rows, a plain row click left to the app), `compareText`. Hover: `--b-color-hover`, a 6% ink tint that stacks over any ground; Button (secondary, quiet, danger in red) and the segmented control use it. Tokens: `color.danger` is darker in light mode and lighter in dark, so red text keeps 4.5:1 on a hovered row.

## 0.0.1

### Patch Changes

- 8d9abd9: First release: the tokens (three themes, light and dark), the CSS layers and base, and the Button (four variants, icon-only, disabled and pending).
