# UI System — Architecture

Phase 4 of the [brief](BRIEF.md). The direction and the name were chosen in Phase 3 ([proposals §14](02-proposals.md)): the synthesis (core Paper & Ink, a `tool` layer, a playful layer), named **BeastUI**, published under `@beastui`.

This document decides how BeastUI is built, shipped and checked. For each topic it gives two options and one recommendation. Every recommendation also has a decision record in [`docs/decisions/`](../decisions/), written so the owner can explain and defend it.

**Status: accepted by the owner on 2026-11-19 (§15).** Facts were checked on 2026-11-19. Library internals were read directly from their repos, and tool versions and prices from the npm registry and official docs. Anything not verified is marked **[unverified]**.

## 1. TL;DR

| Topic | Recommendation | Decision record |
|---|---|---|
| Repo | This repo becomes the system's repo. A **pnpm workspace**: `packages/tokens`, `packages/css`, `packages/preact`, `apps/docs`. No Turborepo. | [0001](../decisions/0001-monorepo-with-pnpm-workspaces.md) |
| Layers | The brief's three layers stand: tokens, CSS, Preact. Game components go in a fourth package later (`@beastui/game`, v0.2). | [0002](../decisions/0002-css-first-layered-packages.md) |
| Format | **ESM only**, unbundled (one file per module), `exports` with types first. CSS ships as one bundle, per component, and tokens alone. | [0003](../decisions/0003-esm-only-unbundled-packages.md) |
| Build | **tsdown** for TypeScript, **Lightning CSS** for CSS. No Sass, no PostCSS chain. | [0003](../decisions/0003-esm-only-unbundled-packages.md) |
| Tokens | A **DTCG 2025.10** JSON source, built with **Terrazzo**, emitting CSS variables, JSON and TS constants. | [0004](../decisions/0004-dtcg-tokens-built-with-terrazzo.md) |
| Browsers | **Safari 17.5+** and matching evergreen browsers. `light-dark()` and cascade layers are used directly. No anchor positioning or `<dialog closedby>` in v0.1. | [0005](../decisions/0005-browser-support-floor.md) |
| Preact | **Own primitives** on native elements, with Zag as an escape hatch for the few complex widgets. Preact 11 only. | [0006](../decisions/0006-own-preact-primitives.md) |
| Release | **Changesets**, one shared version for all packages, **npm trusted publishing** from GitHub Actions. | [0007](../decisions/0007-changesets-and-trusted-publishing.md) |
| Docs | **Astro 7** with Preact islands, in `apps/docs`, styled with BeastUI itself. **GitHub Pages**, live at v0.1 when the repo goes public. | [0008](../decisions/0008-docs-on-astro-and-github-pages.md) |
| CI | Typecheck, unit tests, a **packed-package test**, Playwright e2e with **axe**, **Playwright screenshots** in a pinned Docker image, a **contrast test** for every theme × mode, and a **size budget**. | [0009](../decisions/0009-ci-quality-gates.md) |

## 2. How the popular libraries are built

The owner asked to learn from the most popular UI libraries and do the same. So before any choice, here is how eleven of them are actually built, read from their repos on 2026-11-19.

