# Decision records

One page per significant decision, so each one can be explained and defended later (brief, "Quality bar"). The format is [Michael Nygard's](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions):

- **Status:** Proposed, Accepted, or Superseded by another record.
- **Context:** the forces at play, facts included.
- **Decision:** what we do, in one or two sentences.
- **Consequences:** what becomes easier, what becomes harder.
- **Alternatives:** what was set aside, and why.

A record is never edited after acceptance except for its status. A changed mind gets a new record that supersedes the old one.

| # | Decision | Status |
|---|---|---|
| [0001](0001-monorepo-with-pnpm-workspaces.md) | Monorepo with pnpm workspaces | Accepted |
| [0002](0002-css-first-layered-packages.md) | CSS-first, layered packages | Accepted |
| [0003](0003-esm-only-unbundled-packages.md) | ESM-only, unbundled packages built with tsdown and Lightning CSS | Accepted |
| [0004](0004-dtcg-tokens-built-with-terrazzo.md) | DTCG tokens built with Terrazzo | Accepted |
| [0005](0005-browser-support-floor.md) | Browser support floor: Safari 17.5 | Accepted |
| [0006](0006-own-preact-primitives.md) | Own Preact primitives, Zag as an escape hatch | Accepted |
| [0007](0007-changesets-and-trusted-publishing.md) | Changesets, one version, trusted publishing | Accepted |
| [0008](0008-docs-on-astro-and-github-pages.md) | Docs on Astro, hosted on GitHub Pages | Accepted |
| [0009](0009-ci-quality-gates.md) | CI quality gates | Accepted |

The full reasoning, with sources, is in [03-architecture.md](../ui-system/03-architecture.md).
