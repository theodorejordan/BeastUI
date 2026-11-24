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
| `Field`, `Input` | Label, hint and error wired to the input |
| `Progress` | The progressbar ARIA and the fill, from `value` and `max` |
| `SegmentedControl` | One choice out of a few, with arrow keys |
| `SortHeader`, `useSort`, `useSelection` | Sortable columns and row selection for a `b-table` |
| `Tree` | Nested items that fold, from data |

Props and examples for each: [the docs](https://theodorejordan.github.io/BeastUI/).

MIT
