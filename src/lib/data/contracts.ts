import Papa from 'papaparse';
import { FACTORS, type FactorKey } from '@/config/factors';

export type Frequency = 'daily' | 'monthly';
export type InputKind = 'nav' | 'returns';

export interface DatasetMeta {
  path: string;
  coverage_start: string;
  coverage_end: string;
  rows: number;
}

interface ManifestBase {
  schema_version: 1;
  data_license: 'CC-BY-NC-4.0';
  methodology_version: string;
}

export interface PendingManifest extends ManifestBase {
  status: 'pending';
  data_version: null;
  generated_at: null;
  daily: null;
  monthly: null;
}

export interface ReadyManifest extends ManifestBase {
  status: 'ready';
  data_version: string;
  generated_at: string;
  factors: FactorKey[];
  daily: DatasetMeta;
  monthly: DatasetMeta;
}

export type DataManifest = PendingManifest | ReadyManifest;

export interface FactorRow extends Partial<Record<FactorKey, number>> {
  date: string;
  rf: number;
  mkt_rf: number;
}

export interface PortfolioRow {
  date: string;
  value: number;
  sourceRow: number;
}

export interface PortfolioAlignmentReport {
  inputRows: number;
  ignoredBefore: number;
  ignoredAfter: number;
  unmatchedDates: number;
  anchorUsed: boolean;
}

export interface PortfolioValidation {
  rows: PortfolioRow[];
  report: PortfolioAlignmentReport;
}

export class ContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContractError';
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const DATA_VERSION = /^\d{4}\.\d{2}(?:\.\d+)?$/;
export const KNOWN_FACTOR_KEYS = FACTORS.map((factor) => factor.key);
export const PUBLICATION_FACTOR_KEYS = [...KNOWN_FACTOR_KEYS];
const DATASET_PATHS: Record<Frequency, string> = {
  daily: 'data/factors_daily.csv',
  monthly: 'data/factors_monthly.csv',
};

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateDatasetMeta(value: unknown, frequency: Frequency): DatasetMeta {
  if (!isRecord(value)) throw new ContractError(`${frequency} metadata is required.`);
  if (value.path !== DATASET_PATHS[frequency]) {
    throw new ContractError(`${frequency} dataset path must be ${DATASET_PATHS[frequency]}.`);
  }
  if (!Number.isInteger(value.rows) || (value.rows as number) < 1) {
    throw new ContractError(`${frequency} row count must be a positive integer.`);
  }
  if (
    typeof value.coverage_start !== 'string' ||
    !isIsoDate(value.coverage_start) ||
    typeof value.coverage_end !== 'string' ||
    !isIsoDate(value.coverage_end) ||
    value.coverage_start > value.coverage_end
  ) {
    throw new ContractError(`${frequency} coverage must contain valid ascending ISO dates.`);
  }
  return {
    path: value.path,
    rows: value.rows as number,
    coverage_start: value.coverage_start,
    coverage_end: value.coverage_end,
  };
}

function validateReleaseFactors(value: unknown): FactorKey[] {
  if (!Array.isArray(value)) throw new ContractError('A ready manifest must declare its factors.');
  if (value.length < 2) throw new ContractError('A release must include RF and MKT-RF.');
  const keys = value as unknown[];
  if (
    keys.some((key) => typeof key !== 'string' || !KNOWN_FACTOR_KEYS.includes(key as FactorKey))
  ) {
    throw new ContractError(
      `Manifest factors must use known keys: ${KNOWN_FACTOR_KEYS.join(',')}.`,
    );
  }
  if (new Set(keys).size !== keys.length) {
    throw new ContractError('Manifest factors must not contain duplicates.');
  }
  const factors = keys as FactorKey[];
  const canonical = KNOWN_FACTOR_KEYS.filter((key) => factors.includes(key));
  if (factors.some((key, index) => key !== canonical[index])) {
    throw new ContractError(
      `Manifest factors must follow canonical order: ${canonical.join(',')}.`,
    );
  }
  if (factors[0] !== 'rf' || factors[1] !== 'mkt_rf') {
    throw new ContractError('Manifest factors must begin with rf,mkt_rf.');
  }
  return factors;
}

