// Checks the packages as npm will ship them (decision 0009, "package"):
//  1. pack each one with pnpm, which applies publishConfig (src/ → dist/) and workspace: ranges;
//  2. publint and "Are the types wrong?" on each tarball;
//  3. install the tarballs in an empty project and load every entry point.
// Run after `pnpm build`. Exits non-zero on the first failure.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const bin = (name) => join(root, 'node_modules', '.bin', name);
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });

const work = mkdtempSync(join(tmpdir(), 'beastui-pack-'));
const packages = ['tokens', 'css', 'preact'];
const tarballs = {};

try {
  for (const name of packages) {
    const dir = join(root, 'packages', name);
    execFileSync('pnpm', ['pack', '--pack-destination', work, '--silent'], { cwd: dir });
    const file = readdirSync(work).find((f) => f.startsWith(`beastui-${name}-`));
    tarballs[name] = join(work, file);

    console.log(`\n── @beastui/${name}: publint`);
    run(bin('publint'), ['run', tarballs[name], '--strict']);

    // Types of the JS entries. ESM only (decision 0003), so CommonJS resolution is not a goal.
    // CSS entries have no types to check: @beastui/css is skipped, tokens.css excluded.
    if (name !== 'css') {
      console.log(`── @beastui/${name}: are the types wrong?`);
      const css = name === 'tokens' ? ['--exclude-entrypoints', './tokens.css'] : [];
      run(bin('attw'), [tarballs[name], '--profile', 'esm-only', '--format', 'ascii', ...css]);
    }
  }

  console.log('\n── install the tarballs in an empty project and load every entry point');
  const app = join(work, 'app');
  mkdirSync(app);
  writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'smoke', private: true, type: 'module' }));
  run('npm', ['install', '--silent', '--no-audit', '--no-fund', ...Object.values(tarballs), 'preact@^11'], app);
  writeFileSync(
    join(app, 'smoke.mjs'),
    `import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PERMUTATIONS } from '@beastui/tokens';
import { Button } from '@beastui/preact';
import { Button as ButtonOnly } from '@beastui/preact/button';

const css = ['@beastui/tokens/tokens.css', '@beastui/css/beastui.css', '@beastui/css/tokens.css',
  '@beastui/css/base.css', '@beastui/css/components/button.css', '@beastui/css/components/icon.css'];
for (const entry of css) {
  const file = fileURLToPath(import.meta.resolve(entry));
  if (!existsSync(file)) throw new Error(entry + ' resolves to a missing file');
}
if (Object.keys(PERMUTATIONS).length !== 6) throw new Error('@beastui/tokens: expected 6 permutations');
if (Button !== ButtonOnly) throw new Error('@beastui/preact: two different Buttons');
const vnode = Button({ children: 'Save' });
if (vnode.props.class !== 'b-btn' || vnode.props.type !== 'button') throw new Error('Button renders the wrong props');
console.log('ok: ' + css.length + ' CSS entries, tokens, Button');
`,
  );
  run('node', ['smoke.mjs'], app);
} finally {
  rmSync(work, { recursive: true, force: true });
}
