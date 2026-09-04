/**
 * Compiles styles/website.css with the website Tailwind config and writes it
 * to src/lib/deploy/website-css.ts as an exported string.
 *
 * Emitting a TS module (rather than reading a .css file at runtime) means the
 * stylesheet is bundled with the deployment route and works unchanged in a
 * serverless environment.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const tmp = join(root, '.next', 'cache', 'website.css');
const out = join(root, 'src', 'lib', 'deploy', 'website-css.ts');

mkdirSync(dirname(tmp), { recursive: true });

// Invoke the CLI's JS entry directly: cross-platform, and no shell involved.
const cli = createRequire(import.meta.url).resolve('tailwindcss/lib/cli.js');

execFileSync(
  process.execPath,
  [cli, '-c', 'tailwind.website.config.ts', '-i', 'styles/website.css', '-o', tmp, '--minify'],
  { stdio: ['ignore', 'ignore', 'inherit'], cwd: root },
);

// Normalise line endings before embedding. Tailwind's output follows the
// platform, so without this a Windows build and a Linux build emit different
// string literals (and a different WEBSITE_CSS_BYTES) from identical input,
// leaving this checked-in generated file dirty after every build.
const css = readFileSync(tmp, 'utf8').replace(/\r\n/g, '\n').trim();
rmSync(tmp, { force: true });

mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  `// GENERATED FILE - do not edit.\n// Run \`npm run build:site-css\` to regenerate from styles/website.css.\n\nexport const WEBSITE_CSS = ${JSON.stringify(css)};\n\nexport const WEBSITE_CSS_BYTES = ${css.length};\n`,
  'utf8',
);

console.log(`build-site-css: wrote ${(css.length / 1024).toFixed(1)} kB to ${out.replace(root, '.')}`);
