# @beastui/preact

## 0.1.0

### Minor Changes

- 8ddf643: First release of the stable API.

### Patch Changes

- c8b7e25: Form controls: radio group, switch, textarea and select, all on native elements. CSS `.b-radio-group` + `.b-radio`, `.b-switch` (`role="switch"`), `textarea.b-input`, and `.b-select` (the field's frame around a `<select>`; the open list is drawn like the menu where `appearance: base-select` exists). Preact `RadioGroup`, `Switch`, `Textarea` and `Select` (the last two take a `Field`'s wiring, like `Input`).
  
  Lists breathe: `--b-gap-row` is now 1px (playful keeps 4px) between tree rows, menu items and select options. Group labels in the menu and the select are one style: light (new `--b-font-weight-light`, 300: load Inter Tight 300), `--b-color-text-label`, in capitals with a little tracking (`--b-case-label`, `--b-tracking-label`; lowercase in tool).
  
  Menu items and select options show the hand cursor like every other target (`not-allowed` when disabled).
- 1e83455: Menu and popover, on one base: `popover="auto"` (top layer, click outside and Escape for free). CSS `.b-menu` (`b-menu-item`, `-group`, `-label`, `-separator`, `data-tone="danger"`) and `.b-popover`. Preact `Menu`, `MenuItem`, `MenuGroup`, `MenuSeparator` (APG menu button keys, one highlight for pointer and keys, focus back to the button) and `Popover` (any content, non-modal, controlled with `open`/`onOpenChange`). Both take `side` and `align` (start, end, center).
  
  Tooltip, menu and popover now share the button's radius (`--b-radius-control`): core 8, tool 4, playful 20. The popover's padding is the control inset (12, playful 16).
- 200c0cf: MultiSelect: pick several values from a list. CSS `.b-listbox` (the open list: the menu's box, `.b-listbox-option` rows with a `.b-listbox-check` box drawn from `aria-selected`, `-group` and `-label` like the menu's) and `button.b-select` (the select's box on a button, the chosen labels cut as "PDF, CSV +2" with `.b-select__text`, `__value`, `__more`, `__placeholder`). Preact `MultiSelect` (`options` with optional groups, `value: T[]`, `onChange`, `placeholder`): the APG Listbox keys, the list stays open while picking, the box's name is the label then the whole value. `Field` now gives its label an id.
- b2bbf87: Skeleton: the shape of content on its way. CSS `.b-skeleton` wraps sample text (invisible, gives the size) or stands alone as one line; `data-shape="circle"` / `"block"`, `data-delay`; pulse from light to dark grey, still under reduced motion.
  
  Alert: a message that stays in the page. CSS `.b-alert` and its parts, `data-tone="danger"` / `"warning"`. Preact `Alert` (`tone`, `title`, `icon`, `actions`, `onDismiss`, `dismissLabel`).
  
  Token `color.warning-text`: the warning alert's title and icon, a yellow that keeps 4.5:1 on the warning tint.
- 2bfa8df: Tooltip: a short line that names or describes a control, on hover and keyboard focus. An ink box in the top layer (`popover="manual"`), so no overflow clips it. CSS `.b-tooltip`, Preact `Tooltip` (`content`, `mode` = description or label, `side`): hover delay with skip delay, hoverable, Escape closes the tooltip and not the modal around it, flips when there is no room.
- 4190d8b: Veil: one region of the page is busy, the rest stays usable. The content goes `inert` behind a card (title, progress, Cancel); a live region says the title only. CSS `.b-veil-region` and its parts, Preact `Veil` (`busy`, `title`, `content`, `actions`, `delay`).
- Updated dependencies [c8b7e25]
- Updated dependencies [1e83455]
- Updated dependencies [200c0cf]
- Updated dependencies [411e0c5]
- Updated dependencies [8ddf643]
- Updated dependencies [b109b0f]
- Updated dependencies [b2bbf87]
- Updated dependencies [2bfa8df]
- Updated dependencies [4190d8b]
  - @beastui/css@0.1.0

## 0.0.4

### Patch Changes

- Updated dependencies [333ee1b]
  - @beastui/css@0.0.4

## 0.0.3

### Patch Changes

- c0647f3: The modal and the drawer, on a native `<dialog>` opened with `showModal()`: inert page, Escape, focus kept inside and given back. `.b-modal` is a 400px box in the middle; `.b-modal.b-drawer` is the same on an edge (360px, `data-side="start"` for the other one), sliding in. Head, scrolling body and an optional foot. `Modal` and `Drawer` in Preact share one hook: `open` state to `showModal()`/`close()`, a click on the backdrop closes, focus back to the opener. New tokens: `--b-color-backdrop` and `--b-blur-backdrop` (2px), behind a modal; and `--b-color-veil` (a busy part of the page).
- 78eec45: The progress bar: how far a job has gone, or that one is running when its length is unknown. `.b-progress` (4px, or 2px with `data-size="thin"`) reads its state from the ARIA: no `aria-valuenow` = a segment that sways. A `Progress` in Preact sets the ARIA and the fill from `value` and `max`.
- dc21ec7: The table's detail row: a second row that opens under a row (the disclosure pattern). The row is the target, no arrow column: its name is a `.b-table-open` button for the keyboard, `data-open` marks the open row, `data-detail` the row under it (one tint for both, any height, text wraps; a selected row's edge runs down its detail). `useDetail` keeps the open rows, one at a time or several with `multiple`, and wires `aria-expanded` and `aria-controls`. `useSelection` treats a click on `.b-table-open` as the row's, so Cmd and Shift still select.
- 7e69307: The tree: nested items that fold (disclosure navigation). `.b-tree` rows with a toggle, a name and a count in the CSS; a data-driven `Tree` in Preact that keeps the open branches, or lets the app keep them. A parent is an item (chosen on click) or a group (`group: true`: the whole row folds it). The parents of the chosen item keep the hover tint (`data-trail`).
- Updated dependencies [c0647f3]
- Updated dependencies [78eec45]
- Updated dependencies [dc21ec7]
- Updated dependencies [7e69307]
  - @beastui/css@0.0.3

