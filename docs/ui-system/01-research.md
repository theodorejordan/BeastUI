# 01 — Research

Phase 2 of the [brief](BRIEF.md). It studies systems and products with a strong identity and good ergonomics, and extracts what BeastUI should steal and avoid. It answers the open questions of the [audit](00-audit.md) §13. It sets constraints for Phase 3 but makes no design choice; that is Phase 3's job.

Status: **complete**, pending the owner's review.

## 1. TL;DR

- **Nobody's default control border reaches 3:1, and that is fine for buttons but not for fields.** Geist ≈1.2:1, Linear ≈1.2:1, Radix ≈1.5:1 in light mode. WCAG does not require a border when text identifies a control. It does require 3:1 for the indicator of a text input or a checkbox.
  - **BeastUI can keep the thin 30% line** for dividers, cards and text buttons.
  - It needs an **interactive border at about ink 56%** (3.55–3.81:1 on all current surfaces) only where the line *is* the identifier.
  - That resolves the audit's central tension without making the look heavy.
- **Selection needs a second cue.** WCAG says a background change inside a component "would not pass" Use of Color. Felt (1.14–1.24:1) stays as a tint, plus an ink edge, a mark or a weight change.
- **Theming: one block per theme with `light-dark()`, mode via `color-scheme`, scoped by data attributes, inside cascade layers.**
  - This makes theme and mode independent axes, previewable on any element.
  - `@layer` designs out the AD import-order bug.
  - Cost: Safari 17.5+ (≈92% of users) and a few scoping rules.
- **Native-first behaviour is ready for most of v0.1.**
  - `<dialog>`, `inert` and `:user-invalid` are Baseline *widely available*.
  - Invoker commands, the `popover` attribute and anchor positioning are *newly available*.
  - The Preact layer is then a handful of shared behaviours: roving focus, typeahead, focus guard, toast queue, tooltip delays, positioning fallback.
  - Wrapping a headless engine (Zag) would cost about **46 KB gz for five components**, against an estimated 1–2 KB per behaviour if we build our own.
- **Motion: one small scale (0–400 ms), enter decelerates, exit is shorter, nothing animates on keyboard actions.** Reduced motion swaps movement for fades rather than switching everything off. Tokens come from one DTCG JSON source that generates CSS and TS, which ends AD's hand-copied durations.
- **Playful layer: a "novelty budget".** A short list of invariants (type roles, one stroke, radius scale, paper and ink, targets, motion grammar, state signals) never changes. The playful layer spends its budget on accents, data fills, display size, motion intensity and rationed delight.
- **Docs site: plain Astro + MDX + Preact islands + Pagefind, with the docs chrome built from BeastUI itself.**
  - Page anatomy borrows from daisyUI (class-name tables), Radix and Ark (fixed order, data-attribute and CSS-variable tables) and shadcn (install tabs).
  - **None of the studied sites shows bundle size**: showing it is our differentiator.
  - nuda.studio's feel comes from three type voices, one accent, one easing curve and lists as numbered indexes. All of that is transferable.

## 2. Method

- Five research passes in parallel, one per topic, on 2026-11-18:
  - outlines and colour
  - theming architecture
  - native-first behaviour
  - identity, motion and playful
  - docs sites