| Library | Workspace tool | JS build | Module format | CSS | Release | Visual regression | Docs |
|---|---|---|---|---|---|---|---|
| [Radix Primitives](https://github.com/radix-ui/primitives) | pnpm, no runner | esbuild (+ tsup for types) | ESM + CJS | none (unstyled) | Changesets, OIDC + provenance | Chromatic | Next.js, other repo |
| [Radix Themes](https://github.com/radix-ui/themes) | pnpm + Turborepo | esbuild + tsc | ESM + CJS | plain CSS + PostCSS, split files + bundle | manual tag → `--provenance` | Playwright screenshots | Next.js, other repo |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | pnpm + Turborepo | tsup | **ESM only** | Tailwind v4, copied into user projects | Changesets, OIDC | none | Next.js + Fumadocs |
| [daisyUI](https://github.com/saadeghi/daisyui) | Bun | none (plain JS) | ESM only | Tailwind compile + Lightning CSS, nested `@layer`, per component + bundle | conventional commits, npm token | none | SvelteKit static, GitHub Pages |
| [Ark UI](https://github.com/chakra-ui/ark) | Bun | Vite library mode | ESM + CJS | none (headless) | Changesets, OIDC [inferred] | none | Next.js |
| [Zag](https://github.com/chakra-ui/zag) | pnpm | **tsdown** | ESM + CJS | none (data attributes) | Changesets, npm token | none | Next.js |
| [Chakra v3](https://github.com/chakra-ui/chakra-ui) | pnpm | Rollup + esbuild | ESM + CJS | CSS-in-JS runtime | Changesets, one shared version | none | Next.js |
| [Mantine](https://github.com/mantinedev/mantine) | Yarn 4 | Rolldown | ESM + CJS | CSS Modules + PostCSS, per component + bundle + `@layer` variant | custom scripts, OIDC + provenance | none | Next.js static, GitHub Pages |
| [Headless UI](https://github.com/tailwindlabs/headlessui) | npm | esbuild (bash) | ESM + CJS | none | manual tag, OIDC + provenance | none | other repo |
| [Open Props](https://github.com/argyleink/open-props) | single package | custom generator | ESM + CJS | PostCSS, per group + bundle | `npm version`, npm token | none | Vite |
| [Pico](https://github.com/picocss/pico) | single package | — | CSS only | Sass, 239 prebuilt files | manual | none | — |

**What they agree on**
1. **One repo with workspaces.** Every maintained library that ships JS is a workspace monorepo. Most run tasks with `pnpm -r` and no task runner; only Radix Themes and shadcn add Turborepo.
2. **Scoped names, and fewer packages than before.** `@radix-ui/*` once had about sixty packages, one per component, which caused years of version mismatches. Radix now pushes a single umbrella package. Newer libraries ship a handful.
3. **Tree-shaking comes from file structure.** The output keeps one file per module (`preserveModules`, `unbundle`), with `sideEffects: false`, or `["*.css"]` when CSS ships in the package.
4. **`exports` maps with `types` first,** plus subpaths for each component.
5. **Source in development, built files at publish.** Each package points at `src/` while you work, and a publish step swaps in `dist/` (Radix with `publishConfig`, Ark and Zag with `clean-package`, Chakra with a `"dev"` export condition). No build step in the inner loop.
6. **Changesets for releases, and npm trusted publishing** (GitHub Actions OIDC, no stored token) is now common: Radix, shadcn, Mantine, Headless UI.
7. **Styled libraries ship CSS at several grains:** a full bundle, per-component files, and the tokens alone (Radix Themes, Mantine, daisyUI, Open Props). Mantine and daisyUI use `@layer` to make overrides predictable.
8. **Vitest or Jest for units, Playwright for the browser, axe for accessibility.**

**Where they disagree**
- **CommonJS.** shadcn and daisyUI ship ESM only; the others still ship both.
- **Build tool.** No winner. The most recent migrations (Zag, Mantine) moved to the Rolldown family.
- **Visual regression.** Only Radix does it: Chromatic for Primitives, free Playwright screenshots for Themes. **No library checks bundle size in CI.**
- **Token source.** CSS, TypeScript, JS or Sass. **None uses a DTCG file as its source.**
- **Docs.** Seven of eleven use Next.js. **None uses Astro.**

**Two warnings worth remembering**
- **Pico is archived** (its last commit is from 2026-10-04). Its author says staying relevant would have needed "plain modern CSS instead of Sass, built on … OKLCH colors, cascade layers, Popover, anchor positioning". That is BeastUI's stack, and the reason Pico stopped is the cost of a Sass build with hundreds of prebuilt variants for one maintainer.
- **Zag has a Preact adapter, but its CI never tests it.** End-to-end tests run on React only. If BeastUI ever leans on Zag, it must test the Preact side itself.

**Where BeastUI departs from the consensus, and why** (each departure is argued in its section):
- **DTCG source** (no precedent in this set): the brief asks for a JSON token source readable by any stack, and DTCG is the stable format for that.
- **Astro docs** (no precedent): decided in Phase 2, because the docs must be built with BeastUI itself and Astro ships no framework JS by default.
- **Size budget in CI** (nobody does it): the brief requires it, and AD is played on phones.
- **ESM only** (a minority): Preact 11 itself is ESM only, so CommonJS would serve nobody.

## 3. Repo and packages

The owner decided to keep this repo and make it public later.

**Option A — pnpm workspace (recommended)**

```
BeastUI/
├── packages/
│   ├── tokens/      @beastui/tokens   DTCG source → CSS variables, JSON, TS constants
│   ├── css/         @beastui/css      component classes, zero JS, cascade layers
│   └── preact/      @beastui/preact   thin wrappers: focus, keyboard, ARIA, positioning
├── apps/
│   └── docs/        the Astro docs site (not published to npm)
├── docs/            design docs (this folder) and decision records
├── .changeset/      pending release notes
└── pnpm-workspace.yaml
```

- `@beastui/game` (cards, seats, HUD) joins in v0.2 with AD. The playful layer stays a set of token values in `tokens`; game *components* live apart, so the "values only" rule stays enforceable (proposals §13).
- The Phase 3 `preview/` stays until the docs' "Design rationale" page exists, then goes away. Its screenshots are already in `docs/ui-system/proposals/`.

**Why pnpm and not npm workspaces?** AD and Masterz use npm, so npm would mean one tool less. But pnpm is what Radix, shadcn, Zag and Chakra use, for reasons that matter here:
- Its `node_modules` is strict: a package can't import a dependency it didn't declare. That catches a missing `peerDependency` before users hit it.
- The `workspace:` protocol links local packages explicitly.
- `minimumReleaseAge` delays brand-new dependency versions (shadcn waits 48 h). That is cheap supply-chain protection.

**Why no Turborepo?** Three packages and one app build in seconds. Turborepo earns its place with caching across dozens of packages; here it would be one more tool to learn and maintain.

**Option B — a single package, `beastui`, with subpaths** (`beastui/tokens.css`, `beastui/preact`). Simpler: one version, one build, one publish. But a server-rendered Python app that only wants the CSS would install the Preact code too, and the brief wants each layer usable alone. Option B fits a library that will never grow; BeastUI's roadmap is long.

## 4. Package format

**Option A — ESM only, unbundled (recommended)**
- `"type": "module"`, one output file per source module. `sideEffects: false` for `preact`; `["*.css"]` for `css`.
- An `exports` map with `types` first:

  ```json
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
    "./dialog": { "types": "./dist/dialog/index.d.ts", "default": "./dist/dialog/index.js" }
  }
  ```
- **`@beastui/css` ships three grains** (Radix Themes and Mantine do the same):
  - `beastui.css`: everything;
  - `components/button.css`, `components/table.css`…: one file per component, for apps that count bytes (AD on phones);
  - `tokens.css`, from `@beastui/tokens`, alone.
- **Everything is inside BeastUI's cascade layers by default.** Mantine ships a layered variant as an option; BeastUI's whole theming model depends on layer order (research §4), so layering is not optional. The one rule for apps: **app CSS that is not in a layer beats every layer.** That is the CSS spec, and the docs must say it on the install page.
- **Source in development:** packages point at `src/` inside the workspace, and `publishConfig` swaps in `dist/` at publish (the Radix way, built into pnpm, no extra tool).

**Option B — ESM + CommonJS.** The majority still does it. But **Preact 11 dropped its CommonJS build** ([upgrade guide](https://preactjs.com/guide/v11/upgrade-guide/)). A CommonJS `@beastui/preact` would require a Preact that doesn't exist. Doubling the build for nobody is pure cost.

## 5. Build tooling

**TypeScript → JS + types**

| | A. tsdown (recommended) | B. Vite library mode + tsc |
|---|---|---|
| What it is | The library bundler of the Rolldown project; tsup's designated successor | The apps' bundler, in library mode |
| Types | Built in (`dts`), fast with `isolatedDeclarations` | Not generated: needs `tsc` or a plugin |
| Who uses it | Zag (Mantine uses Rolldown directly) | Ark UI |
| Risk | Still 0.x (0.23.7) | Two tools to keep in step |

- **tsup is out**: its README now says it is not actively maintained and points to tsdown.
- **Vite's own docs** point to tsdown or Rolldown for libraries: "If you are building non-browser libraries, or require advanced build flows, you can use tsdown or Rolldown directly" ([Vite](https://vite.dev/guide/build#library-mode)).
- Because tsdown is 0.x, its version is pinned exactly and upgraded on purpose.

**CSS**

| | A. Lightning CSS (recommended) | B. PostCSS + plugins |
|---|---|---|
| What it does | Bundles `@import`, minifies, lowers syntax for the target browsers, all in one tool | Each job is a plugin: import, nesting, autoprefixer, a minifier |
| Who uses it | daisyUI (minify), the Vite ecosystem | Radix Themes, Mantine, Open Props |
| Fit | BeastUI writes standard modern CSS. One tool that knows the browser floor (§6) is enough. | Flexible, but a chain of plugins to keep in step |

**No Sass.** Pico is the cautionary tale: plain CSS with custom properties, layers and nesting now does what Sass was for.

## 6. Tokens

The brief asks for "CSS custom properties + JSON source", and the audit showed AD copies motion constants between JS and CSS by hand. So one source must feed three outputs: CSS variables, JSON, and TS constants.

**The source format: DTCG 2025.10.** The [Design Tokens Community Group](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) published its first stable format on 2025-10-28, with a **resolver** module that describes themes × modes. It is a Community Group report, not a W3C standard, but it is the only shared format, and design tools can read it.

**The builder**

| | A. Terrazzo (recommended) | B. Hand-written CSS + a small script |
|---|---|---|
| Reads DTCG 2025.10 with resolvers | Yes, since 2.4.0 ([guide](https://terrazzo.app/docs/guides/resolvers/)) | — (the source is CSS) |
| CSS output for theme × mode | `plugin-css` with permutations: `:root`, `[data-theme]`, `prefers-color-scheme` | written by hand, as in the preview |
| TS constants | `plugin-js` writes `.js` + `.d.ts` | the script parses CSS |
| JSON output | Only an experimental plugin, so BeastUI writes a small one | the script writes it |
| Risk | Effectively one maintainer | Everything is ours to maintain |

- **Style Dictionary 5** is the bigger project (three maintainers), but it **can't read resolver files yet**: the work is still an open issue ([#1590](https://github.com/style-dictionary/style-dictionary/issues/1590)). For BeastUI, theme × mode is the whole point, so it is out for now.
- **Option B is what Radix Themes and daisyUI do** (CSS is the source). It works, but it gives up the JSON source the brief asks for, and every new output means more script.
- **Why the one-maintainer risk is acceptable.** The source is a standard file. If Terrazzo stalls, the JSON stays valid, and Style Dictionary (once it supports resolvers) or a script can read it. **The format is the commitment, the builder is replaceable.**
- **One limit:** `light-dark()` pairs in one declaration (decision 0005) are not something a builder emits by default. The CSS plugin will either output `light-dark()` or one block per mode. This gets settled in the first Phase 5 commit, with the preview's CSS as the expected output.

## 7. CSS-first layering in practice

This is the brief's central principle: a non-Preact app gets most of the system from the first two layers.

**Layer order, declared once in `beastui.css`:**

```css
@layer beast.reset, beast.tokens, beast.themes, beast.voice, beast.base, beast.components, beast.utilities;
```

- An app puts its own CSS in a later layer (`@layer app`) or leaves it unlayered on purpose to override.
- The preview proved the model: one markup, one component stylesheet, and themes that are only token values.

**The attributes an app sets on `<html>` (or any element, they nest):**

| Attribute | Values | Default |
|---|---|---|
| `data-theme` | `tool`, `playful` | the core |
| `data-mode` | `light`, `dark` | follows the system (`prefers-color-scheme`) |
| `data-case` | `sentence`, `lower` | follows the theme (`tool` is lowercase) |
| `data-density` | `compact`, `touch` | later, when an app needs it |

**Class names.** Components use the prefix `b-` from the preview (`.b-btn`, `.b-table`). It is short, and cascade layers already isolate BeastUI's rules. The longer `beast-` would be safer against collisions but noisy in markup. Chosen by the owner (§15).

**What the Preact layer adds, and only that:** roving focus (tabs, menus, tree), positioning, focus return, live regions, media keyboard models. Everything visual stays in CSS, driven by `data-*` and ARIA state, so a server-rendered page can reproduce it.

## 8. The Preact layer

**Option A — own primitives on native elements (recommended, research §5).**
- `<dialog>`, the Popover API and `<details>` do most of the hard work; the Preact code adds focus management, keyboard models and ARIA wiring.
- **Preact 11 makes wrappers simpler:** `ref` is a regular prop, so no `forwardRef` ([upgrade guide](https://preactjs.com/guide/v11/upgrade-guide/)).
- Peer dependency: `preact ^11`.
- **Escape hatch:** for the few widgets where a state machine pays off (combobox, date picker), use the matching [Zag](https://github.com/chakra-ui/zag) machine through `@zag-js/preact`, and test it ourselves (§2: Zag's CI doesn't).

**Option B — Zag for every interactive component.** Proven machines, one model for everything. But each widget pulls in Zag's core, which works against the size budget on phones. And the Preact adapter is the least tested part of Zag.

## 9. How apps consume BeastUI

| App | How |
|---|---|
| **AD, Masterz** (Vite + Preact) | `npm install @beastui/css @beastui/preact`; import `@beastui/css/beastui.css` (or per-component files) in the entry, and components from `@beastui/preact`. |
| **Masterz served by FastAPI** | Nothing special: FastAPI serves `web/dist`, which Vite built with BeastUI inside. |
| **Transcribz, or any server-rendered HTML with no bundler** | **A.** A `<link>` to the CSS on a CDN. jsDelivr serves any npm package by version: `https://cdn.jsdelivr.net/npm/@beastui/css@0.1/dist/beastui.css`. **B.** Vendor the file into the app's static folder with a small copy script, so it works offline and with no third party. Recommended: **B for local tools** (Transcribz runs on the owner's machine), A for quick prototypes. |
| **A future non-Preact app** (React, Svelte, plain JS) | The tokens and CSS layers work as is. Behaviour comes from native elements, and the docs give the ARIA pattern for each component. |

## 10. Versioning and release

**Option A — Changesets, one shared version (recommended)**
- Each pull request that changes a package adds a small note (`pnpm changeset`). At release time, Changesets bumps versions and writes the changelogs.
- **One version for every `@beastui/*` package** (Changesets' `fixed` group, as Chakra does). An app never has to wonder whether `css@0.3` works with `preact@0.2`. The cost: a package can get a new version with no change of its own.
- Before 1.0, a **minor** bump (0.1 → 0.2) may break things, and a patch never does. That is how semver treats 0.x, and the brief's releases (v0.1, v0.2, v0.3) already follow it.
- **Publishing:** `changesets/action` on GitHub Actions, with **npm trusted publishing**. GitHub proves its identity to npm with short-lived OIDC credentials, so no npm token is stored anywhere ([npm docs](https://docs.npmjs.com/trusted-publishers)). Generally available since July 2025.
- **Steps the docs don't spell out:**
  1. **Create the `@beastui` npm org now**, free for public packages ([npm](https://docs.npmjs.com/creating-an-organization)), to secure the name.
  2. The **first publish of each package is manual** (a placeholder), and the trusted publisher is attached after. shadcn documents the same trap.
  3. **Provenance** (a public, signed link from the package to the commit that built it) only works from a **public** repo. One more reason to go public at v0.1.

**Option B — manual tags and a hand-written changelog** (Radix Themes, Headless UI). Fewer tools. But the changelog depends on memory, and the brief asks for a changelog per release.

## 11. Docs site

The owner chose plain Astro over Starlight in Phase 2. Facts checked now:
- **Astro 7** (since 2026-06-22) runs on Vite 8 ([blog](https://astro.build/blog/astro-7/)).
- **`@astrojs/preact` supports Preact 11 officially** since 6.1.0 ([changelog](https://github.com/withastro/astro/blob/main/packages/integrations/preact/CHANGELOG.md)). Research §8 had marked this as unverified; it is now confirmed.
- Pages are written in MDX. Live examples are Preact islands; static examples are plain HTML using `@beastui/css`, which shows the CSS-only path at the same time.
- Search: a static index built at build time, so no server and no third party. Pagefind is the usual choice for Astro sites **[unverified: to check in Phase 5]**.

**Hosting**

| | A. GitHub Pages (recommended) | B. Cloudflare Workers static assets |
|---|---|---|
| Cost | Free **for public repos**; a private repo needs a paid GitHub plan ([docs](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)) | Free, unlimited static requests ([pricing](https://developers.cloudflare.com/workers/platform/pricing/)) |
| Private repo now | No | Yes |
| Custom domain + HTTPS | Yes | Yes, with the domain on Cloudflare |
| Extra account | No | Yes |
| Who does it | daisyUI, Mantine | Mantine's help centre (Cloudflare Pages) |

**Recommended: A, live at v0.1, the same day the repo goes public.** Until then the docs run locally (`pnpm --filter docs dev`). Fly.io, AD's host, was checked and set aside: it runs servers, the docs are static files, and new accounts no longer get a free allowance. Netlify's free plan now pauses every site when its monthly credits run out, and Vercel's Hobby plan is for non-commercial use only.

## 12. CI: the quality gates

The brief requires tests, axe, visual regression and a bundle budget in CI. The survey shows that most libraries do less. Here is a set that stays free and maintainable for one person.

| Workflow | Runs on | What |
|---|---|---|
| **quality** | every push | typecheck, lint, Vitest unit tests, build |
| **package** | every push | `npm pack`, then install the tarball and import every entry point (daisyUI and Mantine do this). Plus [publint](https://publint.dev/) and [Are the types wrong?](https://arethetypeswrong.github.io/) on the `exports` map (Headless UI uses the latter). |
| **browser** | every push | Playwright against the docs build: keyboard e2e, **axe** on every component page (WCAG 2.1 AA tags), and **screenshots** of every component in every theme × mode |
| **contrast** | every push | the preview's `contrast.ts` turned into a test: every required pair, in every theme and mode, must meet its ratio. A theme that breaks 3:1 fails the build. |
| **size** | every push | a budget per package. Fails when a package grows past it. |
| **release** | `main` | Changesets: open the release PR, publish when it is merged |
| **docs** | release | build and deploy the docs |

**Visual regression**

| | A. Playwright `toHaveScreenshot` (recommended) | B. Argos or Chromatic |
|---|---|---|
| Cost | Free | Free up to 5,000 screenshots a month ([Argos](https://argos-ci.com/pricing), [Chromatic](https://www.chromatic.com/pricing)) |
| Flakiness | Font rendering differs by OS. Fix: generate and compare inside the pinned Playwright Docker image ([docs](https://playwright.dev/docs/docker)) | Handled by the service |
| Review | Diffs as CI artifacts | A web UI to approve changes |
| Who does it | Radix Themes | Radix Primitives (Chromatic) |

At about 30 components × 3 themes × 2 modes, that is roughly 180 screenshots per run. 5,000 a month would last about 25 runs. Option A has no such ceiling.

**Size budget.** Two tools are maintained today: [size-limit](https://github.com/ai/size-limit) (one caveat: its default bundler skips CSS, so CSS entries are measured as plain files) and [bundlewatch](https://github.com/bundlewatch/bundlewatch). Recommended: **size-limit**, for its per-entry budgets. Starting budgets get set from the first real build in Phase 5, not guessed now.

## 13. What this costs, honestly

- **More tools than AD or Masterz:** pnpm, tsdown, Lightning CSS, Terrazzo, Changesets, Playwright, size-limit. Each one replaces hand work the brief asks for (changelogs, budgets, checks), and each has a decision record that says why.
- **Two young dependencies:** tsdown (0.x) and Terrazzo (one maintainer). Both are pinned, and both are replaceable because they sit behind standard inputs (TypeScript, DTCG JSON).
- **No precedent for DTCG + Astro + Preact together.** The survey has no template to copy for that combination, so Phase 5 starts with a thin end-to-end slice: one token, one component, one docs page, published as `0.0.x`, before building wide.

## 14. Decision records

Written in [`docs/decisions/`](../decisions/), one page each, in [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions): context, decision, consequences. All were accepted by the owner on 2026-11-19.

| # | Decision |
|---|---|
| [0001](../decisions/0001-monorepo-with-pnpm-workspaces.md) | Monorepo with pnpm workspaces |
| [0002](../decisions/0002-css-first-layered-packages.md) | CSS-first, layered packages |
| [0003](../decisions/0003-esm-only-unbundled-packages.md) | ESM-only, unbundled packages built with tsdown and Lightning CSS |
| [0004](../decisions/0004-dtcg-tokens-built-with-terrazzo.md) | DTCG tokens built with Terrazzo |
| [0005](../decisions/0005-browser-support-floor.md) | Browser support floor: Safari 17.5 |
| [0006](../decisions/0006-own-preact-primitives.md) | Own Preact primitives, Zag as an escape hatch |
| [0007](../decisions/0007-changesets-and-trusted-publishing.md) | Changesets, one version, trusted publishing |
| [0008](../decisions/0008-docs-on-astro-and-github-pages.md) | Docs on Astro, hosted on GitHub Pages |
| [0009](../decisions/0009-ci-quality-gates.md) | CI quality gates |

## 15. Phase 4 decisions

Taken by the owner on 2026-11-19.

1. **All recommendations in §1 are accepted**, and decision records 0001–0009 move to Accepted.
2. **Class prefix: `b-`.**
3. **The `@beastui` npm org** is created by the owner on npmjs.com, to secure the name.

Next: Phase 5, starting with a thin end-to-end slice (§13).
