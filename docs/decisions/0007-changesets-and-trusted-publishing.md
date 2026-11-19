# 0007. Changesets, one version, trusted publishing

- **Status:** Accepted (2026-11-19)
- **Date:** 2026-11-19

## Context

- The brief asks for semver and a changelog entry per release.
- Changesets is the most common release tool in the survey (Radix, shadcn, Ark, Zag, Chakra). Chakra versions all its packages together (a `fixed` group).
- **npm trusted publishing** has been generally available since 2025-07-31 ([changelog](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)). GitHub Actions proves its identity with short-lived OIDC credentials, so no npm token is stored. Radix, shadcn, Mantine and Headless UI publish this way.
- Provenance (a signed link from the package to the commit) only works from public repos.
- npm orgs are free for public packages. Long-lived npm tokens are being phased out.

## Decision

- Each change to a package comes with a changeset. `changesets/action` opens a release PR, and merging it publishes.
- **All `@beastui/*` packages share one version** (a `fixed` group).
- Publishing uses **npm trusted publishing** from GitHub Actions, with no npm token. Provenance turns on when the repo goes public.
- The owner creates the `@beastui` npm org early, to secure the name. Each package's first publish is a manual placeholder, then the trusted publisher is attached.
- Before 1.0, a minor bump may break, and a patch never does.

## Consequences

- Changelogs are written at the time of the change, not reconstructed at release.
- Apps never pair mismatched versions (`css@0.3` with `preact@0.2`).
- A package can get a new version with no change of its own.
- No secret to leak or rotate.

## Alternatives

- **Independent versions per package:** more precise, but every consumer must track compatibility.
- **Manual tags and a hand-written changelog** (Radix Themes, Headless UI): fewer tools, but the changelog depends on memory.
- **semantic-release / conventional commits** (daisyUI): the release notes come from commit messages, which this repo writes for history, not for users.
