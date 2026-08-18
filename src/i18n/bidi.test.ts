import { describe, expect, it } from 'vitest';

import { isolateTechnicalCopy, isolateTechnicalRuns } from './bidi';

const LRI = '\u2066';
const PDI = '\u2069';

describe('Hebrew bidirectional text isolation', () => {
  it('isolates dates, percentages and factor codes without changing Hebrew order', () => {
    expect(isolateTechnicalRuns('מחודש t−12 עד חודש t−1. 30% העליונים')).toBe(
      `מחודש ${LRI}t−12${PDI} עד חודש ${LRI}t−1${PDI}. ${LRI}30%${PDI} העליונים`,
    );
  });

  it('isolates multiword Latin names and technical file names as complete runs', () => {
    expect(isolateTechnicalRuns('האתר Factor Library IL קורא את manifest.json')).toBe(
      `האתר ${LRI}Factor Library IL${PDI} קורא את ${LRI}manifest.json${PDI}`,
    );
  });

  it('applies the same rule throughout nested translated copy', () => {
    expect(isolateTechnicalCopy({ text: 'ערך p קטן מ־0.05', items: ['MKT-RF נכלל'] })).toEqual({
      text: `ערך ${LRI}p${PDI} קטן מ־${LRI}0.05${PDI}`,
      items: [`${LRI}MKT-RF${PDI} נכלל`],
    });
  });

  it('leaves interpolation placeholders untouched until their values are known', () => {
    expect(isolateTechnicalRuns('הורדת תבנית {kind} {frequency}')).toBe(
      'הורדת תבנית {kind} {frequency}',
    );
  });
});
