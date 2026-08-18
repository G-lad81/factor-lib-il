import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import './factor-chart.css';
import './scale-toggle.css';
import { FACTORS, type FactorKey } from '@/config/factors';
import {
  formatChartReturn,
  formatGrowthIndex,
  growthIndexSplits,
  toChartValue,
  type ChartScaleMode,
} from '@/lib/data/chart-scale';
import { ContractError, loadFactors, loadManifest, type FactorRow } from '@/lib/data/contracts';
import { chartHeight, isoDate, timeAxis } from '@/lib/charts/time-axis';
import { COPY } from '@/i18n/content';
import type { Locale } from '@/i18n/locales';

type Range = 'ytd' | '1y' | '3y' | 'all';

function cumulativeWealth(rows: FactorRow[], key: FactorKey): number[] {
  let wealth = 1;
  return rows.map((row) => {
    const value = row[key];
    if (value === undefined) throw new ContractError(`Factor ${key} is missing from a data row.`);
    wealth *= 1 + value;
    return wealth;
  });
}

function formatCumulativeReturn(wealth: number, digits = 2): string {
  return `${((wealth - 1) * 100).toFixed(digits)}%`;
}

export default function FactorChart({ locale = 'he' }: { locale?: Locale }) {
  const copy = COPY[locale].chart;
  const host = useRef<HTMLDivElement>(null);
  const plot = useRef<uPlot>();
  const [rows, setRows] = useState<FactorRow[]>([]);
  const [activeFactors, setActiveFactors] = useState<FactorKey[]>([]);
  const [range, setRange] = useState<Range>('all');
  const [scaleMode, setScaleMode] = useState<ChartScaleMode>('logarithmic');
  const [visible, setVisible] = useState<Record<FactorKey, boolean>>({
    rf: true,
    mkt_rf: true,
    smb: true,
    hml: true,
    mom: true,
  });
  const activeDefinitions = useMemo(
    () => FACTORS.filter((factor) => activeFactors.includes(factor.key)),
    [activeFactors],
  );
  const [message, setMessage] = useState(copy.checking);

  useEffect(() => {
    loadManifest()
      .then(async (manifest) => {
        if (manifest.status !== 'ready') {
          setMessage(copy.pending);
          return;
        }
        setActiveFactors(manifest.factors);
        setRows(await loadFactors('daily', manifest));
        setMessage('');
      })
      .catch((error: unknown) =>
        setMessage(error instanceof ContractError ? error.message : copy.failed),
      );
  }, [copy.failed, copy.pending]);

  useEffect(() => {
    if (!host.current || rows.length === 0) return;
    plot.current?.destroy();
    const finalDate = new Date(`${rows.at(-1)!.date}T00:00:00Z`);
    const cutoff = new Date(finalDate);
    if (range === 'ytd') cutoff.setUTCMonth(0, 1);
    if (range === '1y') cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
    if (range === '3y') cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 3);
    const found = rows.findIndex((row) => row.date >= cutoff.toISOString().slice(0, 10));
    const start = range === 'all' || found < 0 ? 0 : found;
    const selected = rows.slice(start);
    const data: uPlot.AlignedData = [
      selected.map((row) => Date.parse(`${row.date}T00:00:00Z`) / 1000),
      ...activeDefinitions.map((factor) =>
        cumulativeWealth(selected, factor.key).map((wealth) => toChartValue(wealth, scaleMode)),
      ),
    ];
    const width = Math.max(240, host.current.clientWidth);
    plot.current = new uPlot(
      {
        width,
        height: chartHeight(width),
        cursor: { drag: { x: true, y: false } },
        scales: { x: { time: true }, y: { distr: 1 } },
        axes: [
          timeAxis(),
          {
            splits:
              scaleMode === 'logarithmic'
                ? (_u, _axisIndex, scaleMin, scaleMax) => growthIndexSplits(scaleMin, scaleMax)
                : undefined,
            values: (_u, values) =>
              values.map((value) =>
                scaleMode === 'logarithmic'
                  ? formatGrowthIndex(value)
                  : formatChartReturn(value, scaleMode, 0),
              ),
          },
        ],
        series: [
          {
            value: (_u, timestamp) => (timestamp === null ? '-' : isoDate(timestamp)),
          },
          ...activeDefinitions.map((factor) => ({
            label: factor.symbol,
            stroke: factor.color,
            width: 2,
            show: visible[factor.key],
            value: (_u: uPlot, value: number | null) =>
              value === null ? '-' : formatChartReturn(value, scaleMode),
          })),
        ],
      },
      data,
      host.current,
    );
    // uPlot fills the readout on hover only, and touch does not hover, so on a phone the values
    // would read as dashes forever. A pointer device keeps uPlot's own behaviour.
    const seedCursor = () => {
      const u = plot.current;
      const last = data[0]?.at(-1);
      if (u && last !== undefined && u.width < 768) {
        u.setCursor({ left: u.valToPos(last, 'x'), top: 0 });
      }
    };
    seedCursor();
    const observer = new ResizeObserver(() => {
      if (host.current && plot.current) {
        const next = Math.max(240, host.current.clientWidth);
        plot.current.setSize({ width: next, height: chartHeight(next) });
        seedCursor();
      }
    });
    observer.observe(host.current);
    return () => {
      observer.disconnect();
      plot.current?.destroy();
    };
  }, [rows, range, visible, activeDefinitions, scaleMode]);

  return (
    <>
      <div class="chart-head">
        <div class="chart-title">
          <h2 id="chart-title">{copy.title}</h2>
          <span>{scaleMode === 'logarithmic' ? copy.growth : copy.arithmetic}</span>
        </div>
        <div class="chart-controls">
          <div class="scale-toggle" aria-label={copy.scale} dir="ltr">
            <button
              class={scaleMode === 'logarithmic' ? 'active' : ''}
              aria-label={copy.logScale}
              aria-pressed={scaleMode === 'logarithmic'}
              onClick={() => setScaleMode('logarithmic')}
              type="button"
            >
              L
            </button>
            <button
              class={scaleMode === 'arithmetic' ? 'active' : ''}
              aria-label={copy.arithmeticScale}
              aria-pressed={scaleMode === 'arithmetic'}
              onClick={() => setScaleMode('arithmetic')}
              type="button"
            >
              A
            </button>
          </div>
          <div class="ranges" aria-label={copy.range} dir="ltr">
            {(['ytd', '1y', '3y', 'all'] as Range[]).map((item) => (
              <button
                class={range === item ? 'active' : ''}
                aria-pressed={range === item}
                onClick={() => setRange(item)}
                type="button"
              >
                {copy.ranges[item]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <section class="chart-card card" aria-labelledby="chart-title">
        {rows.length > 0 && (
          <div class="legend" aria-label={copy.series} dir="ltr">
            {activeDefinitions.map((factor) => (
              <label>
                <input
                  type="checkbox"
                  checked={visible[factor.key]}
                  onChange={() =>
                    setVisible((state) => ({ ...state, [factor.key]: !state[factor.key] }))
                  }
                />
                <span style={{ background: factor.color }}></span>
                {factor.symbol}
              </label>
            ))}
          </div>
        )}
        {message ? (
          <div class="pending" role="status" dir="auto">
            <strong>{copy.pendingTitle}</strong>
            <p>{message}</p>
          </div>
        ) : (
          <div ref={host} class="plot" role="img" aria-label={copy.aria} dir="ltr" />
        )}
        {rows.length > 0 && (
          <table class="sr-only">
            <caption>{copy.latestCaption}</caption>
            <tbody>
              {activeDefinitions.map((factor) => {
                const values = cumulativeWealth(rows, factor.key);
                return (
                  <tr>
                    <th dir="ltr">{factor.symbol}</th>
                    <td dir="ltr">
                      {values.at(-1) ? formatCumulativeReturn(values.at(-1)!) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
