---
'@beastui/css': patch
'@beastui/preact': patch
---

Menu and popover, on one base: `popover="auto"` (top layer, click outside and Escape for free). CSS `.b-menu` (`b-menu-item`, `-group`, `-label`, `-separator`, `data-tone="danger"`) and `.b-popover`. Preact `Menu`, `MenuItem`, `MenuGroup`, `MenuSeparator` (APG menu button keys, one highlight for pointer and keys, focus back to the button) and `Popover` (any content, non-modal, controlled with `open`/`onOpenChange`). Both take `side` and `align` (start, end, center).

Tooltip, menu and popover now share the button's radius (`--b-radius-control`): core 8, tool 4, playful 20. The popover's padding is the control inset (12, playful 16).
