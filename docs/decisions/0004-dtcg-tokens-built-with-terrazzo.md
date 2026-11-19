# 0004. DTCG tokens built with Terrazzo

- **Status:** Accepted (2026-11-19)
- **Date:** 2026-11-19

## Context

- The brief asks for "design tokens as CSS custom properties + JSON source".
- The audit found AD copying motion constants between TS and CSS by hand, so tokens must also reach JS.
- The [DTCG format](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) reached its first stable version (2025.10), with a resolver module for themes × modes. It is a Community Group report, not a W3C standard.
- **Terrazzo** reads 2025.10 with resolvers, and emits CSS per theme × mode and JS with types. Its JSON output is experimental. It is effectively maintained by one person.
- **Style Dictionary 5** has more maintainers but can't read resolver files yet ([issue #1590](https://github.com/style-dictionary/style-dictionary/issues/1590)).
- None of the surveyed libraries uses DTCG as its source; Open Props emits it.

## Decision

Tokens are written as **DTCG 2025.10 JSON**, with a resolver describing core, `tool`, `playful` × light, dark. **Terrazzo** builds the CSS variables and TS constants. A small BeastUI plugin writes the JSON output. The Phase 3 preview's CSS is the expected output for the first build.

## Consequences

- One source feeds CSS, JS and JSON. Motion durations defined once reach both CSS and the game's timers.
- Design tools that read DTCG can import BeastUI's tokens.
- Terrazzo's one-maintainer risk is contained: the source is a standard file, so another builder (Style Dictionary once it supports resolvers, or a script) can replace Terrazzo without touching the tokens.
- No precedent in the surveyed libraries, so the first Phase 5 slice proves the pipeline end to end before anything is built on it.

## Alternatives

- **Hand-written CSS as the source** (Radix Themes, daisyUI): simple, but it gives up the JSON source and makes every extra output a custom script.
- **Style Dictionary 5:** larger project, but no resolver support yet.
- **TypeScript as the source** (Mantine, Chakra): readable only by JS tooling.
