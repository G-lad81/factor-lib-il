import { describe, expect, it } from 'vitest';
import { validatePerformanceRelease, validatePerformanceStatistics } from './performance';
import type { ReadyManifest } from './contracts';

const fixture = {
  data_version: '2026.07.0',
  generated_at: '2026-08-13T13:41:04Z',
  window: { start: '2015-03-31', end: '2026-07-31', months: 137 },
  risk_free: { mean_ann: 0.0146, mean_monthly: 0.0012 },
  factors: Object.fromEntries(
    ['mkt_rf', 'smb', 'hml', 'mom'].map((key) => [
      key,
      {
        mean_monthly: 0.0079,
        vol_monthly: 0.0429,
        sharpe_ann: 0.64,
        t_stat_hac: 2.23,
        p_value_hac: 0.025,
        max_drawdown: -0.34,
      },
    ]),
  ),
  notes: {
    frictionless: 'Frictionless note.',
    inference: 'Inference note.',
    sharpe: 'Sharpe note.',
    power: 'Power note.',
    window: 'Window note.',
  },
};

const manifest: ReadyManifest = {
  schema_version: 1,
  status: 'ready',
  data_license: 'CC-BY-NC-4.0',
  methodology_version: '1.0.0',
  data_version: fixture.data_version,
  generated_at: fixture.generated_at,
  factors: ['rf', 'mkt_rf', 'smb', 'hml', 'mom'],
  daily: {
    path: 'data/factors_daily.csv',
    rows: 2800,
    coverage_start: '2015-03-01',
    coverage_end: '2026-07-31',
  },
  monthly: {
    path: 'data/factors_monthly.csv',
    rows: 137,
    coverage_start: '2015-03-31',
    coverage_end: '2026-07-31',
  },
};

describe('factor performance contract', () => {
  it('accepts complete statistics consistent with the release manifest', () => {
    const statistics = validatePerformanceStatistics(fixture, ['mkt_rf', 'smb', 'hml', 'mom']);
    expect(() => validatePerformanceRelease(statistics, manifest)).not.toThrow();
  });

  it('rejects missing factors, invalid values, and missing notes', () => {
    expect(() =>
      validatePerformanceStatistics(
        { ...fixture, factors: { ...fixture.factors, hml: undefined } },
        ['mkt_rf', 'smb', 'hml', 'mom'],
      ),
    ).toThrow(/hml/);
    expect(() =>
      validatePerformanceStatistics(
        {
          ...fixture,
          factors: {
            ...fixture.factors,
            mom: { ...fixture.factors.mom, p_value_hac: 1.1 },
          },
        },
        ['mkt_rf', 'smb', 'hml', 'mom'],
      ),
    ).toThrow(/between zero and one/);
    expect(() =>
      validatePerformanceStatistics({ ...fixture, notes: { ...fixture.notes, power: '' } }, [
        'mkt_rf',
        'smb',
        'hml',
        'mom',
      ]),
    ).toThrow(/power/);
  });

  it('rejects statistics from a different publication window', () => {
    const statistics = validatePerformanceStatistics(fixture, ['mkt_rf', 'smb', 'hml', 'mom']);
    expect(() =>
      validatePerformanceRelease(statistics, {
        ...manifest,
        monthly: { ...manifest.monthly, rows: 136 },
      }),
    ).toThrow(/monthly release window/);
  });

  it('rejects statistics from a different data release', () => {
    const statistics = validatePerformanceStatistics({ ...fixture, data_version: '2026.06' }, [
      'mkt_rf',
      'smb',
      'hml',
      'mom',
    ]);
    expect(() => validatePerformanceRelease(statistics, manifest)).toThrow(/data versions/);
  });

  it('accepts statistics for a partial manifest factor set', () => {
    const partialManifest: ReadyManifest = { ...manifest, factors: ['rf', 'mkt_rf', 'mom'] };
    const partialFixture = {
      ...fixture,
      factors: { mkt_rf: fixture.factors.mkt_rf, mom: fixture.factors.mom },
    };
    const statistics = validatePerformanceStatistics(partialFixture, ['mkt_rf', 'mom']);
    expect(() => validatePerformanceRelease(statistics, partialManifest)).not.toThrow();
  });
});
