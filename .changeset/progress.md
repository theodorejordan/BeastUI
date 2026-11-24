---
'@beastui/css': patch
'@beastui/preact': patch
---

The progress bar: how far a job has gone, or that one is running when its length is unknown. `.b-progress` (4px, or 2px with `data-size="thin"`) reads its state from the ARIA: no `aria-valuenow` = a segment that sways. A `Progress` in Preact sets the ARIA and the fill from `value` and `max`.
