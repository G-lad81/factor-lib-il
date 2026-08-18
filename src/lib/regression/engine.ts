import { Matrix, SingularValueDecomposition } from 'ml-matrix';
import jStat from 'jstat';
import {
  FACTOR_BY_KEY,
  OPTIONAL_FACTOR_KEYS,
  type OptionalFactor,
  type RegressionFactor,
} from '@/config/factors';
import type { FactorRow, Frequency } from '@/lib/data/contracts';

export type { OptionalFactor, RegressionFactor } from '@/config/factors';

export interface AlignedObservation extends FactorRow {
  portfolioReturn: number;
}

/** Codes, not sentences: the engine has no locale and must not emit English onto the Hebrew site. */
export type RegressionWarning =
  | { code: 'shortSample'; threshold: number; frequency: Frequency }
  | { code: 'percentScale'; ratio: number };

/**
 * Portfolio-to-market ratio of mean absolute return above which the file looks percent-scaled:
 * a percent file lands near 100x, a leveraged fund at a small multiple.
 */
const PERCENT_SCALE_RATIO = 20;

export interface RegressionResult {
  labels: readonly string[];
  coefficients: number[];
  standardErrors: number[];
  tStats: number[];
  pValues: number[];
  rSquared: number;
  incrementalRSquared: number[];
  adjustedRSquared: number;
  annualizedAlpha: number;
  observations: number;
  hacLags: number;
  dates: string[];
  actualCumulative: number[];
  /** Cumulative β·X with the intercept removed: what the factor exposures alone earned. The gap
   * to actualCumulative is cumulative alpha — with the intercept left in, OLS pins the two
   * curves to the same endpoint and the chart can show nothing. */
  explainedCumulative: number[];
  selectedFactors: readonly RegressionFactor[];
  warnings: RegressionWarning[];
}

export const OPTIONAL_FACTORS = OPTIONAL_FACTOR_KEYS;

export function alignObservations(
  returns: Array<{ date: string; return: number }>,
  factors: FactorRow[],
): AlignedObservation[] {
  const byDate = new Map(factors.map((row) => [row.date, row]));
  return returns.map((item, index) => {
    const factor = byDate.get(item.date);
    if (!factor)
      throw new Error(`Return row ${index + 1}: ${item.date} has no identical factor date.`);
    return { ...factor, portfolioReturn: item.return };
  });
}

function outer(a: number[], b: number[]): Matrix {
  return new Matrix(a.map((left) => b.map((right) => left * right)));
}

function cumulative(values: number[]): number[] {
  let wealth = 1;
  return values.map((value) => {
    wealth *= 1 + value;
    return wealth - 1;
  });
}

function factorValue(row: FactorRow, factor: RegressionFactor): number {
  const value = row[factor];
  if (value === undefined)
    throw new Error(`Selected factor ${factor} is missing from the release.`);
  return value;
}

