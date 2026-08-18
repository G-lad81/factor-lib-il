const LTR_ISOLATE = '\u2066';
const POP_DIRECTIONAL_ISOLATE = '\u2069';

const PLACEHOLDER = /\{[A-Za-z][A-Za-z0-9_]*\}/;
const TECHNICAL_TOKEN =
  /[+\-−]?[A-Za-z\u0370-\u03ff0-9](?:[A-Za-z\u0370-\u03ff0-9._%/+\-−–—:₀-₉ₐ-ₜ²]*[A-Za-z\u0370-\u03ff0-9%₀-₉ₐ-ₜ²])?/;
const TECHNICAL_RUN = new RegExp(
  `${PLACEHOLDER.source}|${TECHNICAL_TOKEN.source}(?:\\s+${TECHNICAL_TOKEN.source})*`,
  'gu',
);

/**
 * Isolate technical left-to-right runs inside translated Hebrew copy.
 *
 * This keeps codes, dates, percentages, formulas, file names and Latin names
 * together without forcing the direction of the surrounding Hebrew sentence.
 */
export function isolateTechnicalRuns(text: string): string {
  return text.replace(TECHNICAL_RUN, (run) =>
    run.startsWith('{') ? run : `${LTR_ISOLATE}${run}${POP_DIRECTIONAL_ISOLATE}`,
  );
}

export function isolateTechnicalCopy<T>(value: T): T {
  if (typeof value === 'string') {
    return isolateTechnicalRuns(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => isolateTechnicalCopy(item)) as T;
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, isolateTechnicalCopy(item)]),
    ) as T;
  }

  return value;
}
