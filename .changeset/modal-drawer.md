---
'@beastui/tokens': patch
'@beastui/css': patch
'@beastui/preact': patch
---

The modal and the drawer, on a native `<dialog>` opened with `showModal()`: inert page, Escape, focus kept inside and given back. `.b-modal` is a 400px box in the middle; `.b-modal.b-drawer` is the same on an edge (360px, `data-side="start"` for the other one), sliding in. Head, scrolling body and an optional foot. `Modal` and `Drawer` in Preact share one hook: `open` state to `showModal()`/`close()`, a click on the backdrop closes, focus back to the opener. New tokens: `--b-color-backdrop` and `--b-blur-backdrop` (2px), behind a modal; and `--b-color-veil` (a busy part of the page).
