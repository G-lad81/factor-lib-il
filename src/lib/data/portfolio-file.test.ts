import { beforeEach, describe, expect, it, vi } from 'vitest';

const { readWorkbook } = vi.hoisted(() => ({ readWorkbook: vi.fn() }));
vi.mock('read-excel-file/browser', () => ({ default: readWorkbook }));

import { fileMatrix } from './portfolio-file';

describe('portfolio file boundary', () => {
  beforeEach(() => readWorkbook.mockReset());

  it('rejects Excel dates that include a time of day', async () => {
    readWorkbook.mockResolvedValue([
      {
        sheet: 'Portfolio',
        data: [
          ['date', 'nav'],
          [new Date(Date.UTC(2025, 0, 30, 12)), 100],
        ],
      },
    ]);

    await expect(fileMatrix(new File(['fixture'], 'portfolio.xlsx'))).rejects.toThrow(
      /must not include a time/,
    );
  });

  it('rejects unsupported and oversized files before parsing', async () => {
    await expect(fileMatrix(new File(['x'], 'portfolio.txt'))).rejects.toThrow(/csv or .xlsx/);
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'portfolio.csv');
    await expect(fileMatrix(oversized)).rejects.toThrow(/5 MB/);
    expect(readWorkbook).not.toHaveBeenCalled();
  });
});
