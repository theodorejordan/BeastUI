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

- Button: `b-btn`, with `data-variant` (`primary`, `secondary`, `quiet`, `danger`) and `data-icon` for an icon-only square.

For Preact, [`@beastui/preact`](https://www.npmjs.com/package/@beastui/preact) adds the behaviour on top of these classes.

MIT
