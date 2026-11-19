# 0002. CSS-first, layered packages

- **Status:** Accepted (2026-11-19)
- **Date:** 2026-11-19

## Context

The brief asks for three layers: tokens usable by any stack, components as plain CSS classes with zero JS, and thin Preact wrappers for behaviour. Future apps may not use Preact. The Phase 3 preview tested the idea: one markup and one component stylesheet rendered every direction, and the chosen synthesis needed **no** rules beyond token values ([02-proposals.md §9](../ui-system/02-proposals.md)).

## Decision

- `@beastui/tokens`: CSS custom properties, JSON and TS constants.
- `@beastui/css`: every visual rule, driven by tokens, `data-*` attributes and ARIA state, inside BeastUI's cascade layers (`beast.reset` → `beast.utilities`).
- `@beastui/preact`: behaviour only, i.e. focus, keyboard, positioning, ARIA wiring, live regions. No visual rule lives in JS.
- Themes (`tool`, `playful`) change token values, never shapes. Game components that need new shapes go to a separate `@beastui/game` package.

## Consequences

- A server-rendered page or another framework gets the full look from the first two packages.
- The docs can show every component as plain HTML, which doubles as the CSS-only usage guide.
- Unlayered app CSS beats every layer. That is the CSS spec, so the install docs must say it.
- Some behaviour must be written twice in spirit: in Preact, and as a documented ARIA pattern for other stacks.

## Alternatives

- **A component library with styles in JS** (Chakra's CSS-in-JS runtime): rejected by the brief, and it ties the look to one framework.
- **Tailwind-based classes** (shadcn, daisyUI): it would make Tailwind a requirement for every consumer, Python-served pages included.
