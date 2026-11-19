# UI System — Proposals

Phase 3 of the [brief](BRIEF.md). It builds on the [audit](00-audit.md) and the [research](01-research.md), and on the owner's answers at the end of research §10.

**Status: checkpoint 3 (preview, round 2).** The concepts (checkpoint 1) were accepted. Round 1 of the preview (§9) got the owner's reaction, and round 2 (§10) acts on it. The names and the recommendation come after the owner has looked at round 2.

## 1. TL;DR

- Four directions. Three are **pure** and one is the **synthesis** the owner asked for:
  1. **Paper & Ink**: the editorial evolution of what Masterz and AD already are.
  2. **Instrument**: the system as a measuring device. Grid, mono numerals, ticks.
  3. **Soft Geometry**: shapes over lines. Pills, soft thick outlines, tinted bands.
  4. **Synthesis**: Paper & Ink as the core, Instrument as the "tool" theme, Soft Geometry as the playful layer.
- The pure directions are **controls**: next to them, the synthesis shows what it gains and loses, and which of the three should lead the core.
- **After round 1** (§10): Paper & Ink leads, by far, and is the core. The synthesis's `tool` layer is liked for desk apps (Masterz, Transcribz). Soft Geometry is **dropped** ("too childish, naive"). Instrument is kept close as a possible user-selectable "B-side" theme, softened in a v2. The playful layer is rebuilt on the core's shapes. The interface may go all-lowercase.
- The bold option from the plan ("Poster": giant type, flat accent fills) was dropped at the owner's request.
- Linear's app, measured directly (§2), confirms two things: hierarchy by lightness at a **fixed ratio** works in both modes, and its controls fail 3:1 like the marketing site did. Steal the first, not the second.

## 2. Linear, the app

Studied on 2026-11-19 in the owner's workspace, read-only, with [playwright-cli](https://www.npmjs.com/package/@playwright/cli): issue list, project page, issue page, light and dark. Values below are computed styles read from the live app. The screenshots hold private work data, so they stay out of this repo.

**Measured**

| Element | Light | Dark | Note |
|---|---|---|---|
| Font | Inter Variable | same | |
| Row title, nav item, group header | 13 px / 500 | same | One size for almost every label |
| Metadata (IDs, dates, labels) | 12–13 px / 450 | same | Weight 450, between regular and medium |
| Title text on surface | L 9.8 → **16.4:1** | L 100 → about 18:1 | |
| Metadata text on surface | L 39.2 → **6.3:1** | L 61.8 → **6.3:1** | Same ratio in both modes |
| Main panel | L 97.9, 1 px border L 95.2, radius 12 | L 5.5, border L 9.8 | Inset panel on a slightly different ground |
| Label chip | 24 px pill, 1 px border L 84.4 → **1.43:1** | border L 16.3 | Clickable, fails 1.4.11 |
| View tabs | 28 px pill, selected = fill L 93.5 → **1.12:1**, no border | fill L 16.7 | Selection by fill alone |
| Group header | 36 px band, radius 8, fill L 94.4 | fill L 9.2 | Grouping by tint, not by line |
| Issue row | 44 px, radius 8 on hover | same | |
| Neutral hue | LCH chroma 0.5–1.5, hue 282 | hue 272 | Almost grey, slightly cool |

**Steal**
- **Hierarchy by lightness at a fixed ratio.** Linear sets its muted text at the same contrast in both modes (6.3:1), not at the same value. BeastUI's `--text-muted` should be defined by a target ratio per mode, checked in CI.
- **Two text sizes do the work.** 13 px for labels, 12 px for metadata, and weight (500 vs 450) plus lightness for the rest. Masterz already has 8 sizes and AD 35 (audit §4); a tight scale is reachable.
- **State icons that change shape, not only colour.** Status glyphs fill like a pie: empty circle (todo), half (in progress), almost full (in review), check (done). That is a non-colour cue, and it fits Masterz's pipeline stages and Transcribz's run steps.
- **The inset panel.** The working area is a raised panel with a 12 px radius on the app ground, and the sidebar sits on the ground itself. Two grounds, one faint line. It is the "paper on a desk" idea BeastUI already has.
- **Properties as a label/value list.** The issue page's side panel is a borderless list on a 32 px pitch, icon + value. Masterz's settings drawer could follow it.

**Avoid**
- Chip borders at 1.43:1 and selected tabs at 1.12:1, the same failure research §3 measured on the marketing site.
- A cool near-black dark (L 5.5). BeastUI's dark is warm (owner's answer 1).

## 3. What every direction shares

