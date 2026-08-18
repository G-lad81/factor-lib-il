import { FACTOR_BY_KEY } from '@/config/factors';
import { OPTIONAL_FACTORS, type OptionalFactor } from '@/lib/regression/engine';
import { COPY } from '@/i18n/content';
import type { Locale } from '@/i18n/locales';

interface Props {
  available: readonly OptionalFactor[];
  selected: readonly OptionalFactor[];
  onToggle: (factor: OptionalFactor) => void;
  locale?: Locale;
}

export function FactorSelector({ available, selected, onToggle, locale = 'he' }: Props) {
  const copy = COPY[locale].regression;
  return (
    <section class="model card" aria-labelledby="model-title">
      <p class="eyebrow">{copy.step2}</p>
      <h2 id="model-title">{copy.chooseModel}</h2>
      <p id="model-help" class="model-help">
        {copy.modelHelp}
      </p>
      <fieldset aria-describedby="model-help">
        <legend>{copy.factors}</legend>
        <div class="factor-options">
          <label class="factor-choice required-factor">
            <input type="checkbox" checked disabled />
            <span>
              <strong dir="ltr">MKT-RF</strong>
              <small>{copy.required}</small>
            </span>
          </label>
          {OPTIONAL_FACTORS.filter((factor) => available.includes(factor)).map((factor) => (
            <label class="factor-choice">
              <input
                type="checkbox"
                checked={selected.includes(factor)}
                onChange={() => onToggle(factor)}
              />
              <span>
                <strong dir="ltr">{FACTOR_BY_KEY[factor].symbol}</strong>
                <small>{copy.optional}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p class="model-summary">
        {copy.currentModel}{' '}
        <bdi>
          MKT-RF
          {selected.map((factor) => ` + ${FACTOR_BY_KEY[factor].symbol}`).join('')}
        </bdi>
      </p>
    </section>
  );
}
