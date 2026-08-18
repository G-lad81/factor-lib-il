import type { Frequency, InputKind } from '@/lib/data/contracts';
import { COPY, interpolate } from '@/i18n/content';
import type { Locale } from '@/i18n/locales';

interface Props {
  kind: InputKind;
  frequency: Frequency;
  onChange: (kind: InputKind, frequency: Frequency) => void;
  locale?: Locale;
}

const templateName = (kind: InputKind, frequency: Frequency) => `template_${frequency}_${kind}.csv`;

export function FileSettings({ kind, frequency, onChange, locale = 'he' }: Props) {
  const copy = COPY[locale].regression;
  const frequencyLabel = frequency === 'daily' ? copy.daily : copy.monthly;
  const kindLabel = kind === 'nav' ? 'NAV' : copy.returns;
  return (
    <section class="contract card" aria-labelledby="contract-title">
      <p class="eyebrow">{copy.step1}</p>
      <h2 id="contract-title">{copy.describe}</h2>
      <div class="contract-controls">
        <fieldset>
          <legend>{copy.inputType}</legend>
          <div class="segmented">
            {(['nav', 'returns'] as InputKind[]).map((item) => (
              <button
                type="button"
                class={kind === item ? 'active' : ''}
                aria-pressed={kind === item}
                onClick={() => onChange(item, frequency)}
              >
                {item === 'nav' ? 'NAV' : copy.returns}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{copy.frequency}</legend>
          <div class="segmented">
            {(['daily', 'monthly'] as Frequency[]).map((item) => (
              <button
                type="button"
                class={frequency === item ? 'active' : ''}
                aria-pressed={frequency === item}
                onClick={() => onChange(kind, item)}
              >
                {item === 'daily' ? copy.daily : copy.monthly}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div class="schema-box">
        <div class="schema-title">
          <strong>{copy.requiredColumns}</strong>
          <code dir="ltr">date,{kind === 'nav' ? 'nav' : 'return'}</code>
        </div>
        <p>
          {copy.csvDates} {kind === 'nav' ? copy.navValues : copy.returnValues}
        </p>
        <p>{interpolate(copy.datesMatch, { frequency: frequencyLabel })}</p>
      </div>
      <a
        class="template-link"
        href={`${import.meta.env.BASE_URL}templates/${templateName(kind, frequency)}`}
        download
      >
        {interpolate(copy.template, { frequency: frequencyLabel, kind: kindLabel })}
      </a>
    </section>
  );
}
