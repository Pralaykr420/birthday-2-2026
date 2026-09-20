import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

/**
 * Bundles the server into one file for production.
 *
 * Why bundle at all: starting up is much faster when Node reads one file
 * instead of walking thousands of files in node_modules. On a free hosting
 * plan that sleeps when idle, that startup time is what she would be
 * waiting on.
 *
 * Run it with:  pnpm --filter @workspace/api-server run build
 * Output:       dist/index.mjs
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, 'dist');

/**
 * Packages we deliberately do NOT bundle.
 *
 * Two kinds end up here:
 *
 *   - The pino logger family. Pino does its logging on a separate worker
 *     thread, which it starts by loading a file from disk by path. Bundling
 *     it breaks that path, so we leave it alone and let Node load it
 *     normally from node_modules.
 *
 *   - Database drivers with optional native parts. `pg` works fine in pure
 *     JavaScript but tries to load a compiled C add-on if one is available,
 *     and esbuild cannot bundle compiled code.
 *
 * If you ever add a package and the build fails with something about a
 * missing module or a .node file, adding its name to this list is usually
 * the fix.
 */
const external = ['pino', 'pino-http', 'pino-pretty', 'thread-stream', 'pg-native'];

await rm(outDir, { recursive: true, force: true });

await build({
  entryPoints: [path.resolve(here, 'src/index.ts')],
  outfile: path.resolve(outDir, 'index.mjs'),
  platform: 'node',
  target: 'node20',
  format: 'esm',
  bundle: true,
  minify: true,
  sourcemap: 'linked',
  logLevel: 'info',
  external,

  /**
   * Some of our dependencies (Express among them) are still written in the
   * older CommonJS style and call `require()`. Our output is a modern ES
   * module, where `require` does not exist. These few lines put it back.
   */
  banner: {
    js: [
      "import { createRequire as __createRequire } from 'node:module';",
      "import __nodePath from 'node:path';",
      "import __nodeUrl from 'node:url';",
      'globalThis.require = __createRequire(import.meta.url);',
      'globalThis.__filename = __nodeUrl.fileURLToPath(import.meta.url);',
      'globalThis.__dirname = __nodePath.dirname(globalThis.__filename);',
    ].join('\n'),
  },
});

console.log('Built dist/index.mjs');
