import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PUBLICATION_FACTOR_KEYS, validateManifest } from '../src/lib/data/contracts.ts';

const manifestPath = resolve(import.meta.dirname, '../public/data/manifest.json');

try {
  const manifest = validateManifest(JSON.parse(await readFile(manifestPath, 'utf8')));
  if (manifest.status !== 'ready') {
    throw new Error('Publication requires a ready data release.');
  }
  if (
    manifest.factors.length !== PUBLICATION_FACTOR_KEYS.length ||
    manifest.factors.some((factor, index) => factor !== PUBLICATION_FACTOR_KEYS[index])
  ) {
    throw new Error(
      `Publication requires the complete factor set: ${PUBLICATION_FACTOR_KEYS.join(',')}.`,
    );
  }
  console.log('Publication factor set complete.');
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown publication error.';
  console.error(`Publication validation failed: ${message}`);
  process.exitCode = 1;
}