These come from the owner's decisions and from research §10. They are not up for debate between directions.

- **Paper ground** in every theme, tinted, never white or flat grey. A warm dark.
- **Two line weights:** a faint structural line, and an interactive line at ≥3:1 on every surface (research §3).
- **Focus:** 2 px outline, offset 2 px, about 12:1.
- **Selection and current state** always carry a non-colour cue.
- **Role-named tokens** (research §4): `--surface`, `--surface-raised`, `--text`, `--text-muted`, `--border-subtle`, `--border-strong`, `--accent`, `--danger`…
- **Native elements first** (research §5): `<dialog>`, popover, `<details>`, real inputs.
- **The same five samples** in the preview, picked for v0.1 (research §10, constraint 8):
  1. buttons (primary, secondary, quiet, icon, danger) and a text field with its error;
  2. Masterz's **table** with a selected row;
  3. Masterz's **drawer**;
  4. Masterz's **progress + veil** for a long job;
  5. a **playful sample**: an energy bar and a rank badge.

The directions differ in **line, shape, type, density and motion**. Colour is almost the same everywhere on purpose: if two directions only differed by palette, they would be one direction.

## 4. Direction 1 — Paper & Ink

**Concept.** A well-made notebook. Ink drawn on paper, and nothing else. Hierarchy comes from line weight and whitespace. It is what Masterz and AD already look like, cleaned up and made consistent.

**Token sketch**

| Knob | Value |
|---|---|
| Ground / raised | paper `#dcd7cc` / felt `#eeeae2`; dark `#1a1814` / `#26241f` |
| Lines | 1.5 px; subtle = ink 30%, strong = ink 56% |
| Radius | 4 / 8 / 12, pills only for tags |
| Type | Inter Tight 400/500 for UI; Outfit 300 for display, letter-spaced 0.14em for the wordmark |
| Sizes | 12 / 13 / 15 / 20 / 32 / 48 |
| Density | rows 36 px, controls 32 px, touch 44 px |
| Motion | `dur-1` and `dur-2` only; fades and short slides |
| Accent | none in chrome; ink is the accent |

**The five samples**
- **Buttons:** primary = ink fill and paper text; secondary = 1.5 px strong outline; quiet = text only, felt on hover.
- **Table:** hairline rules between rows, no column rules. Selected = felt + a 2 px ink edge on the left.
- **Drawer:** slides from the right, separated by one ink line, no shadow.
- **Progress + veil:** a 2 px ink line over a subtle track. The veil is paper at 85% with the stage name in Outfit and the elapsed time below.
- **Playful:** an outlined energy bar with ink segments; the badge is an outlined circle with a numeral.

**Playful layer.** Weak by nature. It has to borrow fills and colour, and then stops looking like itself.
**For an audio tool.** Calm and readable, but generic: nothing in it says "sound".
**Docs site.** Editorial: large Outfit headings, wide margins, ink diagrams. The closest to nuda.studio.
**Risks.** "Beige SaaS": tasteful, forgettable. Little to tell it apart from a monochrome system except the ground.

## 5. Direction 2 — Instrument

**Concept.** A measuring device: a mixing console, a lab datasheet, a technical drawing. The UI shows its grid and its numbers. Every value reads like a readout.

**Token sketch**

| Knob | Value |
|---|---|
| Ground / raised | same paper; panels framed instead of raised |
| Lines | 1 px; subtle = ink 25%, strong = ink 56%; corner ticks on panels |
| Radius | 0 / 2 / 4 |
| Type | Inter Tight for text; a mono for numerals and labels (candidates: JetBrains Mono, IBM Plex Mono, Geist Mono, all OFL), small caps letter-spaced 0.08em |
| Sizes | 11 / 12 / 13 / 16 / 24 |
| Density | rows 32 px, controls 28 px, touch 44 px |
| Motion | linear and fast; meters move, panels don't |
| Accent | one signal colour (amber, like a VU meter) for live states only |

**The five samples**
- **Buttons:** rectangular, 1 px strong outline, mono uppercase label. Primary = ink fill.
- **Table:** dense, column rules, numbers in mono and right-aligned. Selected = an ink bar in the gutter plus a ▸ mark.
- **Drawer:** a framed panel with a header strip and corner ticks.
- **Progress + veil:** a segmented meter, one segment per stage, with the stage labels under it. The veil is a readout panel: stage, elapsed and estimate in mono.
- **Playful:** the energy bar is an LED meter; the badge is a stamped code (`R-07`).

