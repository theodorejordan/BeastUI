# @beastui/preact

BeastUI for Preact: thin components that add behaviour to [`@beastui/css`](https://www.npmjs.com/package/@beastui/css). No visual rule lives in JS.

> Early days (0.0.x): anything may change between versions.

```sh
npm install @beastui/preact @beastui/css preact
```

## Use

Import the CSS once in your app (the components import none, so it never ships twice):

```css
@import '@beastui/css/beastui.css';
```

```tsx
import { Button } from '@beastui/preact';

<Button variant="primary" onClick={save}>Save</Button>
<Button pending>Saving</Button>
<Button iconOnly aria-label="Settings"><SettingsIcon /></Button>
```

- `variant`: `primary`, `secondary` (default), `quiet`, `danger`.
- `pending`: an action is running. A spinner replaces the content, same width; the button keeps the focus and refuses clicks.
- `disabled`: the action is not available at all.
- `iconOnly`: a square button. TypeScript then requires an `aria-label`.

## Components

| Export | What it adds to the CSS |
|---|---|
| `Button` | `pending` and `iconOnly`, above |
| `Checkbox` | The `indeterminate` state, which has no HTML attribute |
| `Field`, `Input`, `Textarea`, `Select` | Label, hint and error wired to the control; `Select` takes `options` and a `placeholder` |
| `MultiSelect` | Several values from a list: the select's box with "PDF, CSV +2", a listbox with check boxes (APG keys: arrows, Home/End, letters, Space), groups, Field wiring |
| `RadioGroup` | The fieldset, legend and one shared `name` from `options` |
| `Switch` | `role="switch"` on a native checkbox, controlled like `Checkbox` |
| `Progress` | The progressbar ARIA and the fill, from `value` and `max` |
| `Modal`, `Drawer` | `open` state to `showModal()`/`close()`, backdrop click, focus back to the opener |
| `Veil` | `busy` → `inert` + `aria-busy` on the region's content, a live title, focus caught and given back |
| `Tooltip` | hover delay, keyboard focus, Escape (not the modal around it), hoverable, placed and flipped in the top layer; `mode` = description or label |
| `Menu`, `MenuItem`, `MenuGroup`, `MenuSeparator` | the APG menu button keys (arrows, Home/End, letters), one highlight for pointer and keys, focus back to the button, placed and flipped in the top layer |
| `Popover` | any content in a non-modal box, placed and flipped; `open`/`onOpenChange` to close it from inside |
| `SegmentedControl` | One choice out of a few, with arrow keys |
| `SortHeader`, `useSort`, `useSelection`, `useDetail` | Sortable columns, row selection and detail rows for a `b-table` |
| `Tree` | Nested items that fold, from data |

Props and examples for each: [the docs](https://theodorejordan.github.io/BeastUI/).

MIT