export function validateManifest(value: unknown): DataManifest {
  if (!isRecord(value)) throw new ContractError('The data manifest must be a JSON object.');
  if (value.schema_version !== 1) throw new ContractError('Unsupported manifest schema version.');
  if (value.data_license !== 'CC-BY-NC-4.0') {
    throw new ContractError('The manifest data license must be CC-BY-NC-4.0.');
  }
  if (typeof value.methodology_version !== 'string' || value.methodology_version.trim() === '') {
    throw new ContractError('The manifest methodology version is invalid.');
  }
  if (value.status === 'pending') {
    if (
      value.data_version !== null ||
      value.generated_at !== null ||
      value.daily !== null ||
      value.monthly !== null
    ) {
      throw new ContractError('A pending manifest must not contain published dataset metadata.');
    }
    return {
      schema_version: 1,
      status: 'pending',
      data_license: 'CC-BY-NC-4.0',
      methodology_version: value.methodology_version,
      data_version: null,
      generated_at: null,
      daily: null,
      monthly: null,
    };
  }
  if (value.status !== 'ready') throw new ContractError('The manifest status is invalid.');
  if (typeof value.data_version !== 'string' || !DATA_VERSION.test(value.data_version)) {
    throw new ContractError('The data version must use YYYY.MM or YYYY.MM.N format.');
  }
  if (
    typeof value.generated_at !== 'string' ||
    !ISO_TIMESTAMP.test(value.generated_at) ||
    !Number.isFinite(Date.parse(value.generated_at))
  ) {
    throw new ContractError('The manifest generation time must be an ISO UTC timestamp.');
  }
  return {
    schema_version: 1,
    status: 'ready',
    data_license: 'CC-BY-NC-4.0',
    methodology_version: value.methodology_version,
    data_version: value.data_version,
    generated_at: value.generated_at,
    factors: validateReleaseFactors(value.factors),
    daily: validateDatasetMeta(value.daily, 'daily'),
    monthly: validateDatasetMeta(value.monthly, 'monthly'),
  };
}

function parseStrictNumber(value: unknown, row: number, column: string): number {
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value;
  } else if (typeof value === 'string' && value.trim() !== '') {
    const number = Number(value.trim());
    if (Number.isFinite(number)) return number;
  }
  throw new ContractError(`Row ${row}: “${column}” must be a finite number without symbols.`);
}

function parseFactorReturn(value: unknown, row: number, column: string): number {
  const parsed = parseStrictNumber(value, row, column);
  if (parsed <= -1) throw new ContractError(`Row ${row}: “${column}” must be greater than -1.`);
  return parsed;
}

function assertExactHeaders(actual: unknown[], expected: string[]): void {
  if (actual.length !== expected.length || actual.some((value, i) => value !== expected[i])) {
    throw new ContractError(`Header row must be exactly: ${expected.join(',')}`);
  }
}

export function validateFactorMatrix(
  matrix: unknown[][],
  factors: readonly FactorKey[],
): FactorRow[] {
  if (matrix.length < 2) throw new ContractError('The factor dataset has no observations.');
  const releaseFactors = validateReleaseFactors([...factors]);
  const headers = ['date', ...releaseFactors];
  assertExactHeaders(matrix[0] ?? [], headers);
  const rows: FactorRow[] = [];
  let previous = '';
  for (let index = 1; index < matrix.length; index += 1) {
    const source = matrix[index];
    const rowNumber = index + 1;
    if (!source || source.length !== headers.length) {
      throw new ContractError(`Row ${rowNumber}: expected exactly ${headers.length} columns.`);
    }
    const date = source[0];
    if (typeof date !== 'string' || !isIsoDate(date)) {
      throw new ContractError(`Row ${rowNumber}: “date” must use YYYY-MM-DD.`);
    }
    if (date <= previous)
      throw new ContractError(`Row ${rowNumber}: factor dates must be unique and ascending.`);
    previous = date;
    const values = Object.fromEntries(
      releaseFactors.map((factor, factorIndex) => [
        factor,
        parseFactorReturn(source[factorIndex + 1], rowNumber, factor),
      ]),
    ) as Partial<Record<FactorKey, number>>;
    rows.push({ date, ...values, rf: values.rf!, mkt_rf: values.mkt_rf! });
  }
  return rows;
}

