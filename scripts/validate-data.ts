import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  parseCsvMatrix,
  validateFactorMatrix,
  validateManifest,
  validatePublishedDataset,
  type Frequency,
} from '../src/lib/data/contracts.ts';
import {
  validatePerformanceRelease,
  validatePerformanceStatistics,
} from '../src/lib/data/performance.ts';

const root = resolve(import.meta.dirname, '..');

try {
  const manifest = validateManifest(
    JSON.parse(await readFile(resolve(root, 'public/data/manifest.json'), 'utf8')),
  );
  if (manifest.status === 'pending') {
    console.log('Data manifest valid: publication pending.');
  } else {
    for (const frequency of ['daily', 'monthly'] as const satisfies readonly Frequency[]) {
      const metadata = manifest[frequency];
      const text = await readFile(resolve(root, 'public', metadata.path), 'utf8');
      const rows = validateFactorMatrix(parseCsvMatrix(text), manifest.factors);
      validatePublishedDataset(rows, metadata, frequency);
    }
    const statistics = validatePerformanceStatistics(
      JSON.parse(await readFile(resolve(root, 'public/data/stats.json'), 'utf8')),
      manifest.factors.filter((factor) => factor !== 'rf'),
    );
    validatePerformanceRelease(statistics, manifest);
    console.log('Published factor datasets and performance statistics valid.');
  }
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown validation error.';
  console.error(`Data validation failed: ${message}`);
  process.exitCode = 1;
}
