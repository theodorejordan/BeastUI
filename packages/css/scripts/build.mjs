// Builds @beastui/css with Lightning CSS (decision 0003): every entry in src/ becomes one
// bundled, minified file in dist/, lowered for the browser floor of decision 0005.
//
// Entries: beastui.css (everything), tokens.css, base.css, and one file per component.
// Each output inlines its @imports, @beastui/tokens included, so a <link> to one file works
// with no bundler.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import browserslist from 'browserslist';
import { browserslistToTargets, bundleAsync, transform } from 'lightningcss';

const root = fileURLToPath(new URL('..', import.meta.url));
const src = join(root, 'src');
const dist = join(root, 'dist');

// The floor lives once, in the workspace package.json ("browserslist"), found by walking up.
const targets = browserslistToTargets(browserslist(undefined, { path: root }));

const entries = [
  'beastui.css',
  'tokens.css',
  'base.css',
  ...readdirSync(join(src, 'components')).map((file) => `components/${file}`),
];

// Lightning CSS only follows relative paths by itself. Package imports such as
// '@beastui/tokens/tokens.css' go through Node's resolution, which reads the exports map.
const resolver = {
  resolve(specifier, from) {
    if (specifier.startsWith('.') || specifier.startsWith('/')) return resolve(dirname(from), specifier);
    return createRequire(from).resolve(specifier);
  },
};

// The bundler keeps a file imported several times only at its LAST position, and most files
// import layers.css. In beastui.css that would put the order statement after the tokens, and
// beast.tokens would rank before beast.reset. So every output starts with the statement itself.
const layerOrder = transform({
  filename: 'layers.css',
  code: readFileSync(join(src, 'layers.css')),
  minify: true,
}).code.toString();

rmSync(dist, { recursive: true, force: true });
for (const entry of entries) {
  const { code, warnings } = await bundleAsync({
    filename: join(src, entry),
    minify: true,
    targets,
    resolver,
  });
  for (const warning of warnings) console.warn(`${entry}: ${warning.message}`);
  mkdirSync(dirname(join(dist, entry)), { recursive: true });
  const output = layerOrder + code;
  writeFileSync(join(dist, entry), output);
  console.log(`${entry.padEnd(24)} ${(output.length / 1024).toFixed(1)} kB`);
}
