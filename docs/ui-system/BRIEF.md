# UI System — Brief

## Mission

Design and build my own UI library ("the system"): a reusable, versioned product I use across all my apps, current and future, and that I can link on my resume.

It must feel clear, stylish and abstract: simple, modern, outlined. Landing on an app built with it, or on its docs site, should feel optimal and sexy, the way https://nuda.studio/ does. Match that quality bar; do not copy the site.

The system is a product, not a components folder. It has:
- its own name and identity (propose options in Phase 3)
- its own **public repo**, independent from the apps
- a **docs site** deployed on its own URL, which is also my portfolio piece
- packages published on npm, with semver and a changelog

## The consumers

1. **Attaque Défense** (game). Preact 11, TSX, Vite 8, plain Node.js 22 server with Socket.IO, SQLite, Vitest. Played on phones, so bundle size matters.
2. **Masterz** (audio mastering tool). Python 3.14 + FastAPI backend (uv), Preact + TypeScript + Vite frontend in `web/`, served from `web/dist`. Stack rationale in `docs/DECISIONS.md`.
3. **Transcribz** (transcription CLI: Typer/Rich, mlx-whisper, sherpa-onnx). No UI yet. Propose how its UI would be served (e.g. local FastAPI + Preact like Masterz) without forcing a choice.
4. **Future apps**, possibly not in Preact. The system must stay usable from any stack.

Attaque Défense and Masterz hold the seeds of the system. Transcribz proves it works for a brand-new app.

## Architecture principle: CSS-first, layered

Unless the Phase 4 analysis shows a strong reason otherwise, the system is built in three layers:

- **`tokens`**: design tokens as CSS custom properties + JSON source. Usable by any stack, including server-rendered HTML.
- **`css`**: components as plain CSS classes that work with zero JS, in any framework.
- **`preact`**: thin Preact wrappers adding behavior and accessibility (focus traps, keyboard navigation, popover positioning, ARIA state).

A future non-Preact app must get most of the system through the first two layers alone. Challenge this in Phase 4 if you see a better option, but argue it explicitly.

## "Dense" = extensive (as a roadmap, not a starting scope)

Dense means broad coverage over time, not tight spacing. Compact/comfortable density modes are optional.

Full roadmap:
- **Tokens**: color, type, spacing, radii, borders, elevation, motion, z-index, breakpoints
- **Primitives**: button, icon button, input, textarea, select, checkbox, radio, switch, slider, tabs, tooltip, popover, dropdown menu, badge, tag, avatar, kbd, divider, skeleton, spinner
- **Composites**: forms + validation, modal, drawer, toast, table/data grid, list, tree, accordion, stepper, command palette, file dropzone, progress, empty states, error states
- **Data display**: chart-ready wrappers, stats, timelines
- **Media**: audio waveform/player controls, transcript viewer with speaker labels, timeline scrubber, level meters
- **Layout**: app shell and page patterns
- **Game**: see the playful layer below

## Releases

Ship in small, finished releases. A polished smaller system beats a large unfinished one.

- **v0.1**: tokens, ~15 core primitives, docs site live, Masterz migrated (calmest app, best first proof).
- **v0.2**: composites, playful/game theme, Attaque Défense migrated.
- **v0.3**: media components, Transcribz's first UI built purely with the system.
- **Later**: rest of the roadmap, driven by real needs from the apps.

Propose adjustments to this slicing after the audit if the repos suggest a better order.

## Customization: theming, not forking

- **Core layer** every app respects: tokens, primitives, behavior, accessibility.
- **Theme layers** that swap personality: accent palette, border treatment, radius, type pairing, motion intensity.
- **Playful layer** Attaque Défense opts into: more color, gamified UI (HUD, health/energy bars, badges, ranks, rewards, turn indicators, countdowns), richer animation, moments of delight. It must still visibly belong to the same family. Masterz and Transcribz stay calm and utilitarian with the same components.
- Propose how layers are built (CSS custom properties, data-attributes, class strategy) with tradeoffs.

