import { describe, expect, it } from 'vitest';
import { parseCsvMatrix } from '@/lib/data/contracts';
import { runRegression, type AlignedObservation, type OptionalFactor } from './engine';
import { regressionCsv } from './export';
import reference from '../../../tests/fixtures/statsmodels-regression.json';

function fixture(count = 40): AlignedObservation[] {
  return Array.from({ length: count }, (_, index) => {
    const mkt_rf = 0.004 * Math.sin(index * 0.7) + 0.001 * ((index % 3) - 1);
    const smb = 0.003 * Math.cos(index * 0.31) + 0.0005 * (index % 5);
    const hml = 0.002 * Math.sin(index * 0.17 + 1) + 0.0003 * (index % 7);
    const mom = 0.005 * Math.cos(index * 0.23 - 0.4) + (0.0002 * index) / count;
    const rf = 0.0001;
    const noise = (((index * 17) % 11) - 5) * 0.00013;
    const excess = 0.0004 + 0.72 * mkt_rf + 0.15 * smb - 0.08 * hml + 0.39 * mom + noise;
    const date = new Date(Date.UTC(2025, 0, 1 + index)).toISOString().slice(0, 10);
    return {
      date,
      rf,
      mkt_rf,
      smb,
      hml,
      mom,
      portfolioReturn: excess + rf,
    };
  });
}

