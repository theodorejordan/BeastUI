# 00 — Audit

Phase 1 of the [brief](BRIEF.md). It inventories what Attaque Défense (AD) and Masterz already contain, says what to keep and what to rebuild, flags quality and accessibility problems, and checks the release slicing.

Status: **complete**: code audit, plus rendered screens with their findings (§14).

## 1. TL;DR

- **A family already exists, by copy-paste.** Masterz's stylesheet says so: "AttaqueDéfense's palette and fonts, outlined and sober" (`Masterz web/src/styles.css:1`), and "AttaqueDéfense's controls.css, trimmed" (`:244`). Both apps share:
  - a warm paper ground with ink, thin outlines and no shadows;
  - Inter Tight for the UI and Outfit for display text.

  The look is real and coherent. Nothing *shares* it, though, and the copies have already drifted:
  - different ground and felt colours;
  - `.btn-primary` renamed `.btn-ink`;
  - `--font-card` renamed `--font-mark`.
- **Only colour is tokenized.** Neither app has a spacing, radius, type, motion, z-index or breakpoint scale.
  - AD has about 31 radius values, about 35 font sizes, 25 z-index declarations with no scale, and 6 heights for a "primary button".
  - Masterz has about 215 raw `px` values.
- **The signature look fails its own contrast test.** The thin outline is the identity, but `--line` (ink at 30%) is **1.84:1** against the ground. [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) asks 3:1 for control borders. The hover and selected surface (felt on ground) is **1.14–1.24:1**. This is the central design tension for BeastUI: outlined *and* AA.
- **The same concept is implemented many times.**
  - AD: 7 overlay/sheet/modal implementations, 4 ranking lists, 4 "new message" hooks, 4 icon-button styles.
  - Masterz: 3 tooltips, 3 progress bars, 2 veils.
- **Behaviour is the weak spot, not looks.**
  - No focus trap or focus restore in any modal.
  - Escape is handled by 6 separate listeners.
  - Masterz has no keyboard shortcuts and no `prefers-reduced-motion`.
  - Neither app follows `prefers-color-scheme`.
- **Keep:** the colour vocabulary, the outline-only restraint, AD's `[data-theme]` mechanism, AD's `Frame`, `Card`, `Avatar`, `Flights` and pure layout functions, and Masterz's `LoudnessLine`, veil, full-bleed table and `--row` rhythm.
- **Rebuild:** overlays, tooltips and popovers, progress, icon buttons, the button size scale, the CSS load order, and the phone-mode overrides.
- **Release slicing:** Masterz first is right. But "~15 primitives" can't migrate it, because it needs a table, a drawer and progress on day one. §11 proposes a small adjustment.

## 2. Scope and method

| Repo | Commit audited | Notes |
|---|---|---|
| attaque-defense | `dd0a8a7` + uncommitted changes (`App.tsx`, `connection.ts`, server) | Client UI: `src/client/**`, about 5,000 lines of CSS |
| Masterz | `73f0f46` | `web/src/**`: one 1,130-line `styles.css` + 7 TSX files |
| transcribz | `78fcea7` | 352 lines of Python, CLI only |

- I read every client file in both apps (with two read-only review passes) and re-checked the verdict-setting claims myself in the code.
- Contrast figures come from a script that applies the WCAG relative-luminance formula to the token values, with alpha blended onto the ground.
- Line numbers refer to the commits above.

## 3. Visual language today

**What works and is worth carrying forward**
- **Restraint.** No shadows on controls, 1.5px ink outlines, an ink-filled primary button, and a felt surface for hover and selection. It already reads as "clear, abstract, outlined".
- **A two-font pairing with roles.** Inter Tight (400/500/600) is the UI text. Outfit (300) is the display and brand voice: the Masterz wordmark is letter-spaced at 0.14em (`styles.css:46-55`), and the card faces are in Outfit.
- **Warmth.** The paper ground (`#e6e0d4` in AD, `#dcd7cc` in Masterz) keeps it from looking like yet another grey SaaS. This is a real asset against the Linear and Vercel monochrome clones.
- **Self-hosted fonts, latin subset** (`base.css:3-8`). No third-party requests.

