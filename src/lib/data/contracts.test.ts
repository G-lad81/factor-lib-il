import { describe, expect, it } from 'vitest';
import {
  parseCsvMatrix,
  portfolioReturns,
  validateFactorMatrix,
  validateManifest,
  validatePublishedDataset,
  validatePortfolioMatrix,
} from './contracts';

const allFactors = ['rf', 'mkt_rf', 'smb', 'hml', 'mom'] as const;
const factors = validateFactorMatrix(
  parseCsvMatrix(`date,rf,mkt_rf,smb,hml,mom
2025-01-30,0.001,0.01,0.002,-0.001,0.004
2025-02-27,0.001,0.02,0.001,0.002,-0.003
2025-03-31,0.001,-0.01,0.003,0.001,0.002`),
  allFactors,
);
const dailyFactors = validateFactorMatrix(
  parseCsvMatrix(`date,rf,mkt_rf,smb,hml,mom
2025-01-02,0.0001,0.01,0.002,-0.001,0.004
2025-01-03,0.0001,0.02,0.001,0.002,-0.003
2025-01-06,0.0001,-0.01,0.003,0.001,0.002`),
  allFactors,
);

describe('portfolio input alignment', () => {
  it('calculates NAV returns without changing valid aligned input', () => {
    const { rows } = validatePortfolioMatrix(
      parseCsvMatrix('date,nav\n2025-01-30,100\n2025-02-27,102\n2025-03-31,101'),
      'nav',
      'monthly',
      factors,
    );
    expect(portfolioReturns(rows, 'nav')).toEqual([
      { date: '2025-02-27', return: 0.020000000000000018 },
      { date: '2025-03-31', return: 101 / 102 - 1 },
    ]);
  });

  it('accepts flexible headers, extra columns, blank rows, and numeric whitespace', () => {
    const { rows } = validatePortfolioMatrix(
      parseCsvMatrix(' Note , RETURN , Date \nx, 0.01 ,2025-01-30\n\ny, -0.02 ,2025-02-27'),
      'returns',
      'monthly',
      factors,
    );
    expect(portfolioReturns(rows, 'returns').map((row) => row.return)).toEqual([0.01, -0.02]);
  });

  it('uses matching daily returns and reports rows excluded from alignment', () => {
    const result = validatePortfolioMatrix(
      parseCsvMatrix(
        'date,return\n2024-12-31,0.1\n2025-01-02,0.01\n2025-01-04,0.02\n2025-01-06,0.03\n2025-01-07,0.04',
      ),
      'returns',
      'daily',
      dailyFactors,
    );
    expect(result.rows.map((row) => row.date)).toEqual(['2025-01-02', '2025-01-06']);
    expect(result.report).toEqual({
      inputRows: 5,
      ignoredBefore: 1,
      ignoredAfter: 1,
      unmatchedDates: 1,
      anchorUsed: false,
    });
  });

  it('matches monthly returns by month and allows missing months', () => {
    const { rows } = validatePortfolioMatrix(
      parseCsvMatrix('date,return\n2025-01-15,0.01\n2025-03-10,0.03'),
      'returns',
      'monthly',
      factors,
    );
    expect(rows.map((row) => row.date)).toEqual(['2025-01-30', '2025-03-31']);
  });

  it('retains the last pre-coverage NAV as the return anchor', () => {
    const result = validatePortfolioMatrix(
      parseCsvMatrix('date,nav\n2024-12-30,98\n2024-12-31,99\n2025-01-02,100\n2025-01-03,101'),
      'nav',
      'daily',
      dailyFactors,
    );
    expect(result.rows.map((row) => row.date)).toEqual(['2024-12-31', '2025-01-02', '2025-01-03']);
    expect(result.report.ignoredBefore).toBe(1);
    expect(result.report.anchorUsed).toBe(true);
    expect(portfolioReturns(result.rows, 'nav')[0]).toEqual({
      date: '2025-01-02',
      return: 100 / 99 - 1,
    });
  });

  it.each([
    ['missing required header', 'date,value\n2025-01-30,100', 'nav', /"nav" column/],
    ['bad date', 'date,nav\n30-01-2025,100', 'nav', /YYYY-MM-DD/],
    [
      'duplicate date',
      'date,return\n2025-01-30,0.1\n2025-01-30,0.2',
      'returns',
      /unique and ascending/,
    ],
    ['percentage syntax', 'date,return\n2025-01-30,1%', 'returns', /finite number/],
    ['invalid return', 'date,return\n2025-01-30,-1', 'returns', /greater than -1/],
    ['invalid NAV', 'date,nav\n2025-01-30,0', 'nav', /greater than zero/],
  ] as const)('rejects %s', (_name, csv, kind, pattern) => {
    expect(() => validatePortfolioMatrix(parseCsvMatrix(csv), kind, 'monthly', factors)).toThrow(
      pattern,
    );
  });

  it('rejects multiple monthly observations and gaps in NAV periods', () => {
    expect(() =>
      validatePortfolioMatrix(
        parseCsvMatrix('date,return\n2025-01-15,0.1\n2025-01-30,0.2'),
        'returns',
        'monthly',
        factors,
      ),
    ).toThrow(/one observation.*month/);
    expect(() =>
      validatePortfolioMatrix(
        parseCsvMatrix('date,nav\n2025-01-02,100\n2025-01-06,102'),
        'nav',
        'daily',
        dailyFactors,
      ),
    ).toThrow(/not consecutive/);
  });

  it('rejects an in-range NAV date outside the factor calendar', () => {
    expect(() =>
      validatePortfolioMatrix(
        parseCsvMatrix('date,nav\n2025-01-02,100\n2025-01-04,101'),
        'nav',
        'daily',
        dailyFactors,
      ),
    ).toThrow(/does not match/);
  });
});

