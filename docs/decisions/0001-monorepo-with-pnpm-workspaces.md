# 0001. Monorepo with pnpm workspaces

- **Status:** Accepted (2026-11-19)
- **Date:** 2026-11-19

## Context

BeastUI ships three packages (tokens, CSS, Preact) and a docs site, and they change together: a new component touches all four. Every maintained UI library surveyed in [03-architecture.md §2](../ui-system/03-architecture.md) that ships JS is a workspace monorepo. Radix, shadcn, Zag and Chakra use pnpm. Only Radix Themes and shadcn add Turborepo, both with far more code than BeastUI.

Radix once published about sixty packages, one per component, and spent years fixing version mismatches between them. It now pushes a single umbrella package.

## Decision

This repo becomes the system's repo. It is a pnpm workspace with `packages/tokens`, `packages/css`, `packages/preact` and `apps/docs`. Tasks run with `pnpm -r`; there is no Turborepo. Game components join later as `packages/game`.

## Consequences

- One pull request can change a token, its CSS, its Preact wrapper and its docs page together.
- pnpm's strict `node_modules` catches undeclared dependencies before users do. `minimumReleaseAge` delays brand-new dependency versions.
- One more tool than AD and Masterz, which use npm.
- Four packages, not forty: few enough to version together (see 0007).

## Alternatives

- **npm workspaces:** no new tool, but looser `node_modules` and no release-age guard.
- **Turborepo or Nx on top:** caching pays off at dozens of packages, not four.
- **A single `beastui` package with subpaths:** simplest, but a CSS-only consumer would install the Preact code, and the brief wants each layer usable alone.
