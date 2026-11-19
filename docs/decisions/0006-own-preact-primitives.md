# 0006. Own Preact primitives, Zag as an escape hatch

- **Status:** Accepted (2026-11-19)
- **Date:** 2026-11-19

## Context

- The research (§5) found that native elements now do most of the hard work: `<dialog>` (focus trap, Escape, top layer), the Popover API, `<details>`. What remains is focus return, roving focus, keyboard models, positioning and ARIA wiring.
- Preact 11 forwards `ref` as a regular prop, which removes `forwardRef` boilerplate.
- [Zag](https://github.com/chakra-ui/zag) offers framework-agnostic state machines with a Preact adapter. But its end-to-end tests run on React only, so the Preact side is untested in its own CI.
- AD runs on phones and has a size budget.

## Decision

`@beastui/preact` is written in-house on native elements, with `preact ^11` as a peer dependency. For the few widgets where a state machine clearly pays off (combobox, date picker), BeastUI may wrap the matching Zag machine through `@zag-js/preact`, and tests that wrapper itself.

## Consequences

- Small components that pay only for what they use.
- Each behaviour follows a written ARIA pattern (APG), which the docs reuse for non-Preact consumers.
- More code to own and test: keyboard models and focus handling are BeastUI's responsibility.

## Alternatives

- **Zag for everything:** proven machines, one model. But each widget pulls in Zag's core, and the Preact adapter is its least-tested part.
- **preact/compat with a React library** (Radix, Ark): large, and the brief allows compat only if truly needed.
