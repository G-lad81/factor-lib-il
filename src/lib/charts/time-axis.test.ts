import { describe, expect, it } from 'vitest';
import {
  chartHeight,
  isoDate,
  monthBoundaryLabel,
  monthBoundaryTicks,
  tickBudget,
  timeAxis,
} from './time-axis';

const utc = (year: number, month: number, day = 1) => Date.UTC(year, month, day) / 1000;

describe('tick budget', () => {
  it('allows about one label per 64 pixels', () => {
    expect(tickBudget(512)).toBe(8);
    expect(tickBudget(640)).toBe(10);
  });

  it('never collapses below three or grows past thirteen', () => {
    expect(tickBudget(0)).toBe(3);
    expect(tickBudget(240)).toBe(3);
    expect(tickBudget(4000)).toBe(13);
  });
});

describe('chart height', () => {
  it('steps down for narrow viewports', () => {
    expect(chartHeight(390)).toBe(260);
    expect(chartHeight(600)).toBe(300);
    expect(chartHeight(1280)).toBe(360);
  });

  it('changes at the documented boundaries, not around them', () => {
    expect(chartHeight(479)).toBe(260);
    expect(chartHeight(480)).toBe(300);
    expect(chartHeight(767)).toBe(300);
    expect(chartHeight(768)).toBe(360);
  });
});

describe('month boundary ticks', () => {
  it('returns calendar month starts inside the range', () => {
    const ticks = monthBoundaryTicks(utc(2025, 0), utc(2025, 11), 13);
    expect(ticks[0]).toBe(utc(2025, 0));
    expect(ticks.at(-1)).toBe(utc(2025, 11));
    expect(ticks).toHaveLength(12);
    for (const tick of ticks) {
      const date = new Date(tick * 1000);
      expect(date.getUTCDate()).toBe(1);
      expect(date.getUTCHours()).toBe(0);
    }
  });

  it('widens the step so a long range stays within the tick budget', () => {
    const ticks = monthBoundaryTicks(utc(2016, 0), utc(2026, 0), 13);
    expect(ticks.length).toBeLessThanOrEqual(13);
    // a decade lands on year boundaries rather than months
    expect(ticks.every((tick) => new Date(tick * 1000).getUTCMonth() === 0)).toBe(true);
  });

  it('honours a tighter budget on a narrow chart', () => {
    const wide = monthBoundaryTicks(utc(2020, 0), utc(2026, 0), 13);
    const narrow = monthBoundaryTicks(utc(2020, 0), utc(2026, 0), 3);
    expect(narrow.length).toBeLessThanOrEqual(3);
    expect(narrow.length).toBeLessThan(wide.length);
  });

  it('never emits a tick before the range starts', () => {
    // a range opening mid-month must not reach back to that month's first day
    const start = utc(2025, 5, 17);
    const ticks = monthBoundaryTicks(start, utc(2025, 11), 13);
    expect(Math.min(...ticks)).toBeGreaterThanOrEqual(start);
  });

  it('crosses a year boundary without repeating or skipping a month', () => {
    const ticks = monthBoundaryTicks(utc(2025, 9), utc(2026, 2), 13);
    expect(ticks).toEqual([
      utc(2025, 9),
      utc(2025, 10),
      utc(2025, 11),
      utc(2026, 0),
      utc(2026, 1),
      utc(2026, 2),
    ]);
  });
});

describe('month boundary labels', () => {
  it('shows the year alone once ticks are a year apart', () => {
    const ticks = [utc(2024, 0), utc(2025, 0), utc(2026, 0)];
    expect(ticks.map((tick) => monthBoundaryLabel(tick, ticks))).toEqual(['2024', '2025', '2026']);
  });

  it('repeats the year only where it turns over, and on the first label', () => {
    const ticks = [utc(2025, 9), utc(2025, 10), utc(2025, 11), utc(2026, 0), utc(2026, 1)];
    expect(ticks.map((tick) => monthBoundaryLabel(tick, ticks))).toEqual([
      'Oct 25',
      'Nov',
      'Dec',
      'Jan 26',
      'Feb',
    ]);
  });

  it('uses Latin month names, which are unambiguous to a Hebrew reader', () => {
    const ticks = [utc(2025, 2), utc(2025, 3)];
    expect(monthBoundaryLabel(ticks[1]!, ticks)).toBe('Apr');
  });
});

describe('isoDate', () => {
  it('reads the date back in UTC, so a monthly observation keeps its date', () => {
    expect(isoDate(utc(2026, 6, 31))).toBe('2026-07-31');
    expect(isoDate(utc(2015, 6, 1))).toBe('2015-07-01');
  });
});

describe('timeAxis', () => {
  it('derives its tick density from the plot width', () => {
    const axis = timeAxis();
    const splits = axis.splits as (
      u: { width: number },
      i: number,
      min: number,
      max: number,
    ) => number[];
    const narrow = splits({ width: 240 }, 0, utc(2020, 0), utc(2026, 0));
    const wide = splits({ width: 1280 }, 0, utc(2020, 0), utc(2026, 0));
    expect(narrow.length).toBeLessThan(wide.length);
  });

  it('labels whatever splits it is handed', () => {
    const axis = timeAxis();
    const values = axis.values as (u: unknown, splits: number[]) => string[];
    expect(values(null, [utc(2024, 0), utc(2025, 0)])).toEqual(['2024', '2025']);
  });
});