**What fails**

| Pair | AD Lin | AD Sauge | AD Ardoise | AD Casino | Masterz | Needed |
|---|---|---|---|---|---|---|
| ink / ground | 13.06 | 11.39 | 11.60 | 8.27 | 11.97 | 4.5 ✓ |
| muted / ground | 5.61 | 4.89 | 4.98 | 5.44 | 5.14 | 4.5 ✓ |
| muted / felt | 6.37 | 5.81 | 5.87 | **4.38** | 6.14 | 4.5 |
| danger / ground | 5.30 | 4.62 | 4.71 | **4.17** | 4.86 | 4.5 |
| danger / felt | 6.02 | 5.49 | 5.56 | **3.36** | 5.81 | 4.5 |
| `--line` border / ground | **1.87** | **1.84** | **1.84** | **2.22** | **1.84** | 3.0 (1.4.11) |
| felt / ground (hover = selected) | 1.14 | 1.19 | 1.18 | 1.24 | 1.20 | 3.0 when it is the only cue |

- Text contrast is fine, except in Casino, AD's one dark theme. Danger text there fails: Leave, form errors, and the unread badge.
- **Every control outline fails 3:1.** That covers `.btn-small`, `.seg`, `.text-input`, `.tag` and the drop zone in both apps, and AD's turn outline `--outline-turn`, the main "whose turn" cue on a phone.
- **Selection relies on felt alone.** Masterz uses one style for hover, selected and expanded rows (`styles.css:166-169, 433-436, 717-721`), at 1.20:1.

Implication for BeastUI: outlines can stay thin, but they need a **control-border token at ≥3:1**, with the faint line kept for decorative dividers only. Selection also needs a second cue (an ink edge, a mark or weight), not just a tint.

## 4. Tokens

**Colour: the same vocabulary, drifting**

| Token | AD (`base.css`) | Masterz (`styles.css`) |
|---|---|---|
| `--ground` | `#e6e0d4` (+ 3 more themes) | `#dcd7cc` |
| `--felt` | `#f2eee6` | `#eeeae2` |
| `--ink` / `--muted` / `--danger` | same | same |
| `--line` | ink 30% | ink 30% |
| `--hair` | — | ink 12% |
| fonts | `--font-ui`, `--font-card` | `--font-ui`, `--font-mark` |
| sizes | `--text-scale` (table grows on large screens) | `--row: 36px`, `--gutter` |
| game | `--card-*`, `--outline-*`, `--glow`, `--won*`, `--lost*` | — |

- **Naming is born in the game.** `ground` and `felt` are a card table. They read fine in AD, but they are odd as a library API. BeastUI needs semantic roles (surface, surface-raised, text, text-muted, border, border-strong, accent, danger…). The game names can live on as theme values.
- **Hard-coded colours that bypass themes:**
  - 9 backdrops and shadows in AD are written as `rgb(27 27 31 / x)` and stay light-ink in Casino (`menu.css:11,25,389`, `end.css:12,28`, `chat.css:167,204`, `lobby.css:685`, `history.css:122`).
  - `profile/picture.ts:8` uses `#eeeae2` while its comment says "felt", which is `#f2eee6` in AD. The Masterz felt leaked back into AD.
  - The Masterz veil retypes the ground by hand: `rgb(220 215 204 / 0.6)` (`styles.css:779`).

**Missing scales**

| Scale | AD | Masterz |
|---|---|---|
| Spacing | 16 distinct gap values; padding is ad hoc | about 215 `px` literals |
| Radius | about 31 values (8, 10, 12, 14, 16, 22, 24, 26…) | 9 values (3 → 12px, 50%) |
| Font size | about 35 values, from 8.5px to 54px | 8 values |
| Control height | 32, 34, 36, 40, 42, 44, 46, 48, 50, 52, 54, 56, 60 | 24, 26, 30, 32, 38 (not tied to `--row`) |
| z-index | 25 declarations from -1 to 1000, no scale | 1, 2, 3 |
| Motion | 17 durations, 6 easings | 3 durations |
| Breakpoints | JS (`phone.ts:8`) + 860 / 640px CSS | 760 / 1200px, in conflicting order |

