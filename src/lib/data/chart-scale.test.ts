import { describe, expect, it } from 'vitest';
import {
  chartValueToReturn,
  formatChartReturn,
  formatGrowthIndex,
  growthIndexSplits,
  toChartValue,
} from './chart-scale';

describe('chart scale conversion', () => {
  it('converts logarithmic chart coordinates back to cumulative returns', () => {
    expect(formatChartReturn(toChartValue(1, 'logarithmic'), 'logarithmic', 0)).toBe('0%');
    expect(formatChartReturn(toChartValue(10, 'logarithmic'), 'logarithmic', 0)).toBe('900%');
    expect(formatChartReturn(toChartValue(0.5, 'logarithmic'), 'logarithmic', 0)).toBe('-50%');
  });

  it('uses cumulative return directly on the arithmetic scale', () => {
    expect(toChartValue(1.5, 'arithmetic')).toBeCloseTo(0.5);
    expect(formatChartReturn(toChartValue(1.5, 'arithmetic'), 'arithmetic', 0)).toBe('50%');
  });

  it('round-trips positive wealth on the logarithmic scale', () => {
    const wealth = 2.75;
    const cumulativeReturn = chartValueToReturn(toChartValue(wealth, 'logarithmic'), 'logarithmic');
    expect(cumulativeReturn).toBeCloseTo(wealth - 1);
  });

  it('rejects wealth values that cannot be plotted logarithmically', () => {
    expect(() => toChartValue(0, 'logarithmic')).toThrow(/positive finite/);
  });

  it('uses conventional growth-of-100 labels for a broad logarithmic range', () => {
    const splits = growthIndexSplits(Math.log(0.5), Math.log(10));
    expect(splits.map(formatGrowthIndex)).toEqual(['50', '100', '200', '500', '1,000']);
  });

  it('uses readable index increments for a narrow logarithmic range', () => {
    const splits = growthIndexSplits(Math.log(0.9), Math.log(1.2));
    expect(splits.map(formatGrowthIndex)).toEqual(['90', '100', '110', '120']);
  });
});