## 0.0.2

### Patch Changes

- 3b9d051: Field, checkbox and tag. Field: a label, a box with an optional unit, a hint and an error, wired with `aria-describedby` and `aria-invalid`; numbers have tabular figures and no spin buttons. CSS: `.b-field`, `.b-input`. Preact: `Field`, `Input`. Checkbox: a native checkbox drawn from tokens, with the mixed state. CSS: `.b-check`, `.b-checkbox`. Preact: `Checkbox`. Tag: filled, read only, neutral or warn. CSS: `.b-tag`. Tokens: `color.warning` and `color.on-warning`. Segmented control: options take the Button hover fill.
- 16ce9c7: Segmented control: pick one of 2–5 options, side by side. Native radios (one tab stop, arrow keys, form values); the picked option has no fill, one outline slides to it. CSS: `.b-seg`. Preact: `SegmentedControl`.
- 1761432: Table, and a see-through hover. Table: a native table with 36px one-line rows, a sticky header, a `data-grow` column that takes the room left and truncates (the table fits its box), right-aligned numbers, and selected rows (tint and bold edge). CSS: `.b-table`, `.b-table-sort`. Preact: `SortHeader`, `useSort` (ascending, descending, original order), `useSelection` (checkboxes with "select all", Shift+click ranges, Cmd/Ctrl+click on rows, a plain row click left to the app), `compareText`. Hover: `--b-color-hover`, a 6% ink tint that stacks over any ground; Button (secondary, quiet, danger in red) and the segmented control use it. Tokens: `color.danger` is darker in light mode and lighter in dark, so red text keeps 4.5:1 on a hovered row.
- Updated dependencies [3b9d051]
- Updated dependencies [16ce9c7]
- Updated dependencies [1761432]
  - @beastui/css@0.0.2

## 0.0.1

### Patch Changes

- 8d9abd9: First release: the tokens (three themes, light and dark), the CSS layers and base, and the Button (four variants, icon-only, disabled and pending).
- Updated dependencies [8d9abd9]
  - @beastui/css@0.0.1
