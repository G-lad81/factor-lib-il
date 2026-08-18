import type { RegressionFactor } from '@/config/factors';
import { ContractError, isIsoDate, type ReadyManifest } from './contracts';

const NOTE_KEYS = ['frictionless', 'inference', 'sharpe', 'power', 'window'] as const;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export interface FactorStatistics {
  mean_monthly: number;
  vol_monthly: number;
  sharpe_ann: number;
  t_stat_hac: number;
  p_value_hac: number;
  max_drawdown: number;
}

export interface PerformanceStatistics {
  data_version: string;
  generated_at: string;
  window: { start: string; end: string; months: number };
  risk_free: { mean_ann: number; mean_monthly: number };
  factors: Partial<Record<RegressionFactor, FactorStatistics>>;
  notes: Record<(typeof NOTE_KEYS)[number], string>;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ContractError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function finite(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ContractError(`${label} must be a finite number.`);
  }
  return value;
}

function factorStatistics(value: unknown, key: RegressionFactor): FactorStatistics {
  const item = record(value, `Statistics for ${key}`);
  const statistics = {
    mean_monthly: finite(item.mean_monthly, `${key}.mean_monthly`),
    vol_monthly: finite(item.vol_monthly, `${key}.vol_monthly`),
    sharpe_ann: finite(item.sharpe_ann, `${key}.sharpe_ann`),
    t_stat_hac: finite(item.t_stat_hac, `${key}.t_stat_hac`),
    p_value_hac: finite(item.p_value_hac, `${key}.p_value_hac`),
    max_drawdown: finite(item.max_drawdown, `${key}.max_drawdown`),
  };
  if (statistics.vol_monthly < 0) throw new ContractError(`${key}.vol_monthly cannot be negative.`);
  if (statistics.p_value_hac < 0 || statistics.p_value_hac > 1) {
    throw new ContractError(`${key}.p_value_hac must be between zero and one.`);
  }
  if (statistics.max_drawdown < -1 || statistics.max_drawdown > 0) {
    throw new ContractError(`${key}.max_drawdown must be between -1 and zero.`);
  }
  return statistics;
}

export function validatePerformanceStatistics(
  value: unknown,
  factorKeys: readonly RegressionFactor[],
): PerformanceStatistics {
  const source = record(value, 'Performance statistics');
  if (typeof source.data_version !== 'string' || source.data_version.trim() === '') {
    throw new ContractError('Performance statistics require a data version.');
  }
  if (
    typeof source.generated_at !== 'string' ||
    !ISO_TIMESTAMP.test(source.generated_at) ||
    !Number.isFinite(Date.parse(source.generated_at))
  ) {
    throw new ContractError('Performance statistics require an ISO UTC generation time.');
  }

  const window = record(source.window, 'Performance window');
  if (
    typeof window.start !== 'string' ||
    !isIsoDate(window.start) ||
    typeof window.end !== 'string' ||
    !isIsoDate(window.end) ||
    window.start > window.end ||
    !Number.isInteger(window.months) ||
    (window.months as number) < 1
  ) {
    throw new ContractError(
      'Performance window must contain valid dates and a positive month count.',
    );
  }

  const riskFree = record(source.risk_free, 'Risk-free statistics');
  const factorSource = record(source.factors, 'Factor statistics');
  const actualKeys = Object.keys(factorSource);
  if (
    actualKeys.length !== factorKeys.length ||
    factorKeys.some((key) => !Object.hasOwn(factorSource, key))
  ) {
    throw new ContractError(`Factor statistics must contain exactly: ${factorKeys.join(',')}.`);
  }

  const notesSource = record(source.notes, 'Performance notes');
  const notes = Object.fromEntries(
    NOTE_KEYS.map((key) => {
      const note = notesSource[key];
      if (typeof note !== 'string' || note.trim() === '') {
        throw new ContractError(`Performance note “${key}” is required.`);
      }
      return [key, note];
    }),
  ) as PerformanceStatistics['notes'];

  return {
    data_version: source.data_version,
    generated_at: source.generated_at,
    window: {
      start: window.start as string,
      end: window.end as string,
      months: window.months as number,
    },
    risk_free: {
      mean_ann: finite(riskFree.mean_ann, 'risk_free.mean_ann'),
      mean_monthly: finite(riskFree.mean_monthly, 'risk_free.mean_monthly'),
    },
    factors: Object.fromEntries(
      factorKeys.map((key) => [key, factorStatistics(factorSource[key], key)]),
    ) as PerformanceStatistics['factors'],
    notes,
  };
}

export function validatePerformanceRelease(
  statistics: PerformanceStatistics,
  manifest: ReadyManifest,
): void {
  if (statistics.data_version !== manifest.data_version) {
    throw new ContractError('Performance statistics and manifest data versions do not match.');
  }
  const expectedFactors = manifest.factors.filter(
    (factor): factor is RegressionFactor => factor !== 'rf',
  );
  const actualFactors = Object.keys(statistics.factors);
  if (
    actualFactors.length !== expectedFactors.length ||
    expectedFactors.some((factor) => !Object.hasOwn(statistics.factors, factor))
  ) {
    throw new ContractError('Performance statistics do not match the manifest factor set.');
  }
  if (statistics.generated_at !== manifest.generated_at) {
    throw new ContractError('Performance statistics and manifest generation times do not match.');
  }
  if (
    statistics.window.start !== manifest.monthly.coverage_start ||
    statistics.window.end !== manifest.monthly.coverage_end ||
    statistics.window.months !== manifest.monthly.rows
  ) {
    throw new ContractError('Performance statistics do not match the monthly release window.');
  }
}
