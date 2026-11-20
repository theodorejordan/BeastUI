// Builds @beastui/preact with tsdown (decision 0003): ESM only, one output file per source file
// (unbundle), declarations generated file by file by oxc. That works because the base tsconfig
// sets isolatedDeclarations, and it needs no TypeScript API (TypeScript 7 has none yet).
import browserslist from 'browserslist';
import { defineConfig } from 'tsdown';

// The browser floor lives once, in the workspace package.json (decision 0005). tsdown wants
// "safari17.5"-style targets: keep the lowest version of each browser.
const lowest = new Map<string, string>();
for (const entry of browserslist(undefined, { path: import.meta.dirname })) {
  const [name = '', version = ''] = entry.split(' ');
  const browser = name === 'ios_saf' ? 'ios' : name;
  const known = lowest.get(browser);
  if (!known || Number.parseFloat(version) < Number.parseFloat(known)) lowest.set(browser, version);
}

export default defineConfig({
  entry: ['src/index.ts', 'src/button.tsx'],
  format: 'esm',
  platform: 'browser',
  target: [...lowest].map(([browser, version]) => `${browser}${version}`),
  unbundle: true,
  dts: { generator: 'oxc' },
  // Peer dependencies (preact) stay imports by default: the app's copy is used, never ours.
});
