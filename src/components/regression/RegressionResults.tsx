import { useEffect, useRef, useState } from 'preact/hooks';
import uPlot from 'uplot';
import { chartHeight, isoDate, timeAxis } from '@/lib/charts/time-axis';
import {
  formatChartReturn,
  formatGrowthIndex,
  growthIndexSplits,
  toChartValue,
  type ChartScaleMode,
} from '@/lib/data/chart-scale';
import '../scale-toggle.css';
import 'uplot/dist/uPlot.min.css';
import type { RegressionResult, RegressionWarning } from '@/lib/regression/engine';
import { regressionCsv, type ResultContext } from '@/lib/regression/export';
import { COPY, interpolate } from '@/i18n/content';
import type { Locale } from '@/i18n/locales';

const percent = (value: number) => `${(value * 100).toFixed(2)}%`;
const statistic = (value: number) => (Number.isFinite(value) ? value.toFixed(3) : '—');
const pValue = (value: number) => (value < 0.001 ? '< 0.001' : value.toFixed(3));
const incrementalR2 = (value: number) => `+${value.toFixed(3)}`;

function warningText(
  warning: RegressionWarning,
  copy: (typeof COPY)[Locale]['regression'],
): string {
  if (warning.code === 'shortSample') {
    return interpolate(copy.warningShortSample, {
      threshold: warning.threshold,
      frequency: copy[warning.frequency],
    });
  }
  return interpolate(copy.warningPercentScale, { ratio: Math.round(warning.ratio) });
}

