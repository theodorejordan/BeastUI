# @beastui/tokens

BeastUI's design tokens: colours, type, spacing, sizes, radii, motion. One [DTCG](https://www.designtokens.org/) source, built to CSS variables and TypeScript constants.

> Early days (0.0.x): anything may change between versions.

```sh
npm install @beastui/tokens
```

## CSS variables

```css
@import '@beastui/tokens/tokens.css';
```

Every token becomes a `--b-*` variable on `:root`. Two attributes on `<html>` pick the set:

- `data-theme="core" | "tool" | "playful"`: the theme (`core` when absent);
- `data-mode="light" | "dark"`: forces a colour mode (the system setting when absent).

If you use [`@beastui/css`](https://www.npmjs.com/package/@beastui/css), import its `tokens.css` instead: same variables, inside BeastUI's cascade layers.

## In JavaScript

```js
import { PERMUTATIONS } from '@beastui/tokens';
```

`PERMUTATIONS` holds every token for each theme × mode pair. The DTCG source files ship in `src/`.

MIT