**Playful layer.** Better than expected: HUDs are instruments. Health, energy and countdowns are meters already. It lacks warmth and shape for rewards.
**For an audio tool.** Native: waveforms, LUFS readouts and level meters belong here.
**Docs site.** A spec sheet: grid, numbered sections, measurements printed next to components. Very distinctive.
**Risks.** Cold and busy. Fake technicality (ticks for decoration). Mono hurts long reading. Square corners feel harsh on a phone game.

## 6. Direction 3 — Soft Geometry

**Concept.** Shapes before lines. Controls are soft solid objects: pills and rounded bands. Groups are made by tint, not by rules. Friendly, still calm.

**Token sketch**

| Knob | Value |
|---|---|
| Ground / raised | same paper; tinted bands (felt) carry grouping |
| Lines | 2 px soft outlines on controls; almost no structural lines |
| Radius | 10 / 16 / full; controls are pills |
| Type | Inter Tight for UI; Outfit 500 (not 300) for display, tighter tracking |
| Sizes | 13 / 15 / 17 / 22 / 36 / 56 |
| Density | rows 44 px, controls 40 px, touch 48 px |
| Motion | springs (bounce ≈0.25), press scale 0.97, `dur-2` and `dur-3` |
| Accent | soft tints of 3–4 hues on paper, for data and states |