export function runRegression(
  rows: AlignedObservation[],
  frequency: Frequency,
  optionalFactors: readonly OptionalFactor[] = OPTIONAL_FACTORS,
): RegressionResult {
  const optionalSet = new Set(optionalFactors);
  if (
    optionalSet.size !== optionalFactors.length ||
    optionalFactors.some((factor) => !OPTIONAL_FACTORS.includes(factor))
  ) {
    throw new Error('The optional factor selection is invalid.');
  }
  const selectedFactors: RegressionFactor[] = [
    'mkt_rf',
    ...OPTIONAL_FACTORS.filter((factor) => optionalSet.has(factor)),
  ];
  const labels = ['Alpha', ...selectedFactors.map((factor) => FACTOR_BY_KEY[factor].symbol)];
  const n = rows.length;
  const k = labels.length;
  if (n < 10)
    throw new Error(`At least 10 usable return observations are required; received ${n}.`);
  const xValues = rows.map((row) => [
    1,
    ...selectedFactors.map((factor) => factorValue(row, factor)),
  ]);
  const yValues = rows.map((row) => row.portfolioReturn - row.rf);
  if ([...xValues.flat(), ...yValues].some((value) => !Number.isFinite(value))) {
    throw new Error('Regression inputs must contain only finite values.');
  }
  const x = new Matrix(xValues);
  const y = Matrix.columnVector(yValues);
  const decomposition = new SingularValueDecomposition(x, { autoTranspose: true });
  const singularValues = decomposition.diagonal;
  const largestSingularValue = Math.max(...singularValues);
  const smallestSingularValue = Math.min(...singularValues);
  if (
    !Number.isFinite(largestSingularValue) ||
    !Number.isFinite(smallestSingularValue) ||
    smallestSingularValue <= largestSingularValue * 1e-12
  ) {
    throw new Error(
      'The regression design matrix is singular or numerically unstable. Supply a longer or non-degenerate sample.',
    );
  }
  const beta = decomposition.solve(y);
  const inverseSquaredSingularValues = singularValues.map((value) => 1 / (value * value));
  const rightSingularVectors = decomposition.rightSingularVectors;
  const xtxInverse = rightSingularVectors
    .mmul(Matrix.diag(inverseSquaredSingularValues))
    .mmul(rightSingularVectors.transpose());
  const fitted = x.mmul(beta).to1DArray();
  const residuals = yValues.map((value, index) => value - fitted[index]!);
  const rss = residuals.reduce((sum, value) => sum + value * value, 0);
  const mean = yValues.reduce((sum, value) => sum + value, 0) / n;
  const tss = yValues.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  if (!(tss > 0))
    throw new Error('Portfolio excess returns have no variance. Regression is undefined.');
  const rSquared = 1 - rss / tss;
  // ΔR² is the semi-partial: the R² this factor contributes that no other selected factor can
  // supply, measured as full model minus the same model with that one column removed. It is
  // order-independent, unlike a sequential (Type I) decomposition, and the increments therefore
  // sum to R² only when the factors are mutually orthogonal.
  const incrementalRSquared = selectedFactors.map((_, factorIndex) => {
    const column = factorIndex + 1; // column 0 is the intercept
    const reducedXValues = xValues.map((row) => row.filter((_, index) => index !== column));
    const reducedX = new Matrix(reducedXValues);
    const reducedBeta = new SingularValueDecomposition(reducedX, { autoTranspose: true }).solve(y);
    const reducedFitted = reducedX.mmul(reducedBeta).to1DArray();
    const reducedRss = yValues.reduce(
      (sum, value, index) => sum + (value - reducedFitted[index]!) ** 2,
      0,
    );
    const increment = rSquared - (1 - reducedRss / tss);
    if (increment < -1e-10) {
      throw new Error('The nested regression R² sequence is numerically invalid.');
    }
    return Math.max(0, increment);
  });
  const adjustedRSquared = 1 - (1 - rSquared) * ((n - 1) / (n - k));
  const hacLags = Math.min(Math.floor(4 * (n / 100) ** (2 / 9)), n - k - 1);
  let meat = Matrix.zeros(k, k);
  for (let t = 0; t < n; t += 1) {
    meat = meat.add(outer(xValues[t]!, xValues[t]!).mul(residuals[t]! ** 2));
  }
  for (let lag = 1; lag <= hacLags; lag += 1) {
    const weight = 1 - lag / (hacLags + 1);
    for (let t = lag; t < n; t += 1) {
      const cross = outer(xValues[t]!, xValues[t - lag]!);
      meat = meat.add(
        cross.add(cross.transpose()).mul(weight * residuals[t]! * residuals[t - lag]!),
      );
    }
  }
  const covariance = xtxInverse.mmul(meat.mul(n / (n - k))).mmul(xtxInverse);
  const coefficients = beta.to1DArray();
  const standardErrors = coefficients.map((_, index) => {
    const variance = covariance.get(index, index);
    if (!Number.isFinite(variance) || variance <= 0) {
      throw new Error('The HAC covariance matrix is numerically invalid for this sample.');
    }
    return Math.sqrt(variance);
  });
  const tStats = coefficients.map((value, index) => value / standardErrors[index]!);
  const pValues = tStats.map((value) => 2 * jStat.normal.cdf(-Math.abs(value), 0, 1));
  if (
    [
      ...coefficients,
      ...standardErrors,
      ...tStats,
      ...pValues,
      ...incrementalRSquared,
      rSquared,
      adjustedRSquared,
    ].some((value) => !Number.isFinite(value))
  ) {
    throw new Error('The regression produced a non-finite numerical result.');
  }
  const warningThreshold = frequency === 'daily' ? 60 : 36;
  const warnings: RegressionWarning[] = [];
  if (n < warningThreshold)
    warnings.push({ code: 'shortSample', threshold: warningThreshold, frequency });
  const meanAbsolute = (values: number[]) =>
    values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length;
  const marketScale = meanAbsolute(rows.map((row) => row.mkt_rf));
  const ratio =
    marketScale > 0 ? meanAbsolute(rows.map((row) => row.portfolioReturn)) / marketScale : 0;
  if (ratio > PERCENT_SCALE_RATIO) warnings.push({ code: 'percentScale', ratio });
  return {
    labels,
    coefficients,
    standardErrors,
    tStats,
    pValues,
    rSquared,
    incrementalRSquared,
    adjustedRSquared,
    annualizedAlpha: coefficients[0]! * (frequency === 'daily' ? 252 : 12),
    observations: n,
    hacLags,
    dates: rows.map((row) => row.date),
    actualCumulative: cumulative(yValues),
    explainedCumulative: cumulative(fitted.map((value) => value - coefficients[0]!)),
    selectedFactors,
    warnings,
  };
}