## Docs site (core deliverable from v0.1)

Built with the system itself, in its own visual language. It is the showcase. Its docs pages match the bar of the best UI-library docs (Tailwind CSS, daisyUI): fast navigation and search, copyable examples, every variant shown. The landing and showcase carry the nuda.studio feel. It includes:
- live component playgrounds with theme and playful-mode toggles, light/dark switch
- **Principles** page: what the system believes in
- **Design rationale**: the research, explored directions and why the chosen one won (from Phases 2–3)
- **Case studies**: the three apps, with before/after
- **Built with BeastUI**: a gallery of snapshots of the sites and apps built with the system, growing as new apps adopt it
- install and usage docs for each layer (tokens only, CSS only, Preact)
- bundle size per package

## Quality bar

- WCAG AA contrast, visible focus, keyboard-first, respects `prefers-reduced-motion` and `prefers-color-scheme`. Light and dark from day one.
- Mobile-first: comfortable touch targets for the game.
- Restraint: line, shape and motion over heavy fills and shadows. Every animation has a purpose.
- **Automated checks in CI**: tests, accessibility (axe), visual regression, bundle-size budget.
- **Decision records** in `docs/decisions/` for every significant choice. I must be able to explain and defend each one, so write them for a human reader.
- Honest pushback: flag conflicting goals (e.g. extensive coverage vs small bundles) and propose a resolution.

## Working rules: challenge everything

Do not take what exists in the repos as granted. Give options and debate them. Work in phases and **stop at the end of each phase** for my decision. No system code before a direction is chosen.

### Phase 1 — Audit
Read all three repos. Inventory components, styles and patterns in Attaque Défense and Masterz: duplicates, divergent implementations, unique pieces, keep vs rebuild. Flag quality and accessibility problems. Confirm or challenge the release slicing. Output: `docs/ui-system/00-audit.md`.

### Phase 2 — Research
Study products and systems with strong identity and good ergonomics (Linear, Vercel/Geist, Raycast, Stripe, Arc, Radix, shadcn/ui, Ark UI, daisyUI, nuda.studio, and anything better). Also study what makes a design-system docs site great (Tailwind CSS and daisyUI docs as the bar). Extract concrete lessons on clarity, outlines, motion, empty states, theming, documentation. What to steal, what to avoid. Output: `docs/ui-system/01-research.md`.

### Phase 3 — Proposals
3–4 genuinely different directions (different visual languages, not palettes). For each: concept, token sketch, 4–5 representative components as real CSS + Preact in a scratch preview app, how it handles the playful layer, how it suits an audio tool, how the docs site would look, risks. Include one bold option. Propose 3–5 names for the system. Recommend one direction and argue against it. Output: `docs/ui-system/02-proposals.md` + preview app.

### Phase 4 — Architecture
After I choose a direction: the system's public repo layout (packages + docs site), package format, build tooling, versioning and release flow, npm publishing, how Python-backed apps consume it, headless library vs own primitives, how the CSS-first layering works in practice, docs site tooling, CI (tests, axe, visual regression, bundle budget), docs deployment. Two options, one recommendation. Constraints: Preact (preact/compat only if truly needed), TypeScript, small tree-shakeable bundles, no heavy CSS-in-JS runtime. Output: `docs/ui-system/03-architecture.md` + first decision records.

### Phase 5 — Build (per release)
For each release: tokens → CSS components → Preact wrappers → docs pages. Each component: typed props, keyboard + screen-reader support, focus states, reduced-motion handling, docs page with live example, tests. Small reviewable commits. Each release ends with a tagged version, changelog entry and deployed docs.

### Phase 6 — Adoption (per release)
Migrate the app targeted by the release, one screen at a time. Gaps found in the app flow back into the system. Capture before/after screenshots for the case studies.
