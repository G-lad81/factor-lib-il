export const FACTORS = [
  {
    key: 'rf',
    symbol: 'RF',
    name: 'Risk-free',
    meaning: 'Short-term shekel return',
    detail: '3-month MAKAM benchmark',
    color: '#64748b',
    regression: 'risk-free',
  },
  {
    key: 'mkt_rf',
    symbol: 'MKT-RF',
    name: 'Market',
    meaning: 'Market return above RF',
    detail: 'Full-market-cap weighted · 7% cap per security',
    color: '#1167e8',
    regression: 'required',
  },
  {
    key: 'smb',
    symbol: 'SMB',
    name: 'Size',
    meaning: 'Small minus large',
    detail: 'Annual 2×3 sort · June',
    color: '#008f61',
    regression: 'optional',
  },
  {
    key: 'hml',
    symbol: 'HML',
    name: 'Value',
    meaning: 'Value minus growth',
    detail: 'Book-to-market · annual June sort',
    color: '#d95f02',
    regression: 'optional',
  },
  {
    key: 'mom',
    symbol: 'MOM',
    name: 'Momentum',
    meaning: 'Winners minus losers',
    detail: 'Monthly rebalance',
    color: '#7c3aed',
    regression: 'optional',
  },
] as const;

export type FactorKey = (typeof FACTORS)[number]['key'];
export type RegressionFactor = Exclude<FactorKey, 'rf'>;
export type OptionalFactor = Exclude<RegressionFactor, 'mkt_rf'>;

export const REGRESSION_FACTORS = FACTORS.filter(
  (factor): factor is (typeof FACTORS)[number] & { key: RegressionFactor } =>
    factor.regression === 'required' || factor.regression === 'optional',
);

export const OPTIONAL_FACTOR_KEYS = FACTORS.filter(
  (factor): factor is (typeof FACTORS)[number] & { key: OptionalFactor } =>
    factor.regression === 'optional',
).map((factor) => factor.key);

export const FACTOR_BY_KEY = Object.fromEntries(FACTORS.map((factor) => [factor.key, factor])) as {
  [Key in FactorKey]: Extract<(typeof FACTORS)[number], { key: Key }>;
};
