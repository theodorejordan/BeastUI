# 0009. CI quality gates

- **Status:** Accepted (2026-11-19)
- **Date:** 2026-11-19

## Context

The brief requires tests, accessibility checks (axe), visual regression and a bundle-size budget in CI. In the survey:
- most libraries run unit tests and some use axe;
- only Radix runs visual regression: Chromatic, or free Playwright screenshots on a pinned OS;
- **none checks bundle size**.

Playwright warns that screenshots differ across operating systems. Its fix is a pinned Docker image. Argos and Chromatic are free up to 5,000 screenshots a month.

The Phase 3 preview already computes contrast ratios from live tokens.

## Decision

Every push runs:
1. **quality**: typecheck, lint, Vitest unit tests, build.
2. **package**: `npm pack`, install the tarball, import every entry point; publint and "Are the types wrong?" on the `exports` map.
3. **browser**: Playwright against the docs build, with keyboard e2e tests, **axe** (WCAG 2.1 AA) on every component page, and **`toHaveScreenshot`** for every component in every theme × mode, run in the pinned Playwright Docker image.
4. **contrast**: every required token pair, in every theme and mode, must meet its ratio.
5. **size**: a **size-limit** budget per package, set from the first real build.

## Consequences

- A theme that breaks 3:1, or a change that bloats AD's bundle, fails before release.
- Screenshots stay free, with no monthly cap; baselines are updated in the Docker image, not on a laptop.
- About 180 screenshots per run at 30 components: CI time grows with the system and must be watched.
- axe catches only part of WCAG; keyboard e2e and manual checks remain necessary.

## Alternatives

- **Argos or Chromatic:** a review UI and no flakiness to manage, but a 5,000-screenshot monthly cap on free plans (about 25 runs).
- **No visual regression** (most surveyed libraries): cheaper, but the brief requires it, and themes make silent regressions likely.
