/** Shared date-axis behaviour for every uPlot chart on the site, so the factor chart and the
 * regression fit chart label time the same way and respond to width the same way. */
import type uPlot from 'uplot';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
/** Month steps a reader expects to see on an axis: monthly, bi-monthly, quarterly, and so on. */
const MONTH_STEPS = [1, 2, 3, 6, 12, 24, 60, 120] as const;
const utcMonth = (year: number, month: number) => Date.UTC(year, month, 1) / 1000;

/** Roughly 64px per label, so a phone gets four or five ticks instead of thirteen colliding. */
export const tickBudget = (width: number) => Math.max(3, Math.min(13, Math.floor(width / 64)));
export const chartHeight = (width: number) => (width < 480 ? 260 : width < 768 ? 300 : 360);

/** Calendar-boundary ticks with Latin month names: numeric dates like "1/2" are ambiguous to an
 * Israeli reader, and Hebrew inside the canvas invites bidi surprises. */
export function monthBoundaryTicks(min: number, max: number, maxTicks: number): number[] {
  const months = (max - min) / 86_400 / 30.44;
  const step = MONTH_STEPS.find((candidate) => months / candidate <= maxTicks) ?? 120;
  const from = new Date(min * 1000);
  let year = from.getUTCFullYear();
  let month = Math.ceil(from.getUTCMonth() / step) * step;
  const ticks: number[] = [];
  while (utcMonth(year, month) <= max) {
    const tick = utcMonth(year, month);
    if (tick >= min) ticks.push(tick);
    month += step;
    year += Math.floor(month / 12);
    month %= 12;
  }
  return ticks;
}

export function monthBoundaryLabel(timestamp: number, ticks: number[]): string {
  const date = new Date(timestamp * 1000);
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  const yearly = ticks.length > 1 && (ticks[1]! - ticks[0]!) / 86_400 >= 300;
  if (yearly) return String(year);
  // the year is worth repeating only where it turns over, or on the very first label
  return month === 0 || timestamp === ticks[0]
    ? `${MONTH_LABELS[month]} ${String(year).slice(2)}`
    : MONTH_LABELS[month]!;
}

/** Dates are parsed at UTC midnight; rendering them in Israel local time is what turns a monthly
 * observation into "2:00am". Always read the date back out in UTC. */
export const isoDate = (timestamp: number) => new Date(timestamp * 1000).toISOString().slice(0, 10);

/** uPlot's x-axis config: calendar ticks, Latin months, width-aware density. */
export const timeAxis = (): uPlot.Axis => ({
  splits: (u, _axisIndex, scaleMin, scaleMax) =>
    monthBoundaryTicks(scaleMin, scaleMax, tickBudget(u.width)),
  values: (_u, splits) => splits.map((tick) => monthBoundaryLabel(tick, splits)),
});
