import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fileMatrix } from './portfolio-file';

async function fixture(name: string): Promise<File> {
  const path = resolve(process.cwd(), 'tests', 'fixtures', name);
  const bytes = await readFile(path);
  return new File([bytes], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

describe('real XLSX parsing', () => {
  it('reads native Excel dates from a real workbook', async () => {
    await expect(fileMatrix(await fixture('portfolio-valid.xlsx'))).resolves.toEqual([
      ['date', 'nav'],
      ['2025-01-30', 100],
      ['2025-02-27', 101.5],
    ]);
  });

  it('preserves internal blank rows for contract-level handling', async () => {
    await expect(fileMatrix(await fixture('portfolio-blank-row.xlsx'))).resolves.toEqual([
      ['date', 'nav'],
      ['2025-01-30', 100],
      [null, null],
      ['2025-02-27', 101.5],
    ]);
  });

  it('rejects a real workbook with multiple worksheets', async () => {
    await expect(fileMatrix(await fixture('portfolio-multiple-sheets.xlsx'))).rejects.toThrow(
      /exactly one worksheet/,
    );
  });
});