export function validatePublishedDataset(
  rows: FactorRow[],
  metadata: DatasetMeta,
  frequency: Frequency,
): void {
  if (rows.length !== metadata.rows) {
    throw new ContractError(`The ${frequency} dataset row count does not match its manifest.`);
  }
  if (rows[0]?.date !== metadata.coverage_start || rows.at(-1)?.date !== metadata.coverage_end) {
    throw new ContractError(`The ${frequency} dataset coverage does not match its manifest.`);
  }
  if (frequency !== 'monthly') return;
  for (let index = 1; index < rows.length; index += 1) {
    const previous = rows[index - 1]!.date;
    const current = rows[index]!.date;
    const previousMonth = Number(previous.slice(0, 4)) * 12 + Number(previous.slice(5, 7));
    const currentMonth = Number(current.slice(0, 4)) * 12 + Number(current.slice(5, 7));
    if (currentMonth !== previousMonth + 1) {
      throw new ContractError(`The monthly factor calendar skips the month before ${current}.`);
    }
  }
}

export function validatePortfolioMatrix(
  matrix: unknown[][],
  kind: InputKind,
  frequency: Frequency,
  factorRows: FactorRow[],
): PortfolioValidation {
  const valueHeader = kind === 'nav' ? 'nav' : 'return';
  if (matrix.length < 2) throw new ContractError('The portfolio file has no observations.');

  const headers = (matrix[0] ?? []).map((value) =>
    typeof value === 'string' ? value.trim().toLowerCase() : '',
  );
  const requiredIndex = (name: string): number => {
    const matches = headers.flatMap((header, index) => (header === name ? [index] : []));
    if (matches.length !== 1) {
      throw new ContractError(`Header row must contain one "${name}" column.`);
    }
    return matches[0]!;
  };
  const dateColumn = requiredIndex('date');
  const valueColumn = requiredIndex(valueHeader);
  const periodKey = (date: string): string => (frequency === 'monthly' ? date.slice(0, 7) : date);
  const periodNumber = (date: string): number =>
    frequency === 'monthly'
      ? Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7))
      : Date.parse(`${date}T00:00:00Z`);

  if (factorRows.length === 0) throw new ContractError('The selected factor calendar is empty.');
  const factorByPeriod = new Map(
    factorRows.map((row, index) => [periodKey(row.date), { row, index }] as const),
  );
  const coverageStart = periodNumber(factorRows[0]!.date);
  const coverageEnd = periodNumber(factorRows.at(-1)!.date);

  const input: Array<{
    date: string;
    rawValue: unknown;
    sourceRow: number;
    period: string;
    periodNumber: number;
  }> = [];
  let previousDate = '';
  let previousPeriod = '';

  for (let index = 1; index < matrix.length; index += 1) {
    const source = matrix[index];
    const rowNumber = index + 1;
    if (!source || source.every((value) => value == null || String(value).trim() === '')) continue;
    const rawDate = source[dateColumn];
    const date = typeof rawDate === 'string' ? rawDate.trim() : rawDate;
    if (typeof date !== 'string' || !isIsoDate(date)) {
      throw new ContractError(`Row ${rowNumber}: “date” must use YYYY-MM-DD.`);
    }
    if (date <= previousDate)
      throw new ContractError(`Row ${rowNumber}: dates must be unique and ascending.`);
    const period = periodKey(date);
    if (frequency === 'monthly' && period === previousPeriod) {
      throw new ContractError(`Row ${rowNumber}: only one observation is allowed per month.`);
    }
    input.push({
      date,
      rawValue: source[valueColumn],
      sourceRow: rowNumber,
      period,
      periodNumber: periodNumber(date),
    });
    previousDate = date;
    previousPeriod = period;
  }
  if (input.length === 0) throw new ContractError('The portfolio file has no observations.');

  const before = input.filter((row) => row.periodNumber < coverageStart);
  const inside = input.filter(
    (row) => row.periodNumber >= coverageStart && row.periodNumber <= coverageEnd,
  );
  const after = input.filter((row) => row.periodNumber > coverageEnd);
  const rows: PortfolioRow[] = [];
  let unmatchedDates = 0;
  let previousCalendarIndex: number | undefined;

  const validatedValue = (row: (typeof input)[number]): number => {
    const value = parseStrictNumber(row.rawValue, row.sourceRow, valueHeader);
    if (kind === 'nav' && value <= 0)
      throw new ContractError(`Row ${row.sourceRow}: “nav” must be greater than zero.`);
    if (kind === 'returns' && value <= -1)
      throw new ContractError(`Row ${row.sourceRow}: “return” must be greater than -1.`);
    return value;
  };

  if (kind === 'nav' && before.length > 0 && inside.length > 0) {
    const anchor = before.at(-1)!;
    rows.push({ date: anchor.date, value: validatedValue(anchor), sourceRow: anchor.sourceRow });
  }

  for (const source of inside) {
    const factor = factorByPeriod.get(source.period);
    if (!factor) {
      if (kind === 'returns') {
        unmatchedDates += 1;
        continue;
      }
      throw new ContractError(
        `Row ${source.sourceRow}: ${source.date} does not match the selected factor calendar.`,
      );
    }
    if (
      kind === 'nav' &&
      previousCalendarIndex !== undefined &&
      factor.index !== previousCalendarIndex + 1
    ) {
      throw new ContractError(
        `Row ${source.sourceRow}: ${source.date} is not consecutive with the preceding NAV period.`,
      );
    }
    rows.push({
      date: factor.row.date,
      value: validatedValue(source),
      sourceRow: source.sourceRow,
    });
    previousCalendarIndex = factor.index;
  }

  const anchorUsed = kind === 'nav' && before.length > 0 && inside.length > 0;
  return {
    rows,
    report: {
      inputRows: input.length,
      ignoredBefore: before.length - (anchorUsed ? 1 : 0),
      ignoredAfter: after.length,
      unmatchedDates,
      anchorUsed,
    },
  };
}

