# 0005. Browser support floor: Safari 17.5

- **Status:** Accepted (2026-11-19)
- **Date:** 2026-11-19

## Context

The owner accepted `light-dark()` and therefore Safari 17.5+ in Phase 2 (research §10, answer 2). Support checked on 2026-11-19 with `web-features` 3.46.0, the data behind MDN's Baseline badges:

| Feature | Baseline | Safari |
|---|---|---|
| `light-dark()` | Newly available (2024-05) | 17.5 |
| `@layer` | Widely available | 15.4 |
| CSS nesting | Widely available | 17.2 |
| `color-mix()` | Widely available | 16.2 |
| Popover API | Newly available (2025-01) | 17 (iOS 18.3) |
| `<dialog>` | Widely available | 15.4 |
| `@starting-style` | Newly available (2024-08) | 17.5 |
| Anchor positioning (core) | Newly available (2026-01) | 26 |
| `<dialog closedby>` | Not Baseline | not supported |

## Decision

BeastUI supports **Safari 17.5+ (iOS 17.5+)** and the evergreen Chrome, Edge and Firefox of the same period. It uses `light-dark()`, layers, nesting, `color-mix()`, the Popover API, `<dialog>` and `@starting-style` directly. In v0.1 it does **not** rely on anchor positioning (Safari 26 only) or `<dialog closedby>` (no Safari). Positioning and light dismiss live in `@beastui/preact`. The floor is stated on the docs' install page.

## Consequences

- One CSS block per theme instead of one per theme × mode.
- iPhones stuck below iOS 17.5 get a broken theme rather than an old one. The owner accepted that for AD's audience.
- Anchor positioning can replace the JS positioning later, when the floor moves.

## Alternatives

- **Duplicate blocks per mode, no `light-dark()`** (research §4 option B): works everywhere, at about twice the CSS and more selectors to test.
- **Anchor positioning now:** less JS, but it would raise the floor to Safari 26.
