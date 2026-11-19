import { defineConfig } from 'vite';

// Same setup as Masterz (web/vite.config.ts): Preact's JSX through oxc, no plugin.
export default defineConfig({
  root: 'src',
  oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
  build: { outDir: '../dist', emptyOutDir: true },
});
