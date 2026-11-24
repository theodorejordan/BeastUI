# 0008. Docs on Astro, hosted on GitHub Pages

- **Status:** Accepted (2026-11-19)
- **Date:** 2026-11-19

## Context

- The owner chose plain Astro over Starlight in Phase 2: the docs' chrome must be built with BeastUI itself.
- **Astro 7** is current, and `@astrojs/preact` supports **Preact 11** officially since 6.1.0.
- The docs are a static site.
- GitHub Pages is free for public repos only; a private repo needs a paid plan. BeastUI is private until v0.1.
- Fly.io (AD's host) runs servers and has no free allowance for new accounts. Netlify's free plan pauses all sites when its credits run out. Vercel Hobby is non-commercial only. Cloudflare Workers static assets are free and work with private repos.
- daisyUI and Mantine host their docs on GitHub Pages.

## Decision

The docs live in `apps/docs`, built with **Astro 7** and MDX, with Preact islands only where behaviour is shown, styled with `@beastui/css`. They deploy to **GitHub Pages** from GitHub Actions, starting at v0.1, the day the repo goes public. Until then they run locally.

## Consequences

- No server, no bill, no extra account.
- Static pages ship no framework JS by default; the docs prove the CSS-only path.
- No public docs before v0.1. If needed earlier, Cloudflare Workers is the fallback.
- No surveyed library uses Astro, so there is no template to copy; the docs are built alongside the first components.

## Alternatives

- **Starlight:** faster to start, but its own look would compete with BeastUI's.
- **Next.js** (7 of 11 surveyed libraries): powerful, but a React framework for a Preact system.
- **Cloudflare Workers static assets:** free now, private repos included, but one more account and service.

## Update (2026-11-24)

The repo went public at 0.0.2, before v0.1: the packages are already public on npm, so keeping the source private hid nothing, and a public docs site helps the Masterz rewrite. `.github/workflows/docs.yml` deploys the docs on every push to main, at https://theodorejordan.github.io/BeastUI/. The site follows main, not npm. A secret scan of the whole history (gitleaks) found nothing before the switch.
