---
'@beastui/css': patch
'@beastui/preact': patch
---

MultiSelect: pick several values from a list. CSS `.b-listbox` (the open list: the menu's box, `.b-listbox-option` rows with a `.b-listbox-check` box drawn from `aria-selected`, `-group` and `-label` like the menu's) and `button.b-select` (the select's box on a button, the chosen labels cut as "PDF, CSV +2" with `.b-select__text`, `__value`, `__more`, `__placeholder`). Preact `MultiSelect` (`options` with optional groups, `value: T[]`, `onChange`, `placeholder`): the APG Listbox keys, the list stays open while picking, the box's name is the label then the whole value. `Field` now gives its label an id.