- **JS↔CSS constants copied by hand (AD).** Each of these is defined in both places:
  - `BUBBLE_MS` (`Bubbles.tsx:11` / `table.css:1434`)
  - `PING_SHOWN_MS` (`Table.tsx:38` / `table.css:980`)
  - `SLIDE_MS` (`Table.tsx:412` / `table.css:12,615,619`)
  - `UPRIGHT_TRAY` (`layout.ts:338` / `table.css:1347`)
  - `LONG_PRESS_MS`, the toast and floating timers, and more

  The one exception is `--impact`, passed from JS (`Seat.tsx:114`). That is the right pattern: **motion tokens must be readable from both CSS and JS**. This is a direct argument for the brief's "JSON source" for tokens.

## 5. Component matrix

The layer column applies the brief's CSS-first principle to what really exists:
- **T** = tokens only.
- **C** = CSS classes, no JS needed.
- **C+n** = CSS plus a native HTML feature that brings the behaviour for free (`<dialog>`, the `popover` attribute, `<details>`, `<progress>`).
- **P** = needs a Preact layer (roving focus, positioning, timers).

| Concept | AD today | Masterz today | Transcribz needs | Verdict | Layer |
|---|---|---|---|---|---|
| Button (outline / primary / danger / link) | `.btn` family `controls.css:2-62`; no `:hover` anywhere; 6 primary heights | `.btn .btn-ink .btn-small .btn-link` (`:245-321`) | yes | **keep idea, rebuild** with a size scale and hover/active states | C |
| Icon button | 4 variants (`.corner-button`, `.icon-button`, `.chat-sheet-close`, `.lobby-up-remove`) | 7 bespoke resets (`.listen`, `.replace-btn`, `.crate-toggle`…) | yes | **rebuild** as one | C |
| Segmented control | `.seg` with `aria-pressed` | `.seg`, `.seg-small`, used 3×, consistent | yes (language, model) | **keep** | C (+P for arrow keys) |
| Tabs | `.menu-tabs` `role=tablist`, no arrow keys; Profile copies the markup | — | maybe | **rebuild** | P |
| Text input / select / checkbox / slider | `.text-input` resized 7×; `.select`; `.check`; `accent-color` ranges | `.text-input` (numbers), checkboxes | yes | **keep base, rebuild sizes** | C |
| Tag / badge | `.tag` (variants unstyled), `.unread` | `.tag`, `.tag-warn`, `FLAG_LABELS` | yes (speakers) | **keep** | C |
| Avatar / name | `Avatar`, `Name`: single sources, sizes set in about 14 places | — | speaker chips | **keep**, add a size scale | C |
| Tooltip | `hint()` + `.hint::after` (`table.css:924-965`) | 3 implementations + `title=`, wrong roles | yes | **rebuild** | C+n / P |
| Popover / menu | `PingMenu` (`Table.tsx:373-409`) | crates popover holding buttons inside `role=tooltip` | yes | **rebuild** | C+n / P |
| Modal / sheet / drawer | **7 implementations**; `Frame` (`Menu.tsx:142-187`) is the best | 2 side panels sharing a copy-pasted header, magic `top:57px` | yes | **rebuild** from `Frame`'s API onto native `<dialog>` | C+n (+P) |
| Toast | `.toast` + `.chat-toast` (different patterns; desktop toast lacks z-index) | — (errors are inline `<p>`) | yes | **rebuild** | P (live region, timers) |
| Progress | — | **3 implementations**, none `role=progressbar` | yes, staged | **rebuild** | C+n |
| Veil (blocking overlay with status) | — | `JobVeil` + inline duplicate (`App.tsx:258`) | yes (transcribing) | **keep** the pattern | C (+P to make content inert) |
| Table | — | full-bleed, ellipsize-first name column, `--row` rhythm | no | **keep** | C |
| Tree | — | `CrateTree`: clickable div, no tree role | no | **rebuild** | P |
| Accordion | rules in `<details>` (`Menu.tsx:273-286`) | — | — | **keep** (native) | C+n |
| Stepper | `Lobby.tsx:240-260` | — | no | keep | C |
| Dropzone | — | `ReplacePanel` (label + hidden input) | **yes, first screen** | **keep idea** | C (+P for drag state) |
| Empty / error states | text only | "No tracks here.", one app-level error line | yes | **new** | C |
| Waveform / player | — | `Player`: hidden `<audio>`, SVG waveform, pinch zoom, **no keyboard** | **yes** | **rebuild** (media layer) | P |
| Level meter / chart | — | `LoudnessLine` SVG, reused by Guide | maybe | **keep**, the most distinctive piece | C (SVG) |
| Transcript viewer | — | — | **yes** | **new** | P (audio sync) |
| Chat | `ChatPanel`, `PhoneChat`, 4 "fresh message" hooks | — | — | **game layer**, merge the hooks | P |
| Game HUD (seat, card, flights, ranking, K.O.) | rich; `Card` and `Flights` are solid; 4 ranking lists | — | — | **playful layer** | P |
| App shell | top bar + screen; phone via `html.phone` | top bar + sidebar + main + job bar | yes | **new pattern** from both | C |

