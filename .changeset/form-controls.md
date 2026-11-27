---
'@beastui/css': patch
'@beastui/preact': patch
'@beastui/tokens': patch
---

Form controls: radio group, switch, textarea and select, all on native elements. CSS `.b-radio-group` + `.b-radio`, `.b-switch` (`role="switch"`), `textarea.b-input`, and `.b-select` (the field's frame around a `<select>`; the open list is drawn like the menu where `appearance: base-select` exists). Preact `RadioGroup`, `Switch`, `Textarea` and `Select` (the last two take a `Field`'s wiring, like `Input`).

Lists breathe: `--b-gap-row` is now 1px (playful keeps 4px) between tree rows, menu items and select options. Group labels in the menu and the select are one style: light (new `--b-font-weight-light`, 300: load Inter Tight 300), `--b-color-text-label`, in capitals with a little tracking (`--b-case-label`, `--b-tracking-label`; lowercase in tool).

Menu items and select options show the hand cursor like every other target (`not-allowed` when disabled).
