// Builds @beastui/tokens from the DTCG source in src/ (decision 0004).
//
// Output: dist/tokens.css (CSS variables) and dist/tokens.js + .d.ts (TS constants).
//
// Two things Terrazzo does not do out of the box, done here with its own permutation API:
//  1. light-dark(). The owner chose colour modes through `color-scheme` + light-dark() (research
//     §4, option A; decision 0005). Terrazzo writes one block per mode. So the dark permutation
//     runs first, emits nothing, and records each colour; the light one then writes the pair.
//  2. Themes as small overrides. A theme block lists only the tokens its file changes, not the
//     whole set again. data-theme works on any element, not only <html>: a part of the page can
//     take another theme (Radix Themes nests its <Theme> the same way).
import { readFileSync } from 'node:fs';
import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import js from '@terrazzo/plugin-js';
import { transformCSSValue } from '@terrazzo/token-tools/css';

/** Every token ID a DTCG file defines (keys that hold a $value), to scope a theme's block. */
function tokenIds(file) {
  const ids = [];
  const walk = (node, path) => {
    if (node && typeof node === 'object' && '$value' in node) {
      ids.push(path.join('.'));
      return;
    }
    for (const [key, child] of Object.entries(node ?? {})) {
      if (!key.startsWith('$')) walk(child, [...path, key]);
    }
  };
  walk(JSON.parse(readFileSync(new URL(`./src/${file}`, import.meta.url), 'utf8')), []);
  return ids;
}

// Variables share the class prefix: cascade layers isolate rules, not variable names.
const variableName = (token) => `--b-${token.id.replaceAll('.', '-')}`;

const darkColors = new Map();
// Aliases print as var(--b-…), which already follows the mode: only own values get a pair.
const isOwnColor = (token) => token.$type === 'color' && !token.aliasOf;
// A colour can come back as one string or as gamut variants; the '.' entry is the sRGB fallback.
const cssValue = (token, options) => {
  const value = transformCSSValue(token, options);
  return typeof value === 'string' ? value : value['.'];
};

export default defineConfig({
  tokens: ['./src/beastui.resolver.json'],
  outDir: './dist/',
  plugins: [
    css({
      filename: 'tokens.css',
      variableName,
      legacyHex: true, // #rrggbb(aa): the values people already know from the preview
      permutations: [
        {
          // 1. Dark: recorded, not printed.
          input: { mode: 'dark', theme: 'core' },
          transform(token, options) {
            if (isOwnColor(token)) darkColors.set(token.id, cssValue(token, options));
            return undefined; // Terrazzo's default; this block is not printed anyway
          },
          prepare: () => '',
        },
        {
          // 2. Light: every token, colours as light-dark(light, dark).
          input: { mode: 'light', theme: 'core' },
          transform(token, options) {
            if (!isOwnColor(token)) return undefined;
            const light = cssValue(token, options);
            const dark = darkColors.get(token.id);
            return dark && dark !== light ? `light-dark(${light}, ${dark})` : light;
          },
          // light-dark() needs color-scheme. The system follows the OS; data-mode forces a mode.
          // The mode is the page's, so color-scheme stays on :root. The tokens are declared again
          // on every [data-theme] element: an alias (--b-radius-control: var(--b-radius-2)) is
          // resolved where it is declared and inherited as a value, so a theme set on a part of
          // the page must re-declare it there to follow its own --b-radius-2 (MDN, "Using CSS
          // custom properties", inheritance).
          prepare: (contents) =>
            `@layer beast.tokens {\n  :root {\n    color-scheme: light dark;\n  }\n` +
            `  :root[data-mode='light'] {\n    color-scheme: light;\n  }\n` +
            `  :root[data-mode='dark'] {\n    color-scheme: dark;\n  }\n` +
            `  :root,\n  [data-theme] {\n    ${contents}\n  }\n}`,
        },
        {
          input: { mode: 'light', theme: 'tool' },
          include: tokenIds('theme.tool.tokens.json'),
          prepare: (contents) => `@layer beast.tokens {\n  [data-theme='tool'] {\n    ${contents}\n  }\n}`,
        },
        {
          input: { mode: 'light', theme: 'playful' },
          include: tokenIds('theme.playful.tokens.json'),
          prepare: (contents) => `@layer beast.tokens {\n  [data-theme='playful'] {\n    ${contents}\n  }\n}`,
        },
      ],
    }),
    js({ filename: 'index.js' }),
  ],
});

