export type ChartScaleMode = 'logarithmic' | 'arithmetic';

export function toChartValue(wealth: number, mode: ChartScaleMode): number {
  if (!Number.isFinite(wealth) || wealth <= 0) {
    throw new Error('Cumulative wealth must be a positive finite number.');
  }

  return mode === 'logarithmic' ? Math.log(wealth) : wealth - 1;
}

export function chartValueToReturn(value: number, mode: ChartScaleMode): number {
  return mode === 'logarithmic' ? Math.expm1(value) : value;
}

export function formatChartReturn(value: number, mode: ChartScaleMode, digits = 2): string {
  const percent = chartValueToReturn(value, mode) * 100;
  const threshold = 0.5 * 10 ** -digits;
  const normalized = Math.abs(percent) < threshold ? 0 : percent;
  return `${normalized.toFixed(digits)}%`;
}

export function formatGrowthIndex(value: number): string {
  const indexValue = Math.exp(value) * 100;
  const digits = indexValue < 10 ? 1 : 0;
  return indexValue.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function niceLinearStep(span: number, targetIntervals = 5): number {
  const rawStep = span / targetIntervals;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * magnitude;
}

export function growthIndexSplits(scaleMin: number, scaleMax: number): number[] {
  const minimum = Math.exp(scaleMin) * 100;
  const maximum = Math.exp(scaleMax) * 100;
  const candidates: number[] = [];
  const firstPower = Math.floor(Math.log10(minimum)) - 1;
  const lastPower = Math.ceil(Math.log10(maximum)) + 1;

  for (let power = firstPower; power <= lastPower; power += 1) {
    for (const multiplier of [1, 2, 5]) {
      const value = multiplier * 10 ** power;
      if (value >= minimum && value <= maximum) candidates.push(value);
    }
  }

  if (candidates.length >= 3) {
    return candidates.map((value) => Math.log(value / 100));
  }

  const step = niceLinearStep(maximum - minimum);
  const first = Math.ceil(minimum / step) * step;
  const fallback: number[] = [];
  for (let value = first; value <= maximum; value += step) fallback.push(value);
  return fallback.map((value) => Math.log(value / 100));
}