**The five samples**
- **Buttons:** pills. Primary = ink fill; secondary = 2 px outline; quiet = a felt pill.
- **Table:** rows as rounded bands with gaps. Selected = band in felt + an ink dot at the start.
- **Drawer:** a rounded sheet floating with a margin (like Linear's inset panel), separated by a line, not a shadow.
- **Progress + veil:** a thick rounded track (8 px) with a rounded fill. The veil is a card with a progress ring and the stage name.
- **Playful:** the energy bar is a chunky pill with a tinted fill; the badge is a rounded shield.

**Playful layer.** Native: this is what AD's game table wants.
**For an audio tool.** Good for player controls (a big round play button), weak for dense data tables and meters.
**Docs site.** Friendly, close to Raycast or Family. Less portfolio-serious.
**Risks.** Cute and generic iOS. Low density hurts Masterz. Tints risk turning into fills on chrome, which research §6 says to avoid.

## 7. Direction 4 — Synthesis

**Concept.** One grammar, two dialects. Paper & Ink is the core every app gets. Instrument and Soft Geometry are not separate looks but **layers** that move a few knobs:

```
            ┌─ theme "tool"     (Instrument)    → Masterz, Transcribz
Core ───────┤
(Paper&Ink) └─ playful layer    (Soft Geometry) → Attaque Défense
```

**Invariant (core, every app)**: ground, ink, the two line levels, focus, state cues, UI typeface, spacing grid, motion grammar.

**What each layer moves**

| Knob | Core | `tool` theme | Playful layer |
|---|---|---|---|
| `--radius-factor` | 1 (4 / 8 / 12) | 0.5 (2 / 4 / 6) | 1.5 (6 / 12 / full) |
| `--stroke` | 1.5 px | 1 px | 2 px |
| Numerals | Inter Tight, tabular | mono | Inter Tight, tabular |
| Display face | Outfit 300 | Outfit 300, small caps labels | Outfit 500 |
| Density | rows 36 px | rows 32 px | rows 44 px |
| `--motion-scale` | 1 | 0.75, linear meters | 1.5, springs |
| Accent | none | one signal colour | 3–4 tints, on data only |
| Grouping | rules | rules + ticks | tinted bands |

The preview shows the same five samples three times: core, `tool`, playful.

**Why it can work.** It is what the apps already are: Masterz is roughly core + tool, AD roughly core + playful. And it maps one to one onto the brief's three layers.
**Risks.**
- **No face of its own.** If the core is too neutral, BeastUI becomes a theme engine. The core must be strong alone; the pure Paper & Ink is the test of that.
- **Knob explosion.** Every knob doubles the test matrix (themes × modes × contrast × visual regression). Keep the list above, and add knobs only for a real app need.
- **Mixing badly.** Ticks next to pills would read as two systems. The rule: a layer changes values, never adds a new shape.

## 8. Extending later

The layer model is meant to grow:
- **A new theme** (a third app type, a client) is a new set of knob values. Additive, a minor version.
- **A sub-theme** (e.g. AD's Sage or Slate grounds inside the playful layer) nests: `data-theme="playful"` on the root, a ground variant on top.
- **Changing the core** changes every app. A major version, with a decision record.

The cost is real: each theme must pass the same contrast and visual-regression checks in both modes. Phase 4 decides how CI enforces it.

## 9. The preview

**Run it:** `cd preview && npm install && npm run dev`, then pick a direction, a layer (synthesis only) and a mode in the top bar. The state is in the URL (`?d=synthesis&layer=tool&mode=dark`), so any combination can be linked or screenshotted.

**How it is built.** It is throwaway code, but it tests a real claim of the brief:
- **One markup, one shared stylesheet** (`preview/src/components.css`), driven only by tokens. Each direction is a token file in `preview/src/directions/`.
- `paper.css` declares every token on `:root`; the other files list only what they change. Reading a direction's file is reading its difference.
- The pure directions needed a few rules beyond values, in a `beast.direction` cascade layer: corner ticks, column rules and a ▸ mark for Instrument; a selection dot and tinted tags for Soft Geometry.
- **The synthesis needed none.** Its layers only change values, as §7 required. The radius scale derives from one knob, `--radius-factor`.
- Light and dark use `color-scheme` + `light-dark()` (owner's answer 2).
- Icons take the UI stroke in screen pixels (`vector-effect: non-scaling-stroke`), so they match the lines in every direction.

**Contrast, computed from the live tokens** (`preview/src/contrast.ts`: the browser resolves each token, an alpha colour is composited over its real surface, then WCAG 2.x luminance). The colour roles are shared, so most pairs are the same in every direction:

| Pair | Needed | Light | Dark |
|---|---|---|---|
| Text on ground | 4.5 | 11.97 | 14.39 |
| Muted text on ground / raised | 4.5 | 5.14 / 6.14 | 6.74 / 5.90 |
| Primary button label | 4.5 | 14.31 | 14.39 |
| Danger text on ground / raised | 4.5 | **4.86** / 5.81 | 5.97 / 5.22 |
| Interactive border on ground / raised | 3 | 3.58 / 3.77 | 3.86 / 3.67 |
| Focus ring | 3 | 11.97 | 14.39 |

What differs by direction:

| Pair | Paper & Ink | Instrument | Soft Geometry | Synthesis tool / playful |
|---|---|---|---|---|
| Meter fill (light / dark), needs 3 | 11.97 / 14.39 | 3.79 / 8.51 | 3.58 / 9.67 | 3.79 / 3.58 (light) |
| Structural line (light, decorative) | 1.86 | 1.63 | 1.38 | 1.63 / 1.86 |

- Everything passes, in both modes.
- **The thin margin is danger text on the light ground (4.86).** Any theme with a darker ground must re-check it. That is a job for CI (Phase 4).
- The signal colours (amber, green) pass as fills only. They must not be used as text.

**Screenshots of round 1** that round 2 replaced (the current ones are in §10):

| Direction | Light | Dark |
|---|---|---|
| Instrument v1 | [light](proposals/instrument-v1-light-1440.png) | [dark](proposals/instrument-v1-dark-1440.png) |
| Soft Geometry | [light](proposals/soft-light-1440.png) | [dark](proposals/soft-dark-1440.png) |
| Synthesis, playful v1 | [light](proposals/synthesis-playful-v1-light-1440.png) ([390 px](proposals/synthesis-playful-v1-light-390.png)) | [dark](proposals/synthesis-playful-v1-dark-1440.png) |

## 10. Round 2: the owner's reaction, and what changed

**The reaction to round 1** (2026-11-19)

| Direction | Verdict |
|---|---|
| Paper & Ink | Liked, by far. It is the synthesis's core. |
| Instrument | "Interesting, but too straight, too robotic." Worth keeping close as an alternative theme a user could pick (a "B-side"), if softened and warmed while staying straight. |
| Soft Geometry | "Really not great, much too childish, naive." Dropped. |
| Synthesis, `tool` | "A good balance", right for desk apps (Masterz, Transcribz), not for AD. The segmented "pixel" progress bar is ugly. |
| Synthesis, playful | Judged naive too, on the Masterz table. |

The owner also wants to explore **lowercase everywhere in the interface**, and asked which other components a UI library must show.

**What changed**

1. **Soft Geometry is dropped.** Its screenshots stay for the docs' design rationale ([light](proposals/soft-light-1440.png), [dark](proposals/soft-dark-1440.png)). Why it failed: pills, bands and springs on every control read as a toy. It spent the novelty budget (research §6) on chrome instead of on moments.
2. **The playful layer, v2.** v1 borrowed Soft Geometry's shapes, and was judged on Masterz, which is not its app. v2 keeps the core's shapes (radius ×1.25, same 1.5 px line, no pills) and spends its novelty on **colour and motion only**: suit red on cards, gold for rewards, green for energy, a spring when a card is dealt or picked. It is now judged on an AD sample: a game table with seats, a pile, a hand and the turn cue (preview §6).
3. **`tool`: no more pixel bar.** The progress bar is a thin continuous line, with graduations at the stage boundaries under it. The meters are continuous too.
4. **Instrument v2**, softened and warmed but still straight:
   - 3 px corners instead of 0;
   - Inter Tight for words, mono for numbers only;
   - no uppercase;
   - no drawing grid;
   - corner ticks in the strong line colour instead of full ink;
   - amber as the warm signal: selected edge, selected tab, progress.

   v1 stays for the record ([light](proposals/instrument-v1-light-1440.png)).
5. **A lowercase voice**, as a toggle (`Aa` / `aa`). It works as a knob, `--ui-case`, in its own cascade layer (`beast.voice`), so it wins over any direction's casing.
   - **Lowercase**: short interface strings, i.e. buttons, labels, tabs, titles, menu items, tooltips, toasts, statuses.
   - **Never lowercase**: full sentences (hints, body text) and user content (track names).
   - **Protected with `.b-keep`**: units and acronyms (LUFS, dBTP, MP3; "MB" would turn into "mb", a megabit), and proper nouns (Serato, player names).

   Masterz already writes its chrome this way ("how to read", "target", "serato closed").
6. **Eight more components**, chosen because they show a direction's identity, not because they are easy:
   - **select + menu, dialog and toast** answer the open question of elevation without shadow (audit §14). Here elevation is a strong line plus the raised ground;
   - **tabs, switch, radio and slider** test control shapes and the 3:1 rule;
   - **tooltip + kbd** test small type and the keyboard;
   - **empty state** tests the voice and the display face.

   Left out on purpose: avatar, skeleton, spinner, divider, textarea. They are trivial variations and would not separate the directions.

**Contrast, round 2.** All pairs pass in every direction and both modes. New pairs:

| Pair | Needed | Core | `tool` | Playful v2 | Instrument v2 |
|---|---|---|---|---|---|
| Progress fill on raised (light) | 3 | 14.31 | 14.31 | 4.29 | 4.54 |
| Selected tab mark (light) | 3 | 11.97 | 11.97 | 11.97 | 3.79 |
| Red card rank on card (light) | 4.5 | 5.83 | 5.83 | 5.83 | 5.83 |
| Black card rank on card (light) | 4.5 | 15.90 | 15.90 | 15.90 | 15.90 |

**Screenshots, round 2** (1440 px, full page, in [`proposals/`](proposals/)):

| | Light | Dark | Lowercase |
|---|---|---|---|
| Paper & Ink (= core) | [light](proposals/paper-light-1440.png) | [dark](proposals/paper-dark-1440.png) | [aa](proposals/paper-lower-light-1440.png) |
| Synthesis, `tool` | [light](proposals/synthesis-tool-light-1440.png) | [dark](proposals/synthesis-tool-dark-1440.png) | lowercase by default (§11) |
| Synthesis, playful v2 | [light](proposals/synthesis-playful-light-1440.png) ([390 px](proposals/synthesis-playful-light-390.png)) | [dark](proposals/synthesis-playful-dark-1440.png) | |
| Instrument v2 | [light](proposals/instrument-v2-light-1440.png) | [dark](proposals/instrument-v2-dark-1440.png) | |

## 11. Decisions after round 2

Taken by the owner on 2026-11-19.

1. **Playful v2 is a good base for AD.** It gets refined when AD's screens are mocked up (Phase 5/6), not now.
2. **Instrument v2 becomes an optional theme**, picked by the user (a "B-side"), like AD's Sage or Slate today. Not in v0.1; kept close.
3. **The interface case follows the app.** Lowercase everywhere was judged too much.

   | Scope | Case |
   |---|---|
   | Core (default) | Initial capital ("Analyse all") |
   | `tool` layer (Masterz, Transcribz) | Lowercase ("analyse all"), set in the layer's tokens |
   | Playful layer (AD) | Initial capital |
   | Any app | Can force either with `data-case="sentence"` or `data-case="lower"` |

   **Content rule:** copy is always written with an initial capital, and lowercase is only a rendering choice (`text-transform`). The reverse is impossible: "serato" can't become "Serato" again. This goes into the docs' content guide.

The preview follows these decisions. Its case toggle now reads `Auto` / `Aa` / `aa`, and `Auto` follows the layer.

## 12. Next

1. 3–5 names, checked against npm.
2. A recommendation, and the case against it.
