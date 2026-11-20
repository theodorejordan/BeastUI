# BeastUI: foundations

**Status: proposed on 2026-11-20, to be reviewed by the owner.** Sources were read on 2026-11-20. Anything not verified is marked **[unverified]**.

## Why this document exists

The owner asked a fair question: why did uniform heights, a spacing scale and a radius hierarchy have to come from them? They are the basics of a UI system.

The answer is that Phase 3 explored **identity** (line, type, colour), and sized each component by eye. Measured on the round-2 preview, `components.css` had:

- about 190 hard-coded px values, and no spacing scale at all;
- off-grid values (5, 10, 14, 15, 18, 22, 26 px);
- nine different heights in the core (20, 26, 28, 30, 32, 36, 38, 50, 57);
- a button with an 8 px radius next to a field with a 6 px radius;
- line heights computed from a ratio (20.3 px, 17.4 px, 18.85 px), so off the grid.

The goal stated by the owner: **the eye should make no effort; everything should feel natural and flow.** This document lists the rules that produce that. Each rule says why, where it comes from, and what BeastUI's values are. Then it checks the preview against them.

## Summary: the rules

1. **One control height per density**, shared by every control. Small and large are one 8 px step away.
2. **One 4 px spacing grid.** Half steps (2, 6) only inside small controls.
3. **Proximity.** The space inside a group is smaller than the space around it, at every scale.
4. **Radius by size, nested corners computed.** Three steps plus full. An inner shape's radius = outer radius − inset.
5. **Type sizes come with their line height**, on the 4 px grid.
6. **One glyph slot (16 px)** for icons, checkboxes, radios and status glyphs, so columns line up.
7. **Three line widths**: hair, stroke, bold.
8. **Insets measured from the outer visible edge**, and held through nesting. Quiet (borderless) elements align by their glyph, not their box.
9. **Same states everywhere.** One focus ring (2 px, offset 2 px), one selected treatment per family.
10. **Targets of 24 px or more**, or the WCAG spacing exception.
11. **Widths and measure on a scale.** Running text never goes past 66 characters.
12. **Elevation and z-index on one scale.** Not done yet (see the open questions at the end).

## 1. Control sizes

**Rule.** Every control (button, field, select, segmented control, menu item) is `--control-h` tall. A small control is one `--size-step` (8 px) less, and a large one is 8 px more. An icon-only button is a square of the control height. A table row is the control height plus 4 px.

**Why.** Controls placed side by side on a line (a filter bar, a form row, a toolbar) only line up if they share a height. When they don't, the eye sees the mismatch even without naming it.