export function portfolioReturns(
  rows: PortfolioRow[],
  kind: InputKind,
): Array<{ date: string; return: number }> {
  if (kind === 'returns') return rows.map((row) => ({ date: row.date, return: row.value }));
  return rows
    .slice(1)
    .map((row, index) => ({ date: row.date, return: row.value / rows[index]!.value - 1 }));
}

export function parseCsvMatrix(text: string): unknown[][] {
  const withoutTerminalNewline = text.replace(/(?:\r?\n)$/, '');
  const parsed = Papa.parse<unknown[]>(withoutTerminalNewline, {
    header: false,
    skipEmptyLines: false,
  });
  if (parsed.errors.length)
    throw new ContractError(`CSV parse error: ${parsed.errors[0]!.message}`);
  return parsed.data;
}

export async function loadManifest(): Promise<DataManifest> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/manifest.json`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new ContractError('The data manifest could not be loaded.');
  return validateManifest(await response.json());
}

export async function loadFactors(
  frequency: Frequency,
  manifest?: DataManifest,
): Promise<FactorRow[]> {
  const resolved = manifest ?? (await loadManifest());
  if (resolved.status !== 'ready') throw new ContractError('Factor data publication is pending.');
  const metadata = resolved[frequency];
  if (!metadata) throw new ContractError(`The ${frequency} factor dataset is unavailable.`);
  const response = await fetch(`${import.meta.env.BASE_URL}${metadata.path.replace(/^\//, '')}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new ContractError(`The ${frequency} factor dataset could not be loaded.`);
  const rows = validateFactorMatrix(parseCsvMatrix(await response.text()), resolved.factors);
  validatePublishedDataset(rows, metadata, frequency);
  return rows;
}
