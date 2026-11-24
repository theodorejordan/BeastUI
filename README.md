# BeastUI

A calm, outlined UI system: design tokens, plain CSS classes, and thin Preact components.

**Docs and live examples: [theodorejordan.github.io/BeastUI](https://theodorejordan.github.io/BeastUI/)**

> Early days (0.0.x): the API can still change between versions.

## Three layers

Take only what your app needs. An app that isn't written in Preact still gets most of the system from the first two.

| Package | What it is |
|---|---|
| [`@beastui/tokens`](packages/tokens) | Colours, type, spacing and lines as CSS custom properties, JSON and TypeScript constants. |
| [`@beastui/css`](packages/css) | Every component as plain CSS classes. Works with zero JavaScript. |
| [`@beastui/preact`](packages/preact) | Thin Preact components that add behaviour, keyboard support and ARIA. |

## Quick start

```sh
npm install @beastui/css
```

```js
import '@beastui/css/beastui.css';
```

```html
<button class="b-btn" data-variant="primary">Save</button>
```

With Preact:

```sh
npm install @beastui/css @beastui/preact
```

```tsx
import '@beastui/css/beastui.css';
import { Button } from '@beastui/preact';

<Button variant="primary">Save</Button>;
```

The CSS loads no fonts: the tokens name Inter Tight, Outfit and IBM Plex Mono, with system fallbacks. Load them yourself (for example with [Fontsource](https://fontsource.org)) or let the fallbacks take over.

## Themes and modes

- **Light and dark** follow the system. `data-mode="light"` or `"dark"` on `<html>` forces one.
- **Themes**: `core` by default, `data-theme="tool"` (denser, squarer, lowercase) or `data-theme="playful"` on `<html>`.

## What it promises

AA contrast in every theme and mode, a visible focus ring, everything usable from the keyboard, and respect for reduced motion. Each docs page is checked with [axe](https://github.com/dequelabs/axe-core) in every theme and mode.

## Develop

```sh
pnpm install
pnpm build          # tokens first: the CSS reads them
pnpm test           # unit tests, in a real browser
pnpm dev:docs       # the docs, locally
pnpm test:e2e       # the docs in every theme and mode, with axe (run `pnpm --filter docs build` first)
```

Changes to a package come with a changeset (`pnpm changeset`). Decisions are written down in [`docs/decisions`](docs/decisions).

## Licence

[MIT](LICENSE)
