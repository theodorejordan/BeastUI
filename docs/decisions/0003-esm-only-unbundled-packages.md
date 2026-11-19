# 0003. ESM-only, unbundled packages built with tsdown and Lightning CSS

- **Status:** Accepted (2026-11-19)
- **Date:** 2026-11-19

## Context

- Preact 11 dropped its CommonJS build ([upgrade guide](https://preactjs.com/guide/v11/upgrade-guide/)). shadcn and daisyUI already ship ESM only.
- Tree-shaking in surveyed libraries comes from keeping one output file per module, with `sideEffects` declared.
- tsup, the most common library bundler, now says in its README that it is not actively maintained and points to tsdown. Vite's docs also point libraries to tsdown or Rolldown. Zag builds with tsdown; Mantine moved to Rolldown.
- For CSS, BeastUI writes standard modern CSS (nesting, layers, `light-dark()`). Pico, built on Sass with hundreds of prebuilt variants, was archived in 2026 for exactly that maintenance cost.

## Decision

- Packages are **ESM only**, unbundled, with an `exports` map listing `types` first and one subpath per component.
- TypeScript is built with **tsdown**, version pinned.
- CSS is bundled and minified with **Lightning CSS**, targeting the browser floor in 0005. No Sass, no PostCSS chain.
- `@beastui/css` ships a full bundle, one file per component, and the tokens alone.
- In the workspace, packages point at `src/`. `publishConfig` swaps in `dist/` at publish, so development needs no build step.

## Consequences

- Half the build matrix of dual ESM/CJS packages.
- AD can import only the CSS of the components it uses, which matters on phones.
- tsdown is 0.x: upgrades are deliberate and checked by the package tests in 0009.
- Old CommonJS-only tools can't `require()` BeastUI. None of the consumers is one.

## Alternatives

- **ESM + CJS:** the majority still does it, but it would serve no Preact 11 user.
- **Vite library mode:** it is the apps' tool, but it doesn't emit `.d.ts`, so it needs tsc alongside.
- **PostCSS with plugins:** flexible, but a chain of plugins doing what one tool does.