describe('regression engine', () => {
  it('matches independently generated statsmodels reference results', () => {
    const rows = reference.observations as AlignedObservation[];
    for (const expected of reference.models) {
      const optionalFactors = expected.factors.filter(
        (factor): factor is OptionalFactor => factor !== 'mkt_rf',
      );
      const result = runRegression(
        rows,
        expected.frequency as 'daily' | 'monthly',
        optionalFactors,
      );
      expect(result.coefficients).toEqual(
        expected.coefficients.map((value) => expect.closeTo(value, 11)),
      );
      expect(result.standardErrors).toEqual(
        expected.standardErrors.map((value) => expect.closeTo(value, 11)),
      );
      expect(result.tStats).toEqual(expected.tStats.map((value) => expect.closeTo(value, 9)));
      expect(result.pValues).toEqual(expected.pValues.map((value) => expect.closeTo(value, 9)));
      expect(result.incrementalRSquared).toEqual(
        expected.incrementalRSquared.map((value) => expect.closeTo(value, 12)),
      );
      expect(result.rSquared).toBeCloseTo(expected.rSquared, 12);
      expect(result.adjustedRSquared).toBeCloseTo(expected.adjustedRSquared, 12);
      expect(result.annualizedAlpha).toBeCloseTo(expected.annualizedAlpha, 12);
      expect(result.hacLags).toBe(expected.hacLags);
    }
  });

  it('supports all eight optional-factor combinations with a fixed market baseline', () => {
    const optional: OptionalFactor[] = ['smb', 'hml', 'mom'];
    for (let mask = 0; mask < 8; mask += 1) {
      const selected = optional.filter((_, index) => Boolean(mask & (1 << index)));
      const result = runRegression(fixture(), 'daily', selected);
      expect(result.selectedFactors).toEqual(['mkt_rf', ...selected]);
      expect(result.labels).toEqual([
        'Alpha',
        'MKT-RF',
        ...selected.map((factor) => factor.toUpperCase()),
      ]);
      expect(result.coefficients).toHaveLength(2 + selected.length);
      expect(result.incrementalRSquared).toHaveLength(1 + selected.length);
      // each value is a leave-one-out drop in R², so it lies in [0, R²]; overlap means they
      // need not sum to R²
      for (const value of result.incrementalRSquared) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(result.rSquared + 1e-12);
      }
      expect(result.adjustedRSquared).toBeCloseTo(
        1 -
          (1 - result.rSquared) *
            ((result.observations - 1) / (result.observations - result.labels.length)),
        12,
      );
    }
  });

  it('reports each factor R² contribution as full model minus the model without it', () => {
    const rows = fixture();
    const full = runRegression(rows, 'daily');
    // MKT-RF is always in the model, so the only leave-one-out fits reachable through the public
    // API are the optional ones; each must equal the drop in R² when that factor is removed.
    const withoutOne: Array<[OptionalFactor, OptionalFactor[]]> = [
      ['smb', ['hml', 'mom']],
      ['hml', ['smb', 'mom']],
      ['mom', ['smb', 'hml']],
    ];
    for (const [dropped, remaining] of withoutOne) {
      const reduced = runRegression(rows, 'daily', remaining).rSquared;
      const position = full.selectedFactors.indexOf(dropped);
      expect(full.incrementalRSquared[position]!).toBeCloseTo(full.rSquared - reduced, 12);
    }
  });

  it('does not credit the first factor with what it shares with the others', () => {
    const rows = fixture();
    const full = runRegression(rows, 'daily');
    // R² of MKT-RF alone, which a sequential decomposition would credit to it in full
    const sequentialMarket = runRegression(rows, 'daily', []).rSquared;
    expect(full.incrementalRSquared[0]!).toBeLessThan(sequentialMarket - 1e-6);
  });

  it('excludes the intercept from the explained series, so the gap is alpha', () => {
    const rows = fixture(60);
    const result = runRegression(rows, 'daily', ['smb', 'hml', 'mom']);
    // The fixture is built with a positive intercept, so the portfolio must finish above what its
    // factor exposures alone earned. With the intercept left in the fitted values, OLS pins the
    // two curves to the same endpoint and the chart cannot show alpha at all.
    const actual = result.actualCumulative.at(-1)!;
    const explained = result.explainedCumulative.at(-1)!;
    expect(actual).toBeGreaterThan(explained);
    // and the gap is the intercept compounded over the sample, not residual noise
    const alphaPerPeriod = result.annualizedAlpha / 252;
    expect(actual - explained).toBeCloseTo((1 + alphaPerPeriod) ** rows.length - 1, 2);
  });

  it('enforces sample and variance requirements', () => {
    expect(() => runRegression(fixture(9), 'daily')).toThrow(/At least 10/);
    const flat = fixture().map((row) => ({ ...row, portfolioReturn: row.rf }));
    expect(() => runRegression(flat, 'daily')).toThrow(/no variance/);
  });

  it('rejects singular and non-finite designs explicitly', () => {
    const singular = fixture().map((row) => ({ ...row, smb: row.mkt_rf }));
    expect(() => runRegression(singular, 'daily')).toThrow(/singular or numerically unstable/);
    expect(() => runRegression(singular, 'daily', [])).not.toThrow();
    const nonFinite = fixture();
    nonFinite[0] = { ...nonFinite[0]!, mom: Number.NaN };
    expect(() => runRegression(nonFinite, 'daily')).toThrow(/finite values/);
    expect(() => runRegression(nonFinite, 'daily', ['smb', 'hml'])).not.toThrow();
    expect(() => runRegression(fixture(), 'daily', ['smb', 'smb'])).toThrow(/selection is invalid/);
  });

  it('warns for short samples at the selected frequency', () => {
    expect(runRegression(fixture(), 'daily').warnings).toEqual([
      { code: 'shortSample', threshold: 60, frequency: 'daily' },
    ]);
    expect(runRegression(fixture(), 'monthly').warnings).toEqual([]);
  });

  it('warns when returns look like percentages rather than decimals', () => {
    // the same file scaled by 100 — the most common upload mistake
    const rows = fixture(60);
    const asPercent = rows.map((row) => ({ ...row, portfolioReturn: row.portfolioReturn * 100 }));
    expect(runRegression(rows, 'monthly').warnings).toEqual([]);
    const warnings = runRegression(asPercent, 'monthly').warnings;
    expect(warnings).toHaveLength(1);
    expect(warnings[0]!.code).toBe('percentScale');
  });

  it('does not cry percent at a portfolio that is merely volatile', () => {
    // 5x the market is leverage, not a scale error
    const rows = fixture(60).map((row) => ({ ...row, portfolioReturn: row.mkt_rf * 5 }));
    expect(runRegression(rows, 'monthly').warnings).toEqual([]);
  });

  it('exports one self-contained row per model term', () => {
    const result = runRegression(fixture(), 'daily');
    const csv = regressionCsv(result, {
      inputKind: 'returns',
      frequency: 'daily',
      dataVersion: '2026.08',
      methodologyVersion: '1.0.0',
      factorGeneratedAt: '2026-08-12T00:00:00Z',
    });
    const matrix = parseCsvMatrix(csv);
    expect(matrix[0]).toEqual([
      'term',
      'coefficient',
      'incremental_r_squared',
      'hac_standard_error',
      'hac_t_stat',
      'hac_p_value',
      'annualized_alpha',
      'r_squared',
      'adjusted_r_squared',
      'observations',
      'frequency',
      'input_kind',
      'sample_start',
      'sample_end',
      'hac_lags',
      'model_factors',
      'data_version',
      'methodology_version',
      'factor_data_generated_at',
      'p_value_distribution',
    ]);
    expect(matrix.slice(1).map((row) => row[0])).toEqual(['alpha', 'mkt_rf', 'smb', 'hml', 'mom']);
    expect(matrix).toHaveLength(6);
    expect(matrix.slice(1).every((row) => row[10] === 'daily')).toBe(true);
    expect(matrix.slice(1).every((row) => row[15] === 'mkt_rf+smb+hml+mom')).toBe(true);
    expect(Number(matrix[1]![6])).toBeCloseTo(result.annualizedAlpha, 12);
    expect(matrix[1]![2]).toBe('');
    expect(Number(matrix[2]![2])).toBeCloseTo(result.incrementalRSquared[0]!, 12);
  });
});
