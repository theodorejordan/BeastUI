// The BeastUI docs (decision 0008): static Astro pages, Preact islands only where behaviour is
// shown, styled with @beastui/css. In the workspace, the packages are read from their src/
// (decision 0003), so the docs also test the unbuilt path through Vite.
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';

export default defineConfig({
  // On GitHub Pages the site lives under /BeastUI/: the docs workflow passes the origin and the
  // path from actions/configure-pages. Locally (dev, preview, e2e) both stay unset: served at /.
  site: process.env.DOCS_SITE || undefined,
  base: process.env.DOCS_BASE || undefined,
  integrations: [preact(), mdx()],
  markdown: {
    // Shiki's themes bring their own colours. Until a theme drawn from the tokens exists, code
    // blocks are plain text styled by docs.css.
    syntaxHighlight: false,
  },
});
