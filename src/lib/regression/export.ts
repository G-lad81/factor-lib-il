import Papa from 'papaparse';
import type { Frequency, InputKind } from '@/lib/data/contracts';
import type { RegressionResult } from './engine';

export interface ResultContext {
  inputKind: InputKind;
  frequency: Frequency;
  dataVersion: string;
  methodologyVersion: string;
  factorGeneratedAt: string;
}

export function regressionCsv(result: RegressionResult, context: ResultContext): string {
  const terms = ['alpha', ...result.selectedFactors];
  const modelFactors = result.selectedFactors.join('+');
  const rows = terms.map((term, index) => ({
    term,
    coefficient: result.coefficients[index],
    incremental_r_squared: index === 0 ? '' : result.incrementalRSquared[index - 1],
    hac_standard_error: result.standardErrors[index],
    hac_t_stat: result.tStats[index],
    hac_p_value: result.pValues[index],
    annualized_alpha: result.annualizedAlpha,
    r_squared: result.rSquared,
    adjusted_r_squared: result.adjustedRSquared,
    observations: result.observations,
    frequency: context.frequency,
    input_kind: context.inputKind,
    sample_start: result.dates[0],
    sample_end: result.dates.at(-1),
    hac_lags: result.hacLags,
    model_factors: modelFactors,
    data_version: context.dataVersion,
    methodology_version: context.methodologyVersion,
    factor_data_generated_at: context.factorGeneratedAt,
    p_value_distribution: 'two-sided asymptotic normal',
  }));

  return Papa.unparse(rows, { newline: '\r\n' });
}