describe('factor release contracts', () => {
  it('checks published metadata and monthly continuity with shared release rules', () => {
    expect(() =>
      validatePublishedDataset(
        factors,
        {
          path: 'data/factors_monthly.csv',
          rows: 3,
          coverage_start: '2025-01-30',
          coverage_end: '2025-03-31',
        },
        'monthly',
      ),
    ).not.toThrow();
    expect(() =>
      validatePublishedDataset(
        [factors[0]!, factors[2]!],
        {
          path: 'data/factors_monthly.csv',
          rows: 2,
          coverage_start: '2025-01-30',
          coverage_end: '2025-03-31',
        },
        'monthly',
      ),
    ).toThrow(/skips the month/);
  });

  it('rejects impossible factor dates', () => {
    expect(() =>
      validateFactorMatrix(
        parseCsvMatrix('date,rf,mkt_rf,smb,hml,mom\n2025-02-30,0,0,0,0,0'),
        allFactors,
      ),
    ).toThrow(/YYYY-MM-DD/);
  });

  it('rejects factor returns that cannot be compounded', () => {
    expect(() =>
      validateFactorMatrix(parseCsvMatrix('date,rf,mkt_rf,mom\n2025-01-30,0.001,-1,0.004'), [
        'rf',
        'mkt_rf',
        'mom',
      ]),
    ).toThrow(/mkt_rf.*greater than -1/);
  });

  it('validates pending and ready manifest shapes', () => {
    expect(
      validateManifest({
        schema_version: 1,
        data_license: 'CC-BY-NC-4.0',
        status: 'pending',
        methodology_version: '1.0.0',
        data_version: null,
        generated_at: null,
        daily: null,
        monthly: null,
      }).status,
    ).toBe('pending');

    expect(
      validateManifest({
        schema_version: 1,
        data_license: 'CC-BY-NC-4.0',
        status: 'ready',
        methodology_version: '1.0.0',
        data_version: '2026.08',
        generated_at: '2026-08-12T00:00:00Z',
        factors: allFactors,
        daily: {
          path: 'data/factors_daily.csv',
          coverage_start: '2025-01-02',
          coverage_end: '2025-01-06',
          rows: 3,
        },
        monthly: {
          path: 'data/factors_monthly.csv',
          coverage_start: '2025-01-30',
          coverage_end: '2025-03-31',
          rows: 3,
        },
      }).status,
    ).toBe('ready');

    expect(() =>
      validateManifest({
        schema_version: 1,
        data_license: 'CC-BY-NC-4.0',
        status: 'ready',
        methodology_version: '1.0.0',
        data_version: '2026.08',
        generated_at: '2026-08-12T00:00:00Z',
        factors: allFactors,
        daily: {
          path: '../private.csv',
          coverage_start: '2025-01-01',
          coverage_end: '2025-01-02',
          rows: 2,
        },
        monthly: null,
      }),
    ).toThrow(/path/);
  });

  it('derives the exact CSV schema from a valid partial release', () => {
    const partialFactors = ['rf', 'mkt_rf', 'mom'] as const;
    const rows = validateFactorMatrix(
      parseCsvMatrix('date,rf,mkt_rf,mom\n2025-01-30,0.001,0.01,0.004'),
      partialFactors,
    );
    expect(rows[0]).toEqual({ date: '2025-01-30', rf: 0.001, mkt_rf: 0.01, mom: 0.004 });
    expect(() =>
      validateFactorMatrix(
        parseCsvMatrix('date,rf,mkt_rf,smb,hml,mom\n2025-01-30,0,0,0,0,0'),
        partialFactors,
      ),
    ).toThrow(/date,rf,mkt_rf,mom/);
  });

  it('rejects invalid factor declarations', () => {
    const base = {
      schema_version: 1,
      data_license: 'CC-BY-NC-4.0',
      status: 'ready',
      methodology_version: '1.0.0',
      data_version: '2026.08',
      generated_at: '2026-08-12T00:00:00Z',
      daily: {
        path: 'data/factors_daily.csv',
        coverage_start: '2025-01-02',
        coverage_end: '2025-01-06',
        rows: 3,
      },
      monthly: {
        path: 'data/factors_monthly.csv',
        coverage_start: '2025-01-30',
        coverage_end: '2025-03-31',
        rows: 3,
      },
    };
    expect(() => validateManifest({ ...base, factors: ['rf', 'mom'] })).toThrow(
      /RF and MKT-RF|begin/,
    );
    expect(() => validateManifest({ ...base, factors: ['rf', 'mkt_rf', 'mom', 'mom'] })).toThrow(
      /duplicates/,
    );
    expect(() => validateManifest({ ...base, factors: ['rf', 'mkt_rf', 'unknown'] })).toThrow(
      /known keys/,
    );
    expect(() => validateManifest({ ...base, factors: ['rf', 'mkt_rf', 'mom', 'smb'] })).toThrow(
      /canonical order/,
    );
  });

  it('rejects a manifest without the required open-data license identifier', () => {
    expect(() =>
      validateManifest({
        schema_version: 1,
        status: 'pending',
        methodology_version: '1.0.0',
        data_version: null,
        generated_at: null,
        daily: null,
        monthly: null,
      }),
    ).toThrow(/CC-BY-NC-4.0/);
  });

  it('enforces the public data-version convention', () => {
    const release = {
      schema_version: 1,
      data_license: 'CC-BY-NC-4.0',
      status: 'ready',
      methodology_version: '1.0.0',
      generated_at: '2026-08-12T00:00:00Z',
      factors: allFactors,
      daily: {
        path: 'data/factors_daily.csv',
        coverage_start: '2025-01-02',
        coverage_end: '2025-01-06',
        rows: 3,
      },
      monthly: {
        path: 'data/factors_monthly.csv',
        coverage_start: '2025-01-30',
        coverage_end: '2025-03-31',
        rows: 3,
      },
    };
    expect(() =>
      validateManifest({
        ...release,
        data_version: 'draft',
      }),
    ).toThrow(/data version/);
  });
});
