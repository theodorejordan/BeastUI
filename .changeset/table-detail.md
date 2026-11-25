---
'@beastui/css': patch
'@beastui/preact': patch
---

The table's detail row: a second row that opens under a row (the disclosure pattern). The row is the target, no arrow column: its name is a `.b-table-open` button for the keyboard, `data-open` marks the open row, `data-detail` the row under it (one tint for both, any height, text wraps; a selected row's edge runs down its detail). `useDetail` keeps the open rows, one at a time or several with `multiple`, and wires `aria-expanded` and `aria-controls`. `useSelection` treats a click on `.b-table-open` as the row's, so Cmd and Shift still select.