**Sources**
- Heights step by 8 px in most systems:
  - Radix: buttons 24, 32, 40, 48 and text fields 24, 32, 40 ([base-button.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/_internal/base-button.css), [text-field.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/text-field.css));
  - Carbon: 24, 32, 40, 48, shared by buttons and inputs ([button](https://carbondesignsystem.com/components/button/style/), [text input](https://carbondesignsystem.com/components/text-input/style/)).
- Primer has the same idea, with one step of 4 at the small end (24, 28, 32, 40, 48), as shared `--control-*` tokens ([size](https://primer.style/foundations/primitives/size)).
- Icon-only buttons are square in Radix ([icon-button.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/icon-button.css)) and by default in Atlassian ([icon button](https://atlassian.design/components/button/icon-button/examples)).

**BeastUI values**

| Layer | Small | Control | Large (tabs) | Row | Text inset `--pad-x` |
|---|---|---|---|---|---|
| Core | 24 | **32** | 40 | 36 | 12 |
| `tool` (Masterz, Transcribz) | 20 | **28** | 36 | 32 | 12 |
| Playful (AD) | 32 | **40** | 48 | 44 | 16 |

- `tool` matches Primer's "small" (28 px with a 12 px inset).
- The core matches Radix and Primer's "medium" (32 px).
- Playful moves from 36 to **40 px**: 36 was off the 8 px steps, and AD is played on phones. Apple asks for 44 pt touch targets ([buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)), and the 44 px row gives that.

## 2. Spacing scale

**Rule.** Every gap, padding and margin is a token from a 4 px grid. The token's number is the multiple of 4: `--sp-3` = 12 px.

| Token | `--sp-0-5` | `--sp-1` | `--sp-1-5` | `--sp-2` | `--sp-3` | `--sp-4` | `--sp-6` | `--sp-8` | `--sp-12` |
|---|---|---|---|---|---|---|---|---|---|
| px | 2 | 4 | 6 | 8 | 12 | 16 | 24 | 32 | 48 |

**Why.** A short scale forces a choice between clearly different values. Free values drift (10 here, 14 there), and the drift reads as carelessness.

**Sources**
- Every system read uses a 4 px base with 2 px half steps, roughly linear up to 24 and then wider jumps:
  - Carbon: 2, 4, 8, 12, 16, 24, 32, 40, 48… ([spacing](https://carbondesignsystem.com/elements/spacing/overview/));
  - Radix: 4, 8, 12, 16, 24, 32, 40, 48, 64 ([spacing](https://www.radix-ui.com/themes/docs/theme/spacing));
  - Atlassian: 0, 2, 4, **6**, 8, 12, 16, 20, 24, 32… ([spacing](https://atlassian.design/foundations/spacing));
  - Primer also has a 6 ([size](https://primer.style/foundations/primitives/size)).
- Atlassian's usage rule: 0–8 px for small pieces (icon-to-text gaps, table cells, input internals), 12–24 px for button padding and looser UI, 32 px and up for layout.

BeastUI keeps 6 px (Atlassian's `space.075`) for one job only: the gap between an icon and its label.

## 3. Proximity

**Rule.** Things that belong together are closer than things that don't. The ladder below doubles at each level, so groups read as groups:

| Token | Value | Between |
|---|---|---|
| `--gap-hint` | 4 | a control and its hint or error |
| `--gap-icon` | 6 | a glyph and its label |
| `--gap-field` | 8 | a label and its control |
| `--gap-choice` | 8 | a checkbox, radio or switch and its label |
| `--gap-inline` | 8 | controls side by side |
| `--gap-stack` | 16 | fields and rows inside a group |
| `--gap-group` | 24 | groups inside a panel |
| `--gap-section` | 48 | sections of a page |

**Why.** "Items close together are likely to be perceived as part of the same group." A heading must sit closer to its own section than to the previous one ([NN/g, Gestalt proximity](https://www.nngroup.com/articles/gestalt-proximity/)). Carbon adds that space can group content without dividers ([spacing](https://carbondesignsystem.com/elements/spacing/overview/)).

**What changed in the preview.** Uniform gaps were the main reason it lacked flow. The dialog, the veil and the empty state used one gap (12 or 14 px) between everything. They now have distinct groups:
- Dialog: title and text 8 px apart, actions 24 px below.
- Veil: title, then the progress group (bar, ticks, stages, file) packed at 8 px, then the footer 24 px below.
- Empty state: icon 16, title and text 8, action 24.
- Field: label 8 px above, hint 4 px below. The hint talks about the value, the label names the group.
- Page: sections 48 px apart, a section heading 12 px from its content.

## 4. Corner radius

**Rule 1: the radius grows with the element's size.**

| Token | Core | `tool` (×0.5) | Playful (×1.25) | For |
|---|---|---|---|---|
| `--r-1` | 4 | 2 | 5 | 24 px and under: checkbox, kbd, small controls, the turn badge |
| `--r-2` = `--r-control` | 8 | 4 | 10 | controls (button, field, select, menu item) |
| `--r-3` | 12 | 6 | 15 | panels: dialog, veil, empty state, stage, game table |
| full | 999 | 999 | 999 | tags only |

**Rule 2: nested corners are computed, never picked.** When a shape sits inside another with a small inset, the inner radius = outer radius − inset. One of the two shapes is the anchor (it must match its siblings elsewhere), and the other is computed:

| Component | Anchor | Computed |
|---|---|---|
| Segmented control | outside = a control, like the button next to it | inside buttons = `--r-control − --inset` |
| Menu | items = controls, like the select that opens it | menu = `--r-control + --inset` |
| Toast | its button = a control | toast = `--r-control + --inset` |
| Tooltip | its kbd = `--r-1` | tooltip = `--r-1 + --inset` |
| Switch, meter | the track | thumb or fill = track − inset − stroke |

When the inset is larger than the radius (a dialog's 24 px padding around 8 px buttons), the rule does not apply, and the panel takes `--r-3`.

**Why.** Rule 1 is what every system does. Rule 2 is the one detail whose absence the eye feels without naming. Parallel curves look like one object, and mismatched ones look like two objects pressed together.

**Sources**
- Radius by size:
  - Radix steps are 3, 4, 6, 8, 12, 16. Button sizes 1–4 use radius 1–4, and a global `--radius-factor` scales them all ([radius.css](https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/styles/tokens/radius.css), [radius docs](https://www.radix-ui.com/themes/docs/theme/radius)). BeastUI's `--radius-factor` is the same idea.
  - Atlassian maps radii to components: 2 for checkboxes, 4 for tags and tooltips, 6 for buttons and inputs, 8 for cards and dropdowns, 12 for modals ([radius](https://atlassian.design/foundations/radius)).
  - Material 3's corner scale is 0, 4, 8, 12, 16, 20, 28… ([Shape.md](https://github.com/material-components/material-components-android/blob/master/docs/theming/Shape.md)).
- The nested rule: "concentric shapes calculate their radius by subtracting padding from the parent's" ([Apple, WWDC25 session 356](https://developer.apple.com/videos/play/wwdc2025/356/)).
- The focus ring: Atlassian keeps it concentric too, at the element's radius + 2 px ([radius](https://atlassian.design/foundations/radius)). In CSS this comes free, since an outline follows `border-radius`.

**A limit worth knowing.** Concentric corners hold exactly at factor 1. In `tool` (×0.5), the segmented control's inner buttons come out at 4 − 4 = **0**: square buttons in a 4 px frame. That is the correct concentric result and suits `tool`'s squarer look, but it is visible. Say if it bothers you.

## 5. Type and line height

**Rule.** A font size never comes alone. It comes with a line height on the 4 px grid:

| Token | Size | Line height | Used for |
|---|---|---|---|
| `--fs-0` / `--lh-0` | 11 | 16 | tags, kbd |
| `--fs-1` / `--lh-1` | 12 | 16 | labels, hints, meta |
| `--fs-2` / `--lh-2` | 14 (`tool`: 13) | 20 | body, controls |
| `--fs-4` / `--lh-4` | 20 (playful: 22) | 28 | panel titles |
| `--fs-5` / `--lh-5` | 32 (playful: 40) | 40 (48) | display |

`--fs-3` (15 px) was used nowhere and is removed. Inside controls, text is set with `line-height: 1` and centred by flex, so the control's height does the work.

**Sources**
- Atlassian: every line height is a multiple of 4 (12/16, 14/20, 16/24…) ([typography](https://atlassian.design/foundations/typography)).
- Carbon's body is 14/20, but its compact sets (14/18, 16/22) are not on the grid ([type sets](https://carbondesignsystem.com/elements/typography/type-sets/)). Body text lands on 4 px almost everywhere, dense sets don't always.

**Cards (AD)** set their type as a share of the card's width (40 %, suit at 75 % of that), so a small and a large card look like the same object.

## 6. Icons and glyphs

**Rule.** One 16 px slot for every small glyph: icon, checkbox, radio, status. The status glyph is drawn 2 px smaller inside that slot, because a solid round shape looks bigger than a line icon of the same box. Empty-state icons are 32 px (2×). A leading icon in a button takes 4 px less inset than text would, because the drawing sits inside its box.

**Sources**
- 16 px icons with 14 px text, and "don't alter the icon-text size ratio" ([Carbon, icons](https://carbondesignsystem.com/elements/icons/usage/)).
- 16 px is Atlassian's default ([iconography](https://atlassian.design/foundations/iconography)).
- Icon-to-label gaps run from 4 to 8 px: Atlassian 4 ([button update](https://atlassian.design/whats-new/evolving-button-and-links)); Primer 4 for small controls and 8 from medium up ([size](https://primer.style/foundations/primitives/size)). BeastUI takes 6, the middle, and uses it everywhere.
- The −4 px for a leading icon is an optical correction, not a sourced rule **[unverified]**. Judge it on the "Charge" and "Master 3" buttons.

## 7. Lines

**Rule.** Three widths and no others: `--hair` 1 px (dividers, tags, kbd), `--stroke` 1.5 px (controls; 1 px in `tool`), `--stroke-bold` 2 px (focus ring, selected tab mark, selected row edge, check tick). The tick was 1.75 px: gone.

**Sources.** Primer has 1, 2, 4 ([size](https://primer.style/foundations/primitives/size)), and Atlassian 1 by default with 2 for selected and focused ([border](https://atlassian.design/foundations/border)). BeastUI's 1.5 px stroke is its identity line (research §6) and stays.

**Rendering note.** Chrome rounds a 1.5 px border to 1 px on a 1× screen, so there an inset lands half a pixel short. On a Retina screen it is exact.

## 8. Alignment and insets

**Rule 1: measure what the eye compares.**
- **Text in a box** is measured from the box's outer visible edge, border included. A control's padding is `--pad-x − border`, so text sits exactly 12 px (16 in playful) from the edge, whatever the border width. A box's height includes its border.
- **The empty band between two shapes** (a menu's frame and its items, a segmented control's frame and its options) is measured from the border's **inner** edge. A first version measured it from the outer edge, and the 1.5 px border ate into the band: 2.5 px visible at the bottom of the menu against 4 px around the separator. The owner saw it at once (2026-11-20). A frame's radius follows: item radius + inset + border.

**Rule 2: insets hold through nesting.** A menu opens at the select's width (`--w-menu`). Its items are controls, and the menu's own padding is taken out of theirs. Measured on the preview, in every layer:

| | Core | `tool` | Playful |
|---|---|---|---|
| Select text from edge | 11.5 | 12 | 15.5 |
| Menu item's first glyph from edge | 11.5 | 12 | 15.5 |
| Button text from edge | 11.5 | 12 | 15.5 |
| Field text from edge | 11.5 | 12 | 15.5 |

(The half pixel is the 1× rounding from §7.)

**Rule 2b: list insets, like labelcamp's `luk` dropdown (owner, 2026-11-20).** The model is `lib/luk/src/components/luk-menu.gts` in labelcamp:
- 4 px between the container's edge and its items, on all four sides;
- **1 px** between two items, so two highlighted items never merge into one block (the owner: "the pixel between the options is important");
- 4 px above and below a separator.

Measured on the preview's menu, from the border's inner edge: 4 to the first item, 1, 1, 4 above the separator, 4 below it, 4 to the bottom; 4 on each side. The items' text still starts 12 px from the menu's outer edge, like the select's.

The segmented control has 4 px around its options and 4 px between them (it had 2 px), all measured inside the border. It is a row of buttons rather than a list, so it does not take the 1 px.

**Rule 2c: a segmented control's selection is one outline that slides (owner).** No fill behind the picked option: an outline at 3:1 and full-ink text. The outline moves to the new option in `--dur-3` and stops exactly on it (measured: 0 px off). Behaviour, so it belongs to `@beastui/preact`: it measures the picked option, CSS draws and animates. Without JS, the picked option draws its own outline. With reduced motion, it jumps.

**Rule 3: quiet elements align by their glyph, bordered ones by their border.** The drawer's close button has no border, so the head's right padding is reduced until its X sits on the same line as the body's right edge. The same goes for a toast: the icon on the left and the "Undo" text on the right are both 16 px from the edge.

**Rule 4: head and foot of a panel are the same height** (control + 2 × 12 = 56 px in the core).

**Rule 5: numbers use tabular figures** so columns of numbers line up. This was already the case (`font-variant-numeric: tabular-nums`, [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric)).

## 9. States and focus

**Rule.** One focus ring, 2 px, offset 2 px, for buttons, checkboxes, tabs and the rest. **Fields are the exception (owner): no ring around an input or a select.** Their own border turns 2 px and full ink, and the padding gives back the extra width so nothing moves. A ring around a bordered field is a second layer, and reads as one.

The ring is 2 px in every system read: Primer ([size](https://primer.style/foundations/primitives/size)), Atlassian ([border](https://atlassian.design/foundations/border)), Carbon ([text input](https://carbondesignsystem.com/components/text-input/style/)). Selected states keep the rule from research §3: never colour alone (an outline, an edge, a mark).

Besides the field focus and the segmented selection above, this pass did not change any state. A full audit of hover, pressed, selected and disabled across all components is left for Phase 5, when each component gets its docs page.

## 10. Target size

**Rule.** Targets are at least 24 × 24 px, or they pass the spacing exception: a 24 px circle centred on the target does not touch another target or its circle ([WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).

**Check**
- Every control is 24 px or more, except `tool`'s small controls (the segmented buttons, 20 px tall). Those pass by the spacing exception: they are wider than 40 px and nothing sits above or below them.
- The 16 px checkboxes in the table pass the same way (36 px rows). In forms they are wrapped in their label, which is the target.

## 11. Widths and measure

**Rule.** Floating things have widths on the grid: menu 224 (the select's minimum width too), toast 360, drawer 360, dialog 400. Running text is capped at `--measure: 66ch`. That is Bringhurst's ideal: "45 to 75 characters is widely regarded as satisfactory… the 66-character line… ideal" ([webtypography.net](http://webtypography.net/2.1.2)). Baymard recommends 50 to 75 ([line length](https://baymard.com/blog/line-length-readability)).

## 12. Audit: before and after

Core layer, measured in the browser on the preview (`getComputedStyle` and `getBoundingClientRect`):

| Component | Before | After | Rule |
|---|---|---|---|
| Button / field / select | 32, radius **8 / 6 / 6**, inset 14 / 10 / 10 | 32, radius **8 / 8 / 8**, inset **12** everywhere | §1, §4, §8 |
| Segmented: outside / inside | 32 / **26**, radius **11 / 8** | 32 / **24**, radius **8 / 4** (concentric) | §1, §4 |
| Menu item | **30** | **32** (= the select) | §1 |
| Menu | radius 8, items' text 13.5 px from the edge | radius **12** (concentric), text at 12 like the select | §4, §8 |
| Tooltip | **30**, radius 4, padding 5 | **28** (kbd + 2 × 4), radius **8** (concentric) | §1, §4 |
| Toast | **50**, radius 8, padding 8/8/8/14 | **40** (control + 2 × 4), radius **12** (concentric), 16 on both sides | §1, §4, §8 |
| Tabs | **38** (control + 6) | **40** (large) | §1 |
| Turn badge | **28** | **24** (small), radius 4 | §1, §4 |
| Drawer head / foot | 57 / 57, close button off the content edge | **56 / 56**, close glyph on the content edge | §8 |
| Dialog | padding 20, one 12 px gap | padding **24**, groups at 8 / 24 | §2, §3 |
| Veil panel | padding 20, one 14 px gap | padding **24**, groups at 16 / 8 / 24 | §2, §3 |
| Empty state | padding 40/20, one 10 px gap | padding **48/24**, groups at 16 / 8 / 24 | §2, §3 |
| Switch | 32 × **18** | **36 × 20** (sits on a 20 px line like the checkbox) | §1, §5 |
| Checkbox | radius **3** | radius **4** (`--r-1`) | §4 |
| Status glyph | 14 px box | 14 px drawn in a **16 px slot** | §6 |
| Meter | **14** tall, segmented ("pixel") in the core | **16**, **continuous** in every layer: the segment tokens are removed | §2, owner |
| Menu items | touching, 4 px around | **1 px apart**, 4 px around and at the separator (luk) | §8 rule 2b, owner |
| Segmented control | 2 px apart, 3 px visible around; picked option filled (raised ground) | **4 px** apart and around; **no fill**, one outline that **slides** to the picked option | §8 rules 1, 2b, 2c, owner |
| Field focus | 2 px ring outside the 1.5 px border (two layers) | **no ring**: the border itself turns 2 px and ink | §9, owner |
| Badge (AD rank) | **56**, type 22 | **48** (3 glyphs), type `--fs-4` | §2, §5 |
| Body line height | **20.3** (ratio 1.45) | **20** | §5 |
| Raw px values in `components.css` | about 190 | **0**, apart from the loudness mini-chart (data geometry, commented) | §2 |

The four directions still render from the same stylesheet. Instrument and Soft (kept for the record) were only renamed to the new token names (`--r-control`, `--pad-x`).

**Screenshots** (1440 px, full page, in [`foundations/`](foundations/)):
- core: [before](foundations/before-core-light-1440.png), [after](foundations/after-core-light-1440.png);
- `tool`: [before](foundations/before-tool-light-1440.png), [after](foundations/after-tool-light-1440.png);
- zoom on the menu, tooltip and toasts at 2×: [after](foundations/after-core-float-2x.png).

### Owner's review, 2026-11-20 (annotate session on the core)

1. **Menu spacing**: "exactly like the luk dropdown of labelcamp", with the same space above and below the separator, and "the pixel between the options is important". Now rule 2b (§8).
2. **Energy meter**: "make it continuous, forget the dashed pixel" bars. This was a **repeat**: on 2026-11-19 the owner had already called the pixel progress bar ugly (02-proposals §10). It was fixed in `tool` but left in the core's meter. Segmented bars are now gone from every layer, and the tokens that made them (`--meter-seg-on`, `--meter-seg-gap`) are deleted so they can't come back by a value.

3. **Menu, bottom space**: "the space below the hovered option is smaller than the one between the option and the separator." Right: the border was eating into the inset. Now rule 1 (§8): empty bands are measured from the border's inner edge.
4. **Field focus**: "I told you I don't want an extra layer around the input; just make its border bold." A **repeat** of an earlier instruction. Now the exception in §9.
5. **Segmented selection**: "remove the white background, I told you, and I asked for a selector that slides when the option changes." A **repeat** too. Now rule 2c (§8).

## 13. Open questions and what comes next

1. **Elevation and z-index** (rule 12) are not defined yet. BeastUI has no shadows (elevation is a strong line plus the raised ground), so what's missing is the stacking order: drawer, menu, toast, dialog, tooltip. Atlassian's order is a model: popup 400, blanket 500, modal 510, flag 600, tooltip 800 ([elevation](https://atlassian.design/foundations/elevation)). To set in Phase 5 along with the first overlays.
2. **`text-box-trim`**, which trims the space above capitals and below the baseline, would centre a label optically in its control, instead of relying on the font's metrics. It became Baseline "newly available" in August 2026: Chrome 133, Safari 18.2, Firefox 154 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/text-box-trim)). BeastUI's floor is Safari 17.5 (decision 0005), so it could only be a progressive enhancement: browsers below 18.2 would keep today's centring. To test in Phase 5 on the button, the tag and the kbd, with measurements, before adopting it.
3. **States** (§9): a full pass across all components, in Phase 5.
4. **Phase 5 impact.** These foundations become the first DTCG tokens. The "one token" of the thin slice becomes a "foundations" token group (space, size, radius, line, type), which is the base everything else is built on.