**What this shows about CSS-first:** about two thirds of the concepts that exist can live in the CSS layer, especially if BeastUI leans on native elements:
- [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) gives you the top layer, `inert` behind and Escape;
- the [`popover` attribute](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) gives light-dismiss;
- [`<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) gives disclosure;
- `<progress>` gives a progress bar.

The Preact layer is then genuinely thin: roving focus (tabs, tree, menus), positioning, toasts, media. **This supports the brief's principle.** Phase 4 must still check browser support for CSS anchor positioning before relying on it for popovers.

## 6. Duplicates and divergence

**Within AD**
- **Overlays ×7:**
  1. `Frame` (3 kinds)
  2. `LeaveConfirm`
  3. `SettingsSheet` (its own handle and keyframes, `lobby.css:678-807`, vs the Menu sheet's `menu.css:397-411`)
  4. `EndModal`
  5. the PhoneChat sheet + strip
  6. the upright action tray
  7. the pinned rules panel + `PingMenu`

  Backdrop opacities: 0.25 / 0.32 / 0.12.
- **Rankings ×4:** `Ranking`, `PhoneRanking`, the EndModal list, History players. **Spectators ×3.**
- **"New message" hooks ×4:** `useLatestBySender`, `useBubbles`, the PhoneChat toast and `useFresh`. They share the same seen-id and timer logic, with 5s / 6s / 4s durations.
- **The same visual built twice:** `.menu-tabs` restyled to look like `.seg` when upright (`menu.css:354-378`).
- **Lobby rows ×2:** `PlayerRow` / `UprightRow`. **The three-card fan ×2:** `Home.tsx:16-20` and `Lobby.tsx:19-23`.
- **Small uppercase label ×5.** **Rounded felt panel ×7.**
- **Five module stores** with the same listener-set + hook pattern (`account`, `connection`, `display`, `audio/settings`, `phone`). That is fine, but worth a shared tiny helper.

**Within Masterz**
- **Tooltips ×3** plus native `title`.
- **Progress ×3:** `.progress` 2px, `.mask-progress` 6px bordered, `.mini-progress` 2px on hair.
- **Veils ×2.**
- **Side-panel header ×2**, copy-pasted (`App.tsx:459-464`, `Guide.tsx:13-18`).
- **`clock()` ×2**, and they disagree (see §8).
- **Three headings** that differ only by letter-spacing (.06 / .04 / .04em).

**Across apps**
- Renamed: `.btn-primary` → `.btn-ink`, `--font-card` → `--font-mark`.
- Different values: ground and felt.
- Masterz trimmed `.btn-danger` but added `.seg-small` and `--hair`.
- The focus rule exists in both, scoped to different selectors.

None of this is wrong locally. It is exactly what a shared package prevents.

## 7. Accessibility

Ordered by impact.

| Issue | WCAG | AD | Masterz | Severity |
|---|---|---|---|---|
| Control borders and state outlines below 3:1 | [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | yes (incl. turn outline) | yes | **High**: it is the visual identity, so it must be solved in the token design |
| Modals: no focus trap, no focus restore, no `inert`; `EndModal` is `aria-modal` while chat stays usable | [2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) | yes | panels move no focus at all; veil content stays keyboard-reachable | **High** |
| Keyboard-only paths missing | [2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) | pinging (long press / context menu only) | waveform excerpt, zoom, pan; no Space to play | **High** for Masterz's core task |
| Tooltips on hover only, no Escape, interactive content in `role=tooltip` | [1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) | `.hint` | 3 implementations | Medium |
| No `prefers-reduced-motion` | [2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA; required by the brief) | partial (good in `Flights`; gaps in ping target, press ring, hovers) | **none** | Medium |
| No `prefers-color-scheme`; dark only by manual theme | brief | Casino only | light only | Medium |
| Status not announced (no live regions; Masterz veil re-announces every second) | [4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | "Connecting…" | job end, errors | Medium |
| Tabs and tree without arrow keys or roving tabindex | ARIA APG | Menu tabs | crate tree | Medium |
| Small targets | [2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) AA = 24px; the brief wants "comfortable", i.e. 44px | `.btn-small` 34, `.btn-link` 32, `.seg` 34, ping items about 30, colour input 30 | desktop app, less critical | Medium for AD |
| Focus visibility inconsistent (browser default on many controls; `outline:none` at `table.css:1039` replaced by a 1.14:1 tint) | [2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) | yes | yes | Low–medium |
| Semantics: `aria-label` on role-less elements, unlabelled `role=group`, no `<h1>` on main screens, help text inside `<label>` | 1.3.1 / 4.1.2 | yes | yes | Low |
| Free name colours (any value) used as text and outline colour | 1.4.3 | owner decision (`DECISIONS.md:597-599`) | — | **Challenge**: see §10 |

## 8. Bugs found along the way

Listed only. Fixing them is not in Phase 1's scope; each is a small, separate change in its app.

1. **AD: upright lobby buttons lose their sizing.** `main.tsx:3` imports `App` (and so every component's CSS) *before* `base.css` and `controls.css`. `.btn` and `.btn-primary` then win over `.lobby-up-action` at `lobby.css:641-647`, which has the same specificity. Join, Start game and I'm ready render at 52px or 40px instead of 60px, and "I'm ready" loses its weight 600. This is the cascade problem BeastUI must design out (cascade layers or a fixed import order).
2. **Masterz: the 1200px media query overrides the 760px one.** The 1200px block (`styles.css:1044`) comes after the 760px block (`:569`) and also matches below 760px. On a phone-width window the stacked sidebar gets `width: 200px`, and `.main-inner` gets the wrong padding.
3. **Masterz: `clock()` exists twice with different rounding.** `Replace.tsx:7` uses `Math.round(s % 60)`, which can print "3:60". `Player.tsx:14` uses `Math.floor`.
4. **AD: the desktop `.toast` has no z-index** (`controls.css:203-216`), so an error raised with the Menu open sits under its backdrop (z 20).
5. **AD: weight 800 is requested but never loaded.** `.ko-stamp` asks for it (`table.css:878`), so the browser synthesises it.
6. **AD: the static `theme-color`** (`index.html:14`, the manifest) stays light in Casino.
7. **Masterz: a server blip removes the table.** A failed state poll sets `state` to null (`App.tsx:77`), so the table and panels vanish. There's also an unhandled rejection in the job poll (`:75, :87`).
8. **Masterz: performance.** The waveform re-renders about 800 SVG lines on every `timeupdate` (`Player.tsx:101`).
9. **Masterz: `npm run dev` serves a blank page.** The `'/api'` proxy also catches the module `/api.ts`. Found while taking the screenshots; see §14.

## 9. Transcribz

**What it does today** (`cli.py`):
1. decode
2. diarize, with *determinate* progress
3. transcribe, with *indeterminate* progress (about 2 min for a 6.5-min file on an M1)
4. align words to speakers into `Utterance{start, end, speaker, text}`
5. ask a name for each voice, showing 3 sample lines
6. write Markdown

The strings are French.

**Screens a UI needs**, all mapped onto the matrix above:
1. **Drop** a file: dropzone, file meta.
2. **Run**: a staged progress list (3 stages, one indeterminate), a veil-like waiting state, cancel.
3. **Name the voices**: per speaker, 3 sample lines with play buttons and a name input. This is a *form* plus *audio snippets*.
4. **Read and fix**: a transcript viewer with speaker labels and timestamps, click-to-seek, the current line highlighted during playback, inline edits, reassigning a line to another speaker. This is the brief's "transcript viewer" and the main new component.
5. **Export**: Markdown (today) or other formats.

**How it could be served** (Phase 4 decides; the brief says don't force it):

| Option | How | For | Against |
|---|---|---|---|
| A. Local FastAPI + Preact, like Masterz | `transcribz serve` → 127.0.0.1, built `web/dist` | proven in Masterz; same mental model; Python keeps the ML | two toolchains in one repo |
| B. CLI writes a static HTML viewer | after the run, `--html` writes a self-contained page next to the `.md` | zero server; uses only the **tokens + css** layers, the perfect proof of CSS-first | read-only: no naming step or editing unless data round-trips |
| C. A + B | serve for the workflow; static export for sharing | best of both | more surface |

Any interactive option needs a **progress channel**, because runs take minutes. Masterz polls every second (`App.tsx:84-96`); [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) would fit better. That is a Phase 4 point.

## 10. Challenges to what exists

1. **"Thin outline" vs AA.** The identity is ink at 30%. Keep the *feel* with a 1px or 1.5px line, but at ≥3:1 for anything interactive (ink at about 55–60% on these grounds, to be computed in Phase 3), and keep 30% for dividers only.
2. **Game names as API.** `ground`, `felt` and `hunter` belong in the AD theme, not in the core. The core needs role-based names.
3. **Phone mode by root class.** About 120 `.phone` / `.phone.portrait` descendant selectors form a second stylesheet per component. Mode tokens (sizes switching under `.phone`) and container queries would remove most of them.
4. **Themes are hand-picked, not system-aware.** AD has 4 manual themes, Masterz is light only. The brief requires light and dark from day one through `prefers-color-scheme`. Proposal for Phase 3: every theme defines a light *and* a dark mode, and AD's Casino becomes the dark mode of a "game" theme rather than a separate theme.
5. **Free name colours.** Any user-picked colour used as text or outline will sometimes fail. Options:
   - a curated palette of AA-safe hues per theme (my recommendation);
   - auto-adjusting lightness;
   - keeping the free choice and using colour only as a dot, never as text.

   This is an owner decision in AD, so it's yours to reopen.
6. **Coverage vs bundle size.** AD ships about 67 KB gzip of JS in one chunk, with `canvas-confetti` imported statically for a winner-only moment. BeastUI must be tree-shakeable per component (Phase 4), and the playful layer must be split so Masterz never pays for it. Proposal: a bundle budget per package in CI from v0.1, as the brief already asks.
7. **Behaviour duplicated with no primitive.** Six Escape listeners and no focus restore is a sign that "styles only" sharing would not be enough. The Preact layer is earned, but kept thin by native elements (§5).

## 11. Release slicing

Brief: v0.1 = tokens + ~15 primitives + docs site + Masterz migrated.

**Confirmed: Masterz first.**
- It is one stylesheet with 7 tokens, light only, desktop only, and used by one person, so migration risk is lowest.
- AD has 4 themes, 3 phone layouts, live multiplayer and the playful layer. Migrating it first would make v0.1 huge.

**Challenged: "~15 primitives" can't migrate Masterz.** Its screens are built from:
- a **table**,
- a **drawer** (Guide and Settings panels),
- **progress** and a **veil**,
- a **popover** (crates per track),
- a **dropzone**,
- a **tree**,
- and two domain pieces: a **waveform player** and the **LoudnessLine**.

In the brief, tables, drawers, progress and dropzones are composites (v0.2), and media is v0.3.

| Option | v0.1 contains | Masterz in v0.1 | Cost |
|---|---|---|---|
| a. Keep the slicing, partial migration | tokens + 15 primitives | shell, toolbar, buttons, inputs, tags only; the rest keeps local CSS on BeastUI tokens | weak case study; the "before/after" barely shows |
| **b. Pull 4 composites forward (recommended)** | tokens + about 12 primitives + **table, drawer, progress, popover** | every screen except tree, player and LoudnessLine, which stay app code styled with BeastUI tokens until v0.3 media | v0.1 a bit larger, but all 4 are mostly CSS (§5); a real case study |
| c. Start with Transcribz | tokens + what its 5 screens need | none | Transcribz has no UI yet: building the app and the system at once blurs which is being tested |

**Recommended v0.1 primitives**, chosen from Masterz's real usage, not the generic list:
- button, icon button, segmented control, text input, number field, checkbox, select, tag/badge, tooltip, spinner, divider, kbd
- **plus** table, drawer, progress, popover

Tree, tabs, toast and dialog follow in v0.2 with AD. Masterz's tree waits for v0.2.

## 12. Keep / rebuild / drop

| Keep (as a seed or idea) | Rebuild | Drop |
|---|---|---|
| Colour vocabulary + paper warmth | Control-border and selection tokens (≥3:1) | Game-specific names in the core |
| Outline-only restraint, Inter Tight + Outfit | Button size scale + hover/active states | `.phone` descendant override sheets |
| AD `[data-theme]` on any element (swatches preview themselves) | Overlays → one dialog/sheet/drawer (from `Frame`'s API, native `<dialog>`) | Hand-copied JS↔CSS durations |
| `Frame`'s 3-kind API | Tooltip / popover (×3 → 1) | Opacity as a disabled or missing *text* treatment (fails contrast) |
| `Card`, `Avatar`, `Name`, `Flights` + reduced motion, pure `layout.ts`, `useLongPress` | Progress (×3 → 1, `role=progressbar` / `<progress>`) | Georgia for the info glyph |
| Masterz `--row` rhythm, felt row, full-bleed table | Icon buttons (×11 → 1) | |
| `LoudnessLine`, the veil pattern, `.seg` with `aria-pressed` | Tabs and tree with real keyboard models | |
| `api.ts` `call<T>` (app code, not BeastUI) | CSS load order → cascade layers | |
| `--impact` (JS → CSS variable) pattern | Waveform player (keyboard, perf) | |

## 13. Open questions for Phase 2

1. Outline weight and contrast: how do Geist, Linear and Radix Colors reach 3:1 borders without looking heavy?
2. Theming: data-attribute themes × light/dark modes. How do Radix Themes, Geist and Ark UI structure the axes (accent × gray × radius × scaling)?
3. Native-first behaviour: what do current systems build on `<dialog>`, `popover` and anchor positioning, and what still needs JS?
4. Docs sites that are themselves the showcase: nuda.studio for feel, and the Geist, Radix and Ark docs for structure.
5. Playful layers done well: how far can colour and motion go before the family resemblance breaks?
6. Name: "BeastUI" is the working name. Phase 3 will test it against the brief's "calm, restraint, outlined", and against the existing `beast-ui` package on npm (v8.1.15). `beastui` and the `@beastui` scope are free today.

## 14. Rendered screens

46 captures in [`audit/`](audit/). They double as the "before" images for the case studies.

**How they were taken (2026-11-18).**
- Tool: [playwright-cli](https://github.com/microsoft/playwright-cli), headless Chromium.
- AD at `9dfc296` plus the same uncommitted changes as §2 (the only new commit since the audit touches `CLAUDE.md`). Run with `--dev` on a throwaway database (`DATABASE_PATH`), one test account and four bots, through one full game.
- Masterz at `5a86422` (same: only `CLAUDE.md` changed). Front end only, on a fake API serving invented tracks, so no real library data. See bug 9 for why its own `npm run dev` could not be used.
- File names read `app-theme-width-step-screen.png`, for example `ad-casino-390-11-table-myturn.png`.

**What the screens confirm**, measured in the running apps rather than read in the code:
- **Bug 1 (AD cascade).** In the upright lobby, "Start game" measures **52px at weight 500**, where `lobby.css:641-647` asks for 60px at 600 (`ad-lin-390-09-lobby-full.png`).
- **Bug 2 (Masterz breakpoints).** At 390px the stacked sidebar stays **200px wide**, and the table is clipped on the right (`mz-390-02-table.png`).
- **No focus restore.** After closing Profile, Settings or Rules with Escape, `document.activeElement` is `<body>`. When the AD end modal (`aria-modal`) opens, focus stays on `<body>` too, and the chat input outside it remains usable (`ad-lin-1440-17-end.png`).
- **Veil without `inert`.** While Masterz masters, 61 buttons behind the veil stay enabled and reachable by keyboard (`mz-1440-10-veil-job.png`).
- **Selection = hover.** Selected rows, the hovered row and the expanded row share one felt tint (`mz-1440-03-selected-hover.png`, `mz-1440-06-player.png`).
- **Faint outlines.** The turn outline around the player's hand and the hovered target's dashed outline are hard to see, on Casino as on Lin (`ad-casino-1440-13-table-hover-hint.png`, `ad-lin-844-11-table.png`).
- **Two progress styles in one screen.** The veil's bar and the crate's thin underline appear together (`mz-1440-11-analysis-veil.png`).
- **The same tabs, two looks.** Desktop tabs are underlined (`ad-lin-1440-04-profile.png`). The phone menu sheet draws them as a segmented control (`ad-lin-390-15-menu-sheet.png`).

**New findings**
- **Bug 9: Masterz `npm run dev` serves a blank page.** `vite.config.ts` proxies `'/api'`, and Vite matches string keys by prefix ([docs](https://vite.dev/config/server-options#server-proxy)). So the module `/api.ts` is sent to the backend too. FastAPI's catch-all route answers with `index.html`, and the browser refuses to run it as a module. The fix is the key `'/api/'`. It is a one-line change in Masterz, not done here.
- **Masterz: Escape does not close the Guide or Settings panel.** Only "Close" or the toggle does.
- **Masterz: the Settings checkbox is browser blue.** `accent-color: var(--ink)` is scoped to the table (`styles.css:443`), so the panel's checkbox falls back to the browser's default blue (`mz-1440-08-settings.png`).
- **AD: the phone and desktop versions of a screen are two designs, not one layout.**
  - The desktop lobby is flat rows on lines. The phone lobby is rounded felt cards, a dashed "Add bot" tile and a disclosure row (`ad-lin-1440-09-lobby-full.png` vs `ad-lin-390-09-lobby-full.png`).
  - The language switch reads "EN / FR" on desktop and "English / Français" on phone.
  - The same panel is titled "Menu" on desktop and "Settings" on phone.

  This strengthens §10.3: the system needs responsive components, not a second stylesheet per mode.
- **AD: the portrait status overlaps the discard pile.** "Your turn · Pick a player" runs under the 2♦ (`ad-lin-390-11-table.png`).
- **Faded text, again.** Disabled options ("2 decks", the phone damage preference) and the chat's older lines are drawn with opacity and fall below 4.5:1 (`ad-lin-390-14-chat-sheet.png`, `ad-lin-390-06-settings.png`). This is the "opacity as disabled text" row of §12.
- **AD: the modal has a soft drop shadow.** This contradicts the "no shadows" restraint found everywhere else (`ad-lin-1440-04-profile.png`). Phase 3 should decide whether elevation gets a token or a line.
