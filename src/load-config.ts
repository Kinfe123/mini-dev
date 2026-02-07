import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
import type { DevServerOptions } from './types.js';

const CONFIG_NAMES = ['mini-dev.config.ts', 'mini-dev.config.js', 'mini-dev.config.mjs', 'mini-dev.config.cjs'];

/**
 * Load config from mini-dev.config.{ts,js,mjs,cjs} in root.
 * CLI args take precedence over config.
 */
export async function loadConfig(root: string): Promise<Partial<DevServerOptions>> {
  for (const name of CONFIG_NAMES) {
    const configPath = join(root, name);
    if (!existsSync(configPath)) continue;

    try {
      if (name.endsWith('.ts')) {
        return await loadTsConfig(configPath);
      }
      if (name.endsWith('.cjs')) {
        const require = createRequire(import.meta.url);
        const mod = require(configPath);
        return mod.default ?? mod;
      }
      const mod = await import(pathToFileURL(configPath).href + '?t=' + Date.now());
      return mod.default ?? mod;
    } catch (err) {
      console.error(`[mini-dev] Failed to load config from ${name}:`, err);
      return {};
    }
  }
  return {};
}

async function loadTsConfig(configPath: string): Promise<Partial<DevServerOptions>> {
  const outDir = join(tmpdir(), 'mini-dev');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'config.mjs');

  buildSync({
    entryPoints: [configPath],
    outfile: outPath,
    format: 'esm',
    platform: 'node',
    bundle: false,
  });

  const mod = await import(pathToFileURL(outPath).href + '?t=' + Date.now());
  return mod.default ?? mod;
}