function downloadResults(result: RegressionResult, context: ResultContext) {
  const blob = new Blob([regressionCsv(result, context)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'factor_library_il_regression_results.csv';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/** Fills the band between the actual and factor-explained curves. That band is cumulative alpha,
 * so it is the point of the chart: green where the portfolio beat its factor exposures, red where
 * it trailed them. Drawn per segment, under the strokes. */
const alphaBand: uPlot.Plugin = {
  hooks: {
    drawClear: (u) => {
      const [, actual, explained] = u.data as [number[], number[], number[]];
      if (!actual || !explained) return;
      const { ctx } = u;
      ctx.save();
      ctx.beginPath();
      ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height);
      ctx.clip();
      for (let i = 1; i < actual.length; i += 1) {
        const a0 = actual[i - 1]!;
        const a1 = actual[i]!;
        const f0 = explained[i - 1]!;
        const f1 = explained[i]!;
        const x0 = u.valToPos(u.data[0]![i - 1]!, 'x', true);
        const x1 = u.valToPos(u.data[0]![i]!, 'x', true);
        ctx.beginPath();
        ctx.moveTo(x0, u.valToPos(a0, 'y', true));
        ctx.lineTo(x1, u.valToPos(a1, 'y', true));
        ctx.lineTo(x1, u.valToPos(f1, 'y', true));
        ctx.lineTo(x0, u.valToPos(f0, 'y', true));
        ctx.closePath();
        ctx.fillStyle = a0 + a1 >= f0 + f1 ? 'rgba(22, 163, 116, 0.22)' : 'rgba(209, 52, 56, 0.20)';
        ctx.fill();
      }
      ctx.restore();
    },
  },
};

function FitChart({ result, locale }: { result: RegressionResult; locale: Locale }) {
  const copy = COPY[locale].regression;
  const chartCopy = COPY[locale].chart;
  const host = useRef<HTMLDivElement>(null);
  const [scaleMode, setScaleMode] = useState<ChartScaleMode>('logarithmic');
  // A portfolio that lost everything has no logarithm. Rather than throw inside the effect and
  // blank the results, fall back to the arithmetic scale and say so by disabling the switch.
  const logAvailable = [...result.actualCumulative, ...result.explainedCumulative].every(
    (value) => 1 + value > 0,
  );
  const mode: ChartScaleMode = logAvailable ? scaleMode : 'arithmetic';

  useEffect(() => {
    if (!host.current) return;
    const chartHost = host.current;
    const width = Math.max(240, chartHost.clientWidth);
    const data: uPlot.AlignedData = [
      result.dates.map((date) => Date.parse(`${date}T00:00:00Z`) / 1000),
      result.actualCumulative.map((value) => toChartValue(1 + value, mode)),
      result.explainedCumulative.map((value) => toChartValue(1 + value, mode)),
    ];
    const readout = (_u: uPlot, value: number | null) =>
      value === null ? '-' : formatChartReturn(value, mode);
    const plot = new uPlot(
      {
        width,
        height: chartHeight(width),
        cursor: { drag: { x: true, y: false } },
        plugins: [alphaBand],
        axes: [
          timeAxis(),
          {
            splits:
              mode === 'logarithmic'
                ? (_u, _axisIndex, scaleMin, scaleMax) => growthIndexSplits(scaleMin, scaleMax)
                : undefined,
            values: (_u, values) =>
              values.map((value) =>
                mode === 'logarithmic'
                  ? formatGrowthIndex(value)
                  : formatChartReturn(value, mode, 0),
              ),
          },
        ],
        series: [
          {
            label: copy.date,
            value: (_u, timestamp) => (timestamp === null ? '-' : isoDate(timestamp)),
          },
          { label: copy.actual, stroke: '#0969e8', width: 2, value: readout },
          { label: copy.explained, stroke: '#7c3aed', width: 2, value: readout },
        ],
      },
      data,
      chartHost,
    );
    // uPlot fills the readout on hover only, and touch does not hover, so on a phone the values
    // would read as dashes forever. A pointer device keeps uPlot's own behaviour.
    const seedCursor = () => {
      const last = data[0]?.at(-1);
      if (last !== undefined && plot.width < 768) {
        plot.setCursor({ left: plot.valToPos(last, 'x'), top: 0 });
      }
    };
    seedCursor();
    const observer = new ResizeObserver(() => {
      const next = Math.max(240, chartHost.clientWidth);
      plot.setSize({ width: next, height: chartHeight(next) });
      seedCursor();
    });
    observer.observe(chartHost);
    return () => {
      observer.disconnect();
      plot.destroy();
    };
  }, [copy.actual, copy.date, copy.explained, mode, result]);

  // Ratio, not difference: subtracting two compounded curves inflates the gap by the level they
  // have reached, so a fund up 300% would show a far larger "alpha" than one up 30% at the same
  // skill. The ratio is also exactly the vertical gap the eye reads on the logarithmic scale.
  const finalActual = result.actualCumulative.at(-1) ?? 0;
  const finalExplained = result.explainedCumulative.at(-1) ?? 0;
  const alpha = finalExplained > -1 ? (1 + finalActual) / (1 + finalExplained) - 1 : Number.NaN;
  return (
    <>
      <div class="fit-head">
        <h3>{copy.fitTitle}</h3>
        <div class="scale-toggle" aria-label={chartCopy.scale} dir="ltr">
          <button
            class={mode === 'logarithmic' ? 'active' : ''}
            aria-label={chartCopy.logScale}
            aria-pressed={mode === 'logarithmic'}
            disabled={!logAvailable}
            onClick={() => setScaleMode('logarithmic')}
            type="button"
          >
            L
          </button>
          <button
            class={mode === 'arithmetic' ? 'active' : ''}
            aria-label={chartCopy.arithmeticScale}
            aria-pressed={mode === 'arithmetic'}
            onClick={() => setScaleMode('arithmetic')}
            type="button"
          >
            A
          </button>
        </div>
      </div>
      <div
        ref={host}
        class="fit-chart"
        role="img"
        aria-describedby="fit-chart-summary"
        aria-label={copy.fitAria}
        dir="ltr"
      />
      <p class="fit-caption">{interpolate(copy.fitCaption, { alpha: percent(alpha) })}</p>
      <p id="fit-chart-summary" class="sr-only">
        {interpolate(copy.fitSummary, {
          start: result.dates[0]!,
          end: result.dates.at(-1)!,
          actual: percent(result.actualCumulative.at(-1) ?? 0),
          explained: percent(result.explainedCumulative.at(-1) ?? 0),
        })}
      </p>
    </>
  );
}

export function RegressionResults({
  result,
  context,
  locale = 'he',
}: {
  result: RegressionResult;
  context: ResultContext;
  locale?: Locale;
}) {
  const copy = COPY[locale].regression;
  return (
    <section class="results card" aria-labelledby="results-title">
      <div class="results-head">
        <div>
          <h2 id="results-title">{copy.resultsTitle}</h2>
          <p class="result-model">
            {copy.model} <bdi>{result.labels.slice(1).join(' + ')}</bdi>
          </p>
        </div>
        <button
          class="button secondary"
          type="button"
          onClick={() => downloadResults(result, context)}
        >
          {copy.downloadResults}
        </button>
      </div>
      {result.warnings.map((warning) => (
        <p class="warning" role="status" dir="auto" key={warning.code}>
          {warningText(warning, copy)}
        </p>
      ))}
      <div class="metrics">
        <div>
          <span>{copy.observations}</span>
          <strong dir="ltr">{result.observations}</strong>
        </div>
        <div>
          <span>{copy.adjustedRSquared}</span>
          <strong dir="ltr">{result.adjustedRSquared.toFixed(3)}</strong>
        </div>
        <div>
          <span>{copy.alpha}</span>
          <strong dir="ltr">{percent(result.annualizedAlpha)}</strong>
        </div>
        <div>
          <span>{copy.alphaInference}</span>
          <strong class="alpha-inference" dir="ltr">
            t = {statistic(result.tStats[0]!)} · p = {pValue(result.pValues[0]!)}
          </strong>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">{copy.factor}</th>
              <th scope="col">{copy.coefficient}</th>
              <th scope="col">{copy.incrementalRSquared}</th>
              <th scope="col">{copy.hacSe}</th>
              <th scope="col">{copy.tStat}</th>
              <th scope="col">{copy.pValue}</th>
            </tr>
          </thead>
          <tbody>
            {result.labels.slice(1).map((label, factorIndex) => {
              const resultIndex = factorIndex + 1;
              return (
                <tr>
                  <th scope="row">
                    <bdi dir="ltr">{label}</bdi>
                  </th>
                  <td>
                    <bdi dir="ltr">{statistic(result.coefficients[resultIndex]!)}</bdi>
                  </td>
                  <td>
                    <bdi dir="ltr">{incrementalR2(result.incrementalRSquared[factorIndex]!)}</bdi>
                  </td>
                  <td>
                    <bdi dir="ltr">{statistic(result.standardErrors[resultIndex]!)}</bdi>
                  </td>
                  <td>
                    <bdi dir="ltr">{statistic(result.tStats[resultIndex]!)}</bdi>
                  </td>
                  <td>
                    <bdi dir="ltr">{pValue(result.pValues[resultIndex]!)}</bdi>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p class="method-note">
        {interpolate(copy.methodNote, {
          lags: result.hacLags,
          plural: locale === 'en' && result.hacLags !== 1 ? 's' : '',
        })}
      </p>
      <details class="results-guide">
        <summary>{copy.guide}</summary>
        <p class="guide-intro">{copy.guideIntro}</p>
        <h4>{copy.readingOrderTitle}</h4>
        <ol class="guide-steps">
          <li>
            <strong>{copy.orderStep1Label}</strong> {copy.orderStep1}
          </li>
          <li>
            <strong>{copy.orderStep2Label}</strong> {copy.orderStep2}
          </li>
          <li>
            <strong>{copy.orderStep3Label}</strong> {copy.orderStep3}
          </li>
          <li>
            <strong>{copy.orderStep4Label}</strong> {copy.orderStep4}
          </li>
        </ol>
        <h4>{copy.termsTitle}</h4>
        <dl>
          <div>
            <dt>{copy.deltaLabel}</dt>
            <dd>{copy.deltaText}</dd>
          </div>
          <div>
            <dt>{copy.hacLabel}</dt>
            <dd>{copy.hacText}</dd>
          </div>
          <div>
            <dt>{copy.tpLabel}</dt>
            <dd>{copy.tpText}</dd>
          </div>
        </dl>
        <h4>{copy.misreadTitle}</h4>
        <ul class="guide-warnings">
          <li>
            <strong>{copy.warn1Label}</strong> {copy.warn1}
          </li>
          <li>
            <strong>{copy.warn2Label}</strong> {copy.warn2}
          </li>
          <li>
            <strong>{copy.warn3Label}</strong> {copy.warn3}
          </li>
          <li>
            <strong>{copy.warn4Label}</strong> {copy.warn4}
          </li>
        </ul>
      </details>
      <FitChart result={result} locale={locale} />
    </section>
  );
}