- Sources are official docs, shipped CSS and source code wherever possible. Several figures come from files fetched on that date rather than from documentation; this is said where it matters.
- **Contrast ratios** are computed with the WCAG 2 relative-luminance formula. Alpha colours are blended onto their ground in sRGB, the way browsers composite them, and OKLCH values are converted to sRGB first.
- **Browser support** comes from the web-features dataset 3.46.0 (2026-11-12), which feeds [webstatus.dev](https://webstatus.dev) and MDN's Baseline banners.
- **Bundle sizes** are esbuild builds (minified, gzip -9, tree-shaken, Preact external) unless marked as bundlephobia.
- Anything not verified is marked **[unverified]**.

## 3. Outlines and contrast (audit §13.1)

**What WCAG actually asks.** From [Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html):
- 3:1 for "visual information required to identify user interface components and states".
- "This success criterion does not require that controls have a visual boundary… If a control has visible content (such as text or a sufficiently contrasting icon)… a border is not required."
- "Where a text-input has a visual indicator to show it is an input… that indicator must meet 3:1."
- Hover treatments that are additional "do not themselves need to contrast 3:1".
- A selected state shown only by a background change "would not pass" [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

**What good systems ship** (ratios computed from their published or served values):

| System | Default control border | Ratio (light) | Ratio (dark) | Focus |
|---|---|---|---|---|
| Radix Colors / Themes | step 7 (`gray-a7` inset) | 1.53 (1.57 for Themes inputs) | 2.06 | 2px `focus-8` outline |
| Vercel Geist | `gray-alpha-400` | 1.19 | 1.43 | 2px ground gap + 2px blue ring |
| Linear (marketing CSS) | `--color-border-primary` | 1.22 | 1.30 | 2px, offset 2px |
| Tailwind v4 | `currentColor` (changed from gray-200) | = text | = text | 1px `currentColor` |
| Stripe | `keyline` token, no values published | **[unverified]** | | |

- In Radix light mode no border step reaches 3:1. Step 9 (the solid fill) is the first at 3.24.
- Radix guarantees text contrast (in APCA) but makes no promise for borders ([scale docs](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)).
- **Field and checkbox borders at 1.2–1.6:1 fail the letter of 1.4.11.** That is a fashionable failure, not a model.

**The useful idea: contrast by rule, not by eye.**
- **Stripe** builds its palette on perceptual lightness levels. "Five levels apart" guarantees text contrast, and "four levels" guarantees icons and large text ([blog](https://stripe.com/blog/accessible-color-systems)).
- **Linear** generates each theme from three inputs (base, accent, contrast) in LCH instead of 98 hand-set variables ([redesign](https://linear.app/now/how-we-redesigned-the-linear-ui)).
- BeastUI should pick its border level by such a rule, and check it in CI.

**Proposed starting values** (for Phase 3 to refine):

| Token role | Light value | On AD ground | On Masterz ground | On felt |
|---|---|---|---|---|
| decorative border | ink 30% | 1.87 | 1.84 | — |
| interactive border | ink 56% (or solid `#78746d`) | **3.66** | **3.55** | **3.81** |
| focus | 2px ink outline, offset 2px | 13.06 | 11.97 | 14.84 |
| selected | felt + full-ink edge + a non-colour mark | — | — | 14.84 |

- **Why 56% and not 50%.** Ink at 50% gives only 3.02 on the Masterz ground, which leaves no margin.
- **Where the interactive border goes.** Text inputs, checkboxes, radios, switch tracks, the outer edge of segmented controls, and unlabelled icon buttons. Text buttons, cards, table rules and dividers keep the faint line.
- **Focus.** A 2px ink outline offset from the control sits on the ground, so it works on ink-filled buttons too. It reaches the AAA [2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) target almost for free. Keep a two-colour variant ([technique C40](https://www.w3.org/WAI/WCAG22/Techniques/css/C40)) for the game table and images. Note that **2.4.11** in final WCAG 2.2 is *Focus Not Obscured*, not Focus Appearance.
- **Dark sketch: a warm dark, not a grey one.**
  - Ground `oklch(0.21 0.008 80)` (#1a1814), raised `#26241f`, text `#ece7de`: text is 14.42:1 on the ground.
  - Interactive border: text at 45%, which gives 3.88 on the ground and 3.72 on felt.
  - Chroma is a little lower than in light mode, because saturated greys clash in dark mode ([Radix](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette)).
- **Alpha borders change contrast on every surface.** They adapt to AD's four grounds, so CI must check `border-strong` ≥3:1 on every surface in every theme.

**APCA.** Report APCA Lc as information only. WCAG 2.x is still the normative test, and WCAG 3's contrast method is not settled ([secondary source](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html); the W3C draft wording is **[unverified]**).

## 4. Theming and tokens (audit §13.2)

**How others build their axes**

| System | Axes | Mechanism | Layers |
|---|---|---|---|
| [Radix Themes](https://www.radix-ui.com/themes/docs/components/theme) 3.3 | appearance, accent, gray, radius, scaling, panel background | a data attribute per axis sets one or two variables; derived tokens are redeclared on every themed element | none (`:where()`) |
| [daisyUI](https://daisyui.com/docs/themes/) 5.8 | one theme = colours + shape/personality knobs (`--radius-field`, `--border`, `--depth`, `--noise`) | `data-theme` on any element, nestable; each theme sets `color-scheme` | nested `@layer` |
| [shadcn/ui](https://ui.shadcn.com/docs/theming) | flat role pairs (`--primary` / `--primary-foreground`) | `:root` + `.dark` redeclare; bridged to Tailwind with `@theme inline` | Tailwind's |
| [Tailwind v4](https://tailwindcss.com/docs/theme) 4.3 | palette + theme variables | `@theme`, `@custom-variant dark` | `theme, base, components, utilities` |
| [Panda](https://panda-css.com/docs/theming/tokens) / Park UI | `tokens` vs `semanticTokens` with `_dark` conditions | generated CSS variables | `reset, base, tokens, recipes, utilities` |
| [Geist](https://vercel.com/geist/colors) | 10-step scales where the step encodes the job (100–300 backgrounds, 400–600 borders, 900–1000 text) | **[unverified]** | — |
| [Open Props](https://open-props.style/) / [Pico](https://picocss.com/docs/color-schemes) | numbered primitives + semantic aliases | `:where(html)`, `prefers-color-scheme`, `[data-theme]` | none |

**Light and dark**
- [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) has been Baseline since May 2024 (91.6% on [caniuse](https://caniuse.com/mdn-css_types_color_light-dark)). It needs `color-scheme`.
- [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) is inherited and also switches form controls and scrollbars.
- Systems either duplicate a variable block per mode (Radix, shadcn, daisyUI, Pico) or write one block with `light-dark()` values.
- A three-state control (system / light / dark) needs an inline script before first paint ([Tailwind's pattern](https://tailwindcss.com/docs/dark-mode)), or a cookie for server-rendered HTML.

**Scoping pitfalls to design around**
1. **Derived tokens freeze where they are declared.** `--radius-2: calc(var(--radius-factor) * …)` on `:root` is computed once, and a nested override of `--radius-factor` does nothing. Radix's fix is to redeclare derived tokens on every themed element.
2. **`color` and `background` inherit as resolved values.** A nested scope that only changes variables must re-set them ([Chrome guide](https://developer.chrome.com/docs/modern-web-guidance/guides/ui-atoms/component-specific-light-dark-theme), [Pico](https://picocss.com/docs/color-schemes)).
3. **Never register colour tokens with `@property … <color>`.** It resolves `light-dark()` too early and breaks nested schemes; browser bugs and a CSSWG issue are open.
4. **`.dark *` descendant selectors ignore the nearest scope.** They still match inside a nested `.light` element. Set variables on the attributed element and let inheritance decide.

**Cascade layers**
- Support is 97% ([caniuse](https://caniuse.com/css-cascade-layers)). Tailwind v4, Panda and daisyUI 5 use them.
- The first `@layer` statement fixes the order whatever the import order. That designs out the AD cascade bug (audit bug 1).
- **The risk is unlayered CSS.** Unlayered CSS beats any layered CSS ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer), [Panda](https://panda-css.com/docs/concepts/cascade-layers)). One `button { all: unset }` in an app would silently override BeastUI, so apps must be told the convention.

**Token source**
- The [DTCG format](https://www.designtokens.org/tr/2025.10/) reached its first stable version (2025.10) on 2025-10-28. It is a Community Group report, not a W3C Standard.
  - It has `duration` and `cubicBezier` types and `{group.token}` aliases.
  - A [resolver module](https://www.designtokens.org/tr/2025.10/resolver/) covers theme × mode.
- Builders:
  - [Terrazzo](https://terrazzo.app/docs/) claims full DTCG support including resolvers.
  - [Style Dictionary 5](https://styledictionary.com/info/dtcg/) still lists 2025.10 support as work in progress.
- Either can output CSS variables, JSON and TS constants. That answers the audit's "motion tokens must be readable from both CSS and JS".

**Density.** Radix uses one multiplier (`--scaling`) that space, radius and type sizes multiply. A `data-density="compact|touch"` attribute with derived `--control-h-*` and `--space-*` would replace AD's ~120 `.phone` descendant selectors. Container queries handle component-level adaptation.

**Two candidate architectures for Phase 4**

| | A. `light-dark()` per theme (favoured) | B. Generated duplicate blocks |
|---|---|---|
| Mode | `color-scheme` on `:root` (system) or `[data-mode]` (override, any element) | `:root` light, `@media (prefers-color-scheme: dark) :root:not([data-mode=light])` + `[data-mode=dark]` dark, per theme |
| Nesting | resolves through inheritance | needs careful selectors |
| CSS size | themes × 1 | themes × modes × 2 |
| Support | Safari 17.5+ | everywhere |
| Caveats | non-colour values (shadow strength, images) need another path; spec semantics still moving | more output, more selectors to test |

**Layer order sketch:** `@layer beast.reset, beast.tokens, beast.themes, beast.base, beast.components, beast.playful, beast.utilities;`. App CSS goes in a later `@layer app` or stays unlayered on purpose.

**Naming sketch.** Role-based names, game names only as theme values (audit §10.2):
- **Primitives:** `--ink-0…12`, `--paper-*`, `--red-*`.
- **Roles:** `--surface`, `--surface-raised`, `--text`, `--text-muted`, `--border-subtle`, `--border`, `--border-strong`, `--focus-ring`, `--accent` / `--accent-text`, `--danger`.
- **Theme knobs:** `--radius-factor`, `--font-ui`, `--font-display`, `--motion-scale`, `--density`.
- **Component-local variables:** `--button-bg`.
- Themes and derived tokens are declared on `:where(:root, [data-theme], [data-mode], [data-density])`, at zero specificity.

## 5. Native-first behaviour (audit §13.3)

**Support on 2026-11-18** (web-features 3.46.0; "newly" means Baseline newly available)

| Feature | Status | What it gives / what to watch |
|---|---|---|
| [`<dialog>` + `showModal()`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) | **widely** | Gives top layer, inert background, Escape and `::backdrop`. **No scroll lock**: use `overscroll-behavior: contain`, not `html { overflow: hidden }` ([Chrome guide](https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/prevent-page-scroll-under-modal-dialog)). Native focus restore still has Safari fixes in flight. |
| `closedby` (light dismiss for dialogs) | not Baseline | Chrome, Firefox; Safari in beta. Polyfill 1.75 KB, or a backdrop form. |
| [`popover`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover) | attribute widely; full feature newly | Gives light dismiss and Escape. No focus trap and no positioning. Never use it as a modal. |
| `popover="hint"`, [`interestfor`](https://developer.chrome.com/blog/new-in-chrome-142) | not Baseline | Hint falls back to `manual`. Interest invokers ship in Chrome only, and WebKit has raised concerns. |
| [Invoker commands](https://developer.chrome.com/blog/command-and-commandfor) (`commandfor`) | **newly** (2025-12) | Opens and closes dialogs and popovers with zero JS. Polyfill 1.96 KB for older Safari. |
| [Anchor positioning](https://webstatus.dev/features/anchor-positioning) | core newly (2026-01) | Chrome 125, Firefox 147, Safari 26. iOS ≤18 phones have none, so gate it with `@supports`. |
| Customizable `<select>` (`base-select`) | not Baseline | Firefox only behind a preference. Falls back to the native select. |
| `<details name>` | newly | Exclusive accordions. Height animation needs `interpolate-size`, which is Chrome only. |
| `inert`, `:user-invalid` | **widely** | Veil, form validation. |
| `@starting-style`, `allow-discrete` | newly | The `overlay` property is Chrome only, so exit animations from the top layer are an enhancement. |
| View Transitions (same document), scroll-driven animations, `field-sizing` | newly | |
| `ariaNotify()` | newly (2026-09) | A candidate for announcing toasts. |
| `focusgroup` | Chrome only | Not usable for roving focus yet ([tests](https://adrianroselli.com/2026/07/focusgroup-tests.html)). |

**What still needs JavaScript** (per the [ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)):
- **Roving focus and arrow keys:** tabs, menus, tree, toolbar.
- **Menus:** typeahead.
- **Combobox:** the whole pattern.
- **Toasts:** a queue and timers that pause on hover and focus ([WCAG 2.2.1](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)).
- **Tooltips:** delays and hoverable behaviour until `interestfor` ships ([WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)).
- **Focus restore** when the trigger has been unmounted.

**Free with HTML:**
- **Segmented control:** a native radio group gets arrow keys from the browser ([APG radio](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)). Today's `aria-pressed` buttons don't.
- **Interactive content near a trigger:** a non-modal dialog (toggletip), never `role=tooltip`.

**Headless libraries vs our own primitives**

| Option | For | Against |
|---|---|---|
| **A. Own thin primitives on native features** | One model from HTML to Preact; non-Preact apps get most behaviour; smallest bundles (about 1–2 KB gz per shared behaviour **[estimate]**) | We own APG correctness and its tests; combobox and date picker are real work |
| B. Wrap [Zag.js](https://github.com/chakra-ui/zag) through its official `@zag-js/preact` adapter | Mature state machines, wide coverage | **≈46 KB gz** for dialog, tabs, tooltip, menu and popover, about 70% of AD's whole bundle. It does not use `<dialog>` or `popover` (no `showModal` in its shipped code), so it re-implements what the platform now gives. The CSS layer would have to style its markup. |
| React headless libraries through preact/compat (Radix, React Aria, Headless UI) | Popular | Known compat bugs ([preact#3805](https://github.com/preactjs/preact/issues/3805), [react-spectrum#10755](https://github.com/adobe/react-spectrum/issues/10755) on Preact 11). **Ruled out.** |

- **Hybrid escape hatch:** A by default, then lazy-load a Zag machine for combobox or date picker only if they become necessary (≈29 KB gz each).
- **Positioning fallback:** `@floating-ui/dom` (6.4 KB gz), lazily imported only when anchor positioning is missing. The OddBird anchor polyfill is ruled out: 36 KB gz, and no dynamic anchors.

**Native systems for reference**
- [daisyUI](https://daisyui.com/components/modal/) uses `<dialog>`, closes on outside click with a backdrop `<form method=dialog>`, and offers a popover + anchor dropdown.
- [Pico](https://picocss.com/docs/modal) uses `<dialog>` but leaves the JS to the app.
- [Web Awesome](https://webawesome.com/docs/components/dialog/) wraps `<dialog>` and adds `light-dismiss`.
- [Oat](https://oat.ink/) turns `title` into a shared tooltip and polyfills `commandfor`.
- [Basecoat](https://basecoatui.com/components/dropdown-menu/) is the shadcn look in plain CSS with small vanilla scripts, the closest in spirit to our CSS layer.

**Per-component sketch for v0.1** (from audit §11)

| Component | Native base | Preact adds | Without the newest features |
|---|---|---|---|
| Button, icon button, input, number field, checkbox, select, tag, divider, kbd, spinner | plain elements | — | — |
| Segmented control | radio inputs | — | — |
| Drawer | `<dialog>`, `commandfor`, `closedby` | focus restore edge cases, scroll containment | backdrop form, `commandfor` polyfill |
| Popover | `popover=auto`, anchor positioning | return focus, positioning fallback | static placement under `@supports` |
| Tooltip | `popover=hint`, anchor | delays, Escape, hoverable | JS triggers |
| Progress | `<progress>`, `role=progressbar` | — | — |
| Table | `<table>` | sorting (app) | — |
| Veil | `inert` | toggle and announce once | — |

## 6. Identity, motion and the playful layer (audit §13.5)

**What carries identity in strong products**
- **Linear.** A few generative inputs, and hierarchy by dimming rather than by more lines. Its 2026 refresh made separators "felt rather than seen" and warmed the grey, noting that too warm turns muddy ([refresh](https://linear.app/now/behind-the-latest-design-refresh)).
- **Raycast.** Icon stroke equals UI stroke ([blog](https://www.raycast.com/blog/a-fresh-look-and-feel)). For an outlined system this is the cheapest way to look unified.
- **Arc and Dia.** "Every product has a novelty budget": the basics stay familiar, and expressiveness is spent in one place ([Browser Co.](https://browsercompany.substack.com/p/the-strategy-behind-dias-design)).
- **Family.** Delight is rationed by frequency: the rarer the action, the more delight it may carry. Confetti on backup, never on send ([Benji Taylor](https://benji.org/family-values)).
- **Rauno Freiberg and Emil Kowalski.** Removing motion from core interactions makes an app feel faster. Never animate keyboard-initiated actions, and keep UI motion under 300 ms ([Rauno](https://rauno.me/craft/interaction-design), [Emil](https://emilkowal.ski/ui/you-dont-need-animations)).
- **Figma's brand refresh.** "Identities should be thought of as languages, not systems." Constant typefaces and one signature colour, with flexible palettes and states around them ([Figma](https://www.figma.com/blog/figma-on-figma-evolving-our-visual-language/)).
- **Duolingo.** One hard shape rule across everything ("pointy shapes are off-brand") ([Duolingo](https://design.duolingo.com/illustration)).
- **nuda.studio.** See §8.

**Motion scales compared**

| Source | Durations | Easing |
|---|---|---|
| [Material 3](https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-motion.scss) | 50–200, 250–400, 450–600, 700–1000 ms | standard `(0.2,0,0,1)`, decelerate `(0.05,0.7,0.1,1)`, accelerate `(0.3,0,0.8,0.15)` |
| [Carbon](https://carbondesignsystem.com/elements/motion/overview/) | 70, 110, 150, 240, 400, 700 ms | productive vs expressive, entrance vs exit |
| [Fluent](https://learn.microsoft.com/en-us/windows/apps/design/motion/timing-and-easing) | 83, 167, 250 ms | enter `(0,0,0,1)`, exit `(1,0,1,1)` |
| [Emil Kowalski](https://emilkowal.ski/ui/7-practical-animation-tips) | under 300 ms | ease-out; press scale 0.97; never scale from 0 |
| nuda.studio | 420, 900, 1100 ms | one curve `(.2,.75,.15,1)` everywhere |

**Rules that converge across these sources**
- Enter decelerates and exit is shorter.
- Motion starts from its origin (`transform-origin`).
- Transitions, not keyframes, for anything that can be interrupted, because keyframes can't be retargeted ([Sonner](https://emilkowal.ski/ui/building-a-toast-component)).
- **Springs.** Bounce at most 0.3–0.4 ([Apple WWDC23](https://developer.apple.com/videos/play/wwdc2023/10158/)). CSS `linear()` approximates springs in all engines ([Chrome](https://developer.chrome.com/docs/css-ui/css-linear-easing-function)).
- **Reduced motion: reduce, don't remove.** Swap movement for fades, tighten springs, and avoid depth and blur ([Apple HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility)). Fades and colour changes are usually safe ([Val Head](https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities)). Avoid `animation: none !important`, which can break `animationend` handlers ([web.dev](https://web.dev/articles/prefers-reduced-motion)).

**Motion token sketch** (to be decided in Phase 3/4)

| Token | Value | Use |
|---|---|---|
| `dur-0` | 0 ms | keyboard and very frequent actions |
| `dur-1` | 100 ms | press, hover, colour |
| `dur-2` | 160 ms | tooltip, menu, popover |
| `dur-3` | 240 ms | drawer, toast, dialog |
| `dur-4` | 400 ms | large expansion |
| exits | ≈0.7 × enter | |
| easings | move `(0.2,0,0,1)`, enter `(0.05,0.7,0.1,1)`, exit `(0.3,0,0.8,0.15)`, linear for progress and playheads | |
| playful | `--motion-scale` 1.5, extra 600 and 1000 ms for rewards, a `linear()` spring with bounce ≈0.25 | |
| reduced | transforms become opacity at `dur-1`, springs become `move`, loops pause | |

**Candidate invariants of the family** (an inference from the examples above; Phase 3 confirms):
1. Type roles: one UI face, one display face, one type scale.
2. One stroke weight for borders *and* icons. No shadows: elevation comes from line and a ground shift. This contradicts AD's modal shadow (audit §14).
3. One radius scale. The playful layer may pick from it but never adds to it.
4. Paper and ink in every theme; only accents swap.
5. A spacing grid and target floor: 44 px on touch, 24 px minimum anywhere.
6. The motion grammar above.
7. State signals (focus ring, second selection cue) identical in every theme.

**What the playful layer may change.** Accent count and saturation. Fills, but on data only (health, energy, meters), never on chrome. Display size and weight. Motion intensity. Delight moments rationed by frequency: a win, a rank-up and a reward get them, playing a card stays short. Sound and haptics.

**Game HUD lessons**
- **Telegraph with exact numbers.** Slay the Spire's intent icons show exact damage ([guide](https://sts2.untapped.gg/guides/how-to-read-enemy-intent)). A readable, honest cue beats a showy one, and fits AD's turn and damage display.
- **Layer the feedback.** "Juice" is feedback layered on top of unchanged mechanics ([GDC 2012](https://gdcvault.com/play/1016487/contactUs)).
- **Turn timers.** A turn timer shared by all players falls under WCAG 2.2.1's real-time exception.
- **Whose turn.** Never show it by outline colour alone; the audit measured that cue failing.

**Audio and transcript lessons**
- **Keyboard model for players.** Space or K to play and pause, J/L for ±10 s, arrows for ±5 s, 0–9 to jump ([YouTube](https://support.google.com/youtube/answer/7631406?hl=en)). The seek bar follows [APG's seek slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-seek/) with `aria-valuetext` such as "4 minutes, 3 seconds". This covers Masterz's missing keyboard path (audit §7).
- **LoudnessLine labels.** Name the three EBU readings exactly: momentary 400 ms, short-term 3 s, integrated ([EBU Tech 3341](https://tech.ebu.ch/docs/tech/tech3341.pdf)).
- **Transcript viewer** ([Descript](https://help.descript.com/script-editing/speaker-labels.md)):
  - the text cursor is separate from the playhead;
  - speakers are reassigned on a selection;
  - detected voices are named after upload, exactly Transcribz's naming step.

## 7. States

From [Carbon empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/), [Atlassian](https://atlassian.design/foundations/content/designing-messages/empty-state), [NN/g progress indicators](https://www.nngroup.com/articles/progress-indicators/), [NN/g skeletons](https://www.nngroup.com/articles/skeleton-screens/), [Carbon loading](https://carbondesignsystem.com/patterns/loading-pattern/) and [MDN live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions).

A checklist every data component's docs page fills in:
- [ ] **Empty**
  - First use, no results and cleared each get a title, the next step and a verb button.
  - Images are `aria-hidden`.
  - Don't repeat the title in the body.
- [ ] **Loading**
  - Nothing under 1 s.
  - From 2 to 10 s, an indicator plus a label.
  - Skeletons only for a first full-page load, never on dialogs, menus or uploads.
- [ ] **Long jobs (over 10 s)**
  - Staged progress, each stage marked determinate or not, with elapsed time or an estimate.
  - A Cancel action.
  - A notification when done.
  - This is the veil in Masterz and Transcribz's run screen.
- [ ] **Error**
  - Plain language, no codes.
  - A retry action.
  - The user's input is kept.
- [ ] **Live regions**
  - Present in the initial markup.
  - `status` (polite) for stage changes, `alert` for failures.
  - Announce thresholds, not every second (audit §7: the Masterz veil re-announces every second).
- [ ] **Reduced-motion behaviour** documented.
- [ ] **Disabled controls** fade as a whole (`--b-opacity-disabled`), and lose hover and press. The owner chose this in Phase 5 (2026-11-20) over a greyed fill and a dashed outline; it replaces "never relies on opacity alone". WCAG 1.4.3 exempts inactive controls from contrast.
- [ ] **Selected and current** (a row, the current transcript line, the active player) carry a cue that is not colour alone.

## 8. The docs site (audit §13.4)

**nuda.studio, read from its source rather than from screenshots**
- **Three type voices with one job each.**
  - A huge tight display face (`clamp(46px, 9.6vw, 168px)`, line-height 0.86, tracking -0.05em).
  - A single-weight *line* font for section titles: that is where its outlined feel comes from.
  - A 10px mono uppercase label.
  - Plain body text.
- **Colour.** Four neutrals and one hot accent, used only for hover, focus and `::selection`.
- **Line.** Pill buttons with a 1.5px ink border that fill with the accent on hover. 1px rules between sections, almost no shadows.
- **Lists as indexes.** Numbered rows (01–10) on fixed columns, separated by rules. Section heads put the title on the left and the link on the right.
- **One easing curve** reused at three durations. Headlines reveal through a mask, and text gets a highlighter sweep.
- **Reduced motion handled effect by effect.** The marquee becomes a static list, the scroll stage shrinks, and highlights render already filled.
- **Copy adapts to touch vs mouse** with `@media (hover: none)`.
- **Videos:** muted, `preload="none"`, a poster, and played by an IntersectionObserver. **No pause control was found**, and the videos are `aria-hidden` **[unverified visually]**. Both are things we must not copy.

**Transferable:** the type-voice system, a single accent token, one motion curve as a token, lists as indexes with rules, outlined pills, and a reduced-motion version of every effect.
**Not transferable:** its 320vh scroll-jacked intro, on a site people visit for reference.

**Docs sites compared**

| Site | Worth stealing |
|---|---|
| [daisyUI](https://daisyui.com/components/button/) | A **class-name table** typed by role (component, colour, style, size, modifier). One anchored section per variant. A theme switcher and a [theme generator](https://daisyui.com/theme-generator/). "Copy docs", Markdown version. Exactly the CSS layer's use case. |
| [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/dialog) | Fixed page order: Features, Anatomy, API per part with a **data-attributes table**, Examples, Accessibility with a keyboard table. |
| [Radix Themes](https://www.radix-ui.com/themes/docs/overview/getting-started) | `ThemePanel`, a live theme editor dropped into any page. |
| [Ark UI](https://ark-ui.com/docs/components/dialog) / [Park UI](https://park-ui.com/docs/components/button) | A framework switcher, and a **CSS variables** table. Park on Ark is the same split as our css on preact. |
| [shadcn/ui](https://ui.shadcn.com/docs/components/button) | Install tabs (CLI or manual × package manager), Copy and View Code on every preview. |
| [Tailwind](https://tailwindcss.com/docs/installation/using-vite) | ⌘K search, install guides per tool as numbered steps, a file-name label on every code block. |
| [Geist](https://vercel.com/geist/button) | A matrix of all types × sizes, and a closing "Best practices" section. |
| [Mantine](https://mantine.dev/core/button/) | Metadata rows at the top (source, package, docs, LLM docs), plus a live configurator. |
| [Linear changelog](https://linear.app/changelog) | Click-to-play video with a poster and explicit size, plus a keyboard shortcut for playback. |

- **Bundle size:** none of these shows per-package size. [size-limit](https://github.com/ai/size-limit) measures with Brotli, runs in CI and recommends publishing the figure. Showing it, as the brief asks, sets BeastUI apart.

**Showcase videos**
- [Tailwind's showcase](https://tailwindcss.com/showcase) uses an image plus `<video preload="none" muted playsinline>` started by JS, with no pause button. [Astro's](https://astro.build/showcase/) uses static WebP images only.
- Rules from [web.dev](https://web.dev/articles/lazy-loading-video):
  - `preload="none"` with a poster;
  - play on visibility;
  - WebM listed before MP4;
  - `playsinline` for iOS;
  - never lazy-load the LCP video (preload its poster instead).
- AV1 is only partly supported on Safari ([caniuse](https://caniuse.com/av1)), so always ship an H.264 MP4 fallback.
- **The pause control is required, not optional**, for our infinite 5–10 s loops ([WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)). Give each video an accessible name instead of hiding it.

**Tooling**

| Tool | Fit | Note |
|---|---|---|
| **[Astro](https://docs.astro.build/en/guides/integrations-guide/preact/) + MDX + Preact islands** | Best fit | Static output, live Preact where behaviour is needed, prefetch on hover, any search. Preact 11 support **[unverified]**: check before Phase 4. |
| [Starlight](https://starlight.astro.build/guides/site-search/) | Runner-up | Search (Pagefind), TOC, tabs and [Expressive Code](https://starlight.astro.build/guides/authoring-content/) built in, but its chrome has its own look to fight. |
| [Storybook 10](https://storybook.js.org/docs/get-started/frameworks/preact-vite) | Internal only | A workbench for visual regression and axe in CI. Lists Preact 8 and 10, not 11. |
| VitePress, Vocs, Fumadocs, Docusaurus, Ladle, Histoire | Ruled out | Vue- or React-only. |

- **Search:** [Pagefind](https://pagefind.app/) is self-contained. Algolia DocSearch needs an application and an external service.

**Component page template**
1. **Header.** Title and one line. Metadata rows: layers available (CSS / Preact), import, source, size (Brotli, CSS + JS), status, Copy page / Markdown.
2. **Playground.** Prop controls and a toolbar for theme, playful mode and light/dark. Code below in HTML | Preact tabs with Copy.
3. **Install and usage per layer.**
4. **Class-name table** (CSS layer).
5. **Examples.** Each variant and state in its own anchored section.
6. **Anatomy.**
7. **API.** Props, data attributes, CSS custom properties.
8. **Accessibility.** ARIA notes, a keyboard table, reduced-motion behaviour.
9. **States checklist** (§7) and best practices (do / don't).
10. **Footer.** Previous / next, Edit on GitHub, and a sticky "On this page".

**Landing page outline**
1. **Header:** Docs, Components, Showcase, GitHub, ⌘K, theme toggle.
2. **Hero:** a large wordmark, one sentence, a copyable install pill. A small live composition that reacts to the theme and playful toggles.
3. **Built with BeastUI:**
   - Every app at once, three columns that stack on phones.
   - Video loops with a poster and a pause control, poster only under reduced motion.
   - A link to the full gallery.
4. **The three layers,** with their sizes.
5. **Calm vs playful:** the same components side by side.
6. **Principles** as numbered rows.
7. **Case studies:** before / after, using the audit's screenshots as "before".
8. **Footer.**

## 9. Steal / avoid

| Steal | From | Avoid | Why |
|---|---|---|---|
| Contrast by lightness rule, checked in CI | Stripe, Linear | Field and checkbox borders under 3:1 | WCAG 1.4.11 text-input clause |
| Faint line for structure, strong line only where it identifies | WCAG 1.4.11 exemptions | Selection as tint alone | WCAG 1.4.1 |
| 2px outline + offset focus | Linear, WCAG 2.4.13 | Copying a white-ground scale onto paper | every step must be re-derived on paper |
| One data attribute per axis; derived tokens redeclared per scope | Radix Themes | Tokens declared only on `:root`; `.dark *` selectors | nested previews break |
| Theme carries shape and personality knobs | daisyUI | `@property`-registered colour tokens | breaks nested `light-dark()` |
| Ordered cascade layers | Tailwind v4, Panda | Shipping layers without telling apps about unlayered CSS | silent overrides |
| DTCG JSON → CSS + JSON + TS | DTCG, Terrazzo | Hand-copied JS↔CSS constants | audit §4 |
| `<dialog>` + `commandfor` as the zero-JS modal | platform, daisyUI | `popover` as a modal; `html { overflow: hidden }` | no focus containment; scroll jumps |
| Radio inputs for segmented controls | APG | React headless libraries through compat | open Preact 11 bugs |
| Floating UI as a lazy fallback | — | Anchor polyfill (36 KB) | dynamic anchors unsupported |
| Icon stroke = UI stroke | Raycast | Animating keyboard actions | feels slower |
| Novelty budget, delight by frequency | Arc/Dia, Family | Spring bounce > 0.4; scaling from 0 | |
| Exact-number telegraphs | Slay the Spire | Turn shown by outline colour alone | measured failing |
| Class-name tables, data-attribute and CSS-variable tables | daisyUI, Radix, Ark | Scroll-jacking on docs routes | |
| Published bundle size | size-limit | Auto-playing video without pause | WCAG 2.2.2 |

## 10. What this means for Phase 3

**Constraints every direction must meet**

*Colour and states*
1. Its outline language uses two weights or opacities: a faint structural line and an interactive line at ≥3:1 on every surface, light and dark. Each direction must show the computed ratios.
2. Selection and the current state carry a non-colour cue.
3. Focus is a 2px offset outline at about 12:1 or better.
4. Light and dark are both designed; the dark is warm, not a generic grey.

*System*

5. Its tokens fit the role naming in §4, with theme knobs for radius, stroke, type pairing and motion scale.
6. Its components can be built on the native elements in §5, so no direction should depend on behaviour the platform can't give.
7. It names its invariants and what its playful layer may change (§6).
8. It shows how Masterz's table, drawer, progress and veil look, since v0.1 must migrate them.

**Questions for you**

1. **Keep the paper ground as an invariant?** The research supports it as an asset: Linear's warmer grey, Stripe and Linear's generated themes. But it means every scale must be built for paper rather than borrowed. My view: keep it. It is the one thing that separates BeastUI from the monochrome systems.
2. **Accept `light-dark()` and therefore Safari 17.5+?** On a phone game, older iPhones that can't update would get a broken theme rather than an old one. Option B in §4 avoids that at the cost of more CSS. I lean towards A, with the support floor stated in the docs, but it is your audience.
3. **Own primitives (A) over Zag (B) in §5?** This shapes the Preact layer's size and the work in v0.1. I recommend A with the hybrid escape hatch. Formal decision in Phase 4.
4. **Docs on plain Astro rather than Starlight?** More work up front, but the docs chrome becomes the showcase of the system. Formal decision in Phase 4.

**Owner's answers (2026-11-18)**
1. **Paper ground as an invariant: yes.** The ground's hue may change per theme (AD's Sage, Slate and Casino), but it is always a tinted ground, never pure white or flat grey. Its dark mode is a warm dark.
2. **`light-dark()` and Safari 17.5+: yes.** Option A in §4.
3. **Own primitives over Zag: yes.** Option A in §5, with the hybrid escape hatch.
4. **Plain Astro over Starlight: yes.** The docs chrome is built with BeastUI itself. To be formalised in a Phase 4 decision record.

**Visual references named by the owner for Phase 3**
- **Linear** (app UI): already covered in §3 and §6 for its generated themes and hierarchy by dimming. The owner has an account, so Phase 3 can study the app screens directly (an annotate session), not only the marketing site.
- **Front** (shared inbox): "less good, but worth looking at". Dense lists, conversation views and side panels are close to Masterz's table and Transcribz's transcript.
- **Orca** (the dev tool whose CLI the owner uses): its interface is a reference for a calm, dense developer UI.

## 11. Sources

All sources are linked inline. These are the most load-bearing:
- **WCAG:**
  - [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
  - [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
  - [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
  - [1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)
  - [2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- **Colour:**
  - [Radix Colors scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) and [source](https://github.com/radix-ui/colors)
  - [Geist colors](https://vercel.com/geist/colors)
  - [Stripe accessible colour systems](https://stripe.com/blog/accessible-color-systems)
  - [Linear redesign](https://linear.app/now/how-we-redesigned-the-linear-ui)
- **Theming:**
  - [Radix Themes](https://www.radix-ui.com/themes/docs/components/theme)
  - [daisyUI themes](https://daisyui.com/docs/themes/)
  - [Tailwind theme](https://tailwindcss.com/docs/theme)
  - [Panda cascade layers](https://panda-css.com/docs/concepts/cascade-layers)
  - [DTCG 2025.10](https://www.designtokens.org/tr/2025.10/)
  - [Terrazzo](https://terrazzo.app/docs/)
- **Platform:**
  - [webstatus.dev](https://webstatus.dev)
  - [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
  - [MDN popover](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover)
  - [Invoker commands](https://developer.chrome.com/blog/command-and-commandfor)
  - [ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
  - [Zag](https://github.com/chakra-ui/zag)
- **Motion:**
  - [Material 3 tokens](https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-motion.scss)
  - [Carbon motion](https://carbondesignsystem.com/elements/motion/overview/)
  - [Emil Kowalski](https://emilkowal.ski/ui/7-practical-animation-tips)
  - [Apple HIG accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- **Docs:**
  - [nuda.studio](https://nuda.studio/)
  - [daisyUI button](https://daisyui.com/components/button/)
  - [Radix dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
  - [shadcn button](https://ui.shadcn.com/docs/components/button)
  - [web.dev lazy video](https://web.dev/articles/lazy-loading-video)
  - [Astro Preact](https://docs.astro.build/en/guides/integrations-guide/preact/)
  - [size-limit](https://github.com/ai/size-limit)

**Unverified items:**
- Linear's in-app tokens (login required)
- Stripe's border values
- Geist's mode switching
- The W3C wording on WCAG 3 contrast
- Whether nuda.studio shows a pause control visually
- Astro's and Storybook's Preact 11 support
- The per-behaviour size estimate for own primitives
