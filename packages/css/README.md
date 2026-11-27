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

`data-theme="core" | "tool" | "playful"` and `data-mode="light" | "dark"` on `<html>` pick the theme and colour mode. `data-theme` also works on any element, so one part of the page can use another theme. The mode stays the page's.

Fonts are not bundled: load Inter Tight (300, 400, 500), Outfit (300) and IBM Plex Mono (400) the way your app prefers.

## Components

| Component | Classes |
|---|---|
| Button | `b-btn`, with `data-variant` (`primary`, `secondary`, `quiet`, `danger`) and `data-icon` for an icon-only square |
| Checkbox | `b-checkbox` on the input, `b-check` on its label |
| Field, textarea | `b-field`, `b-input` (on an `<input>` or a `<textarea>`) |
| Radio group | `<fieldset class="b-radio-group">` (`data-orientation="horizontal"`), `b-radio` on each input, `b-check` on its label |
| Switch | `b-switch` on an `<input type="checkbox" role="switch">`, `b-check` on its label |
| Select | `<span class="b-select">` around a native `<select>`; the open list is drawn like the menu where `appearance: base-select` exists |
| MultiSelect | `<button class="b-select" aria-haspopup="listbox">` (parts `b-select__text`, `__value`, `__more`, `__placeholder`) + `<div class="b-listbox" role="listbox" aria-multiselectable="true" popover="auto">`; parts `b-listbox-option` (`aria-selected`), `-check`, `-group`, `-label` |
| Progress | `b-progress` with `role="progressbar"`, `data-size="thin"` |
| Modal, drawer | `<dialog class="b-modal">`, `+ b-drawer` on an edge (`data-side="start"`); parts `b-modal-head`, `-title`, `-body`, `-foot` |
| Empty | `<div class="b-empty">`; parts `b-empty__media`, `__title`, `__description`, `__actions`; `data-tone="danger"`, `data-frame="dashed"` |
| Veil | `<div class="b-veil-region">`; parts `b-veil-content` (`inert aria-busy`), `b-veil` (`data-delay`), `-frame`, `-card`, `-title`, `-body`, `-actions`, `-status` (`role="status"`) |
| Tooltip | `<div class="b-tooltip" role="tooltip" popover="manual">`; the script sets `top`/`left` |
| Menu | `<div class="b-menu" role="menu" popover="auto">`; parts `b-menu-item` (`role="menuitem"`, `data-tone="danger"`), `-group`, `-label`, `-separator` |
| Popover | `<div class="b-popover" role="dialog" popover="auto">` |
| Segmented control | `b-seg` |
| Table | `b-table`, with `data-grow` and `data-align` on cells |
| Tag | `b-tag`, `data-variant="warn"` |
| Tree | `b-tree` |

Each component's markup and states: [the docs](https://theodorejordan.github.io/BeastUI/).

For Preact, [`@beastui/preact`](https://www.npmjs.com/package/@beastui/preact) adds the behaviour on top of these classes.

MIT
