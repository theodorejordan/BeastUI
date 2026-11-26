# @beastui/css

BeastUI's components as plain CSS classes. Zero JS, any framework, inside cascade layers so your own CSS always wins.

> Early days (0.0.x): anything may change between versions.

```sh
npm install @beastui/css
```

## Use

Everything in one file:

```css
@import '@beastui/css/beastui.css';
```

Or only what you use:

```css
@import '@beastui/css/tokens.css';
@import '@beastui/css/base.css';
@import '@beastui/css/components/button.css';
```

```html
<button class="b-btn" data-variant="primary" type="button">Save</button>
```

`data-theme="core" | "tool" | "playful"` and `data-mode="light" | "dark"` on `<html>` pick the theme and colour mode.

Fonts are not bundled: load Inter Tight, Outfit and IBM Plex Mono the way your app prefers.

## Components

| Component | Classes |
|---|---|
| Button | `b-btn`, with `data-variant` (`primary`, `secondary`, `quiet`, `danger`) and `data-icon` for an icon-only square |
| Checkbox | `b-checkbox` on the input, `b-check` on its label |
| Field | `b-field`, `b-input` |
| Progress | `b-progress` with `role="progressbar"`, `data-size="thin"` |
| Modal, drawer | `<dialog class="b-modal">`, `+ b-drawer` on an edge (`data-side="start"`); parts `b-modal-head`, `-title`, `-body`, `-foot` |
| Empty | `<div class="b-empty">`; parts `b-empty__media`, `__title`, `__description`, `__actions`; `data-tone="danger"`, `data-frame="dashed"` |
| Segmented control | `b-seg` |
| Table | `b-table`, with `data-grow` and `data-align` on cells |
| Tag | `b-tag`, `data-variant="warn"` |
| Tree | `b-tree` |

Each component's markup and states: [the docs](https://theodorejordan.github.io/BeastUI/).

For Preact, [`@beastui/preact`](https://www.npmjs.com/package/@beastui/preact) adds the behaviour on top of these classes.

MIT
