import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  loadFactors,
  loadManifest,
  portfolioReturns,
  validatePortfolioMatrix,
  type Frequency,
  type InputKind,
} from '@/lib/data/contracts';
import { fileMatrix } from '@/lib/data/portfolio-file';
import {
  alignObservations,
  OPTIONAL_FACTORS,
  runRegression,
  type OptionalFactor,
  type RegressionResult,
} from '@/lib/regression/engine';
import type { ResultContext } from '@/lib/regression/export';
import { FactorSelector } from './regression/FactorSelector';
import { FileSettings } from './regression/FileSettings';
import { FileUpload } from './regression/FileUpload';
import { RegressionResults } from './regression/RegressionResults';
import './regression-tool.css';
import { COPY, interpolate } from '@/i18n/content';
import type { Locale } from '@/i18n/locales';

const PREFERENCES_KEY = 'factor-lib-il:regression-preferences:v1';

interface RegressionPreferences {
  version: 1;
  kind: InputKind;
  frequency: Frequency;
  selectedFactors: OptionalFactor[];
}

function readPreferences(): RegressionPreferences | undefined {
  try {
    const stored = window.localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return undefined;
    const value = JSON.parse(stored) as Partial<RegressionPreferences>;
    if (
      value.version !== 1 ||
      !['nav', 'returns'].includes(value.kind ?? '') ||
      !['daily', 'monthly'].includes(value.frequency ?? '') ||
      !Array.isArray(value.selectedFactors) ||
      value.selectedFactors.some((factor) => !OPTIONAL_FACTORS.includes(factor))
    ) {
      return undefined;
    }
    return value as RegressionPreferences;
  } catch {
    return undefined;
  }
}

function savePreferences(preferences: RegressionPreferences): void {
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // The tool remains usable when browser storage is unavailable.
  }
}

export default function RegressionTool({ locale = 'he' }: { locale?: Locale }) {
  const copy = COPY[locale].regression;
  const [kind, setKind] = useState<InputKind>('nav');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [availableFactors, setAvailableFactors] = useState<OptionalFactor[]>([]);
  const [selectedFactors, setSelectedFactors] = useState<OptionalFactor[]>([]);
  const [file, setFile] = useState<File>();
  const [result, setResult] = useState<RegressionResult>();
  const [resultContext, setResultContext] = useState<ResultContext>();
  const [status, setStatus] = useState(copy.initialStatus);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState(false);
  const [running, setRunning] = useState(false);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const preferences = readPreferences();
    if (preferences) {
      setKind(preferences.kind);
      setFrequency(preferences.frequency);
    }
    loadManifest()
      .then((manifest) => {
        setAvailable(manifest.status === 'ready');
        if (manifest.status === 'ready') {
          const optional = OPTIONAL_FACTORS.filter((factor) => manifest.factors.includes(factor));
          setAvailableFactors(optional);
          setSelectedFactors(
            preferences
              ? optional.filter((factor) => preferences.selectedFactors.includes(factor))
              : optional,
          );
        } else {
          setStatus(copy.publicationPending);
        }
      })
      .catch(() => setStatus(copy.manifestFailed))
      .finally(() => setPreferencesReady(true));
  }, [copy.manifestFailed, copy.publicationPending]);

  useLayoutEffect(() => {
    if (!preferencesReady) return;
    savePreferences({ version: 1, kind, frequency, selectedFactors });
  }, [frequency, kind, preferencesReady, selectedFactors]);

  const clearOutput = () => {
    setResult(undefined);
    setResultContext(undefined);
    setError('');
  };

  const changeFileSettings = (nextKind: InputKind, nextFrequency: Frequency) => {
    setKind(nextKind);
    setFrequency(nextFrequency);
    clearOutput();
    setStatus(copy.settingsChanged);
  };

  const toggleFactor = (factor: OptionalFactor) => {
    setSelectedFactors((current) =>
      current.includes(factor)
        ? current.filter((selected) => selected !== factor)
        : availableFactors.filter(
            (candidate) => current.includes(candidate) || candidate === factor,
          ),
    );
    clearOutput();
    setStatus(file ? copy.modelChangedFile : copy.modelChanged);
  };

  const selectFile = (nextFile?: File) => {
    setFile(nextFile);
    clearOutput();
    setStatus(nextFile ? copy.fileSelected : copy.chooseFileStatus);
  };

  const run = async () => {
    if (!file) {
      setError(copy.chooseBeforeRun);
      return;
    }
    setRunning(true);
    clearOutput();
    setStatus(copy.checking);
    try {
      const manifest = await loadManifest();
      const factors = await loadFactors(frequency, manifest);
      const portfolio = validatePortfolioMatrix(await fileMatrix(file), kind, frequency, factors);
      const output = runRegression(
        alignObservations(portfolioReturns(portfolio.rows, kind), factors),
        frequency,
        selectedFactors,
      );
      setResult(output);
      setResultContext({
        inputKind: kind,
        frequency,
        dataVersion: manifest.status === 'ready' ? manifest.data_version : '',
        methodologyVersion: manifest.methodology_version,
        factorGeneratedAt: manifest.generated_at ?? '',
      });
      const summary = interpolate(copy.validated, {
        observations: output.observations,
        start: output.dates[0] ?? '',
        end: output.dates.at(-1) ?? '',
      });
      const { ignoredBefore, ignoredAfter, unmatchedDates } = portfolio.report;
      const excluded = ignoredBefore + ignoredAfter + unmatchedDates;
      setStatus(
        excluded === 0
          ? summary
          : `${summary} ${interpolate(copy.alignmentExcluded, {
              before: ignoredBefore,
              after: ignoredAfter,
              unmatched: unmatchedDates,
            })}`,
      );
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : copy.failed);
      setStatus(copy.validationFailed);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div class="regression-shell">
      <FileSettings
        locale={locale}
        kind={kind}
        frequency={frequency}
        onChange={changeFileSettings}
      />
      <FactorSelector
        available={availableFactors}
        selected={selectedFactors}
        onToggle={toggleFactor}
        locale={locale}
      />
      <FileUpload
        file={file}
        available={available}
        running={running}
        status={status}
        error={error}
        fileInput={fileInput}
        onFileChange={selectFile}
        onRun={run}
        locale={locale}
      />
      {result && resultContext && (
        <RegressionResults locale={locale} result={result} context={resultContext} />
      )}
    </div>
  );
}
