import type { Locale, PageKey } from './locales';
import { isolateTechnicalCopy, isolateTechnicalRuns } from './bidi';

const en = {
  localeName: 'English',
  languageSwitch: 'עברית',
  languageSwitchLabel: 'Switch to Hebrew',
  skip: 'Skip to content',
  navLabel: 'Primary navigation',
  navToggle: 'Toggle navigation',
  nav: {
    home: 'Home',
    methodology: 'Methodology',
    regression: 'Model',
    changelog: 'Changelog',
    about: 'About',
    accessibility: 'Accessibility',
  },
  footer: {
    title: 'Legal disclaimer',
    body: 'For educational, academic, and research purposes only. Published files contain independently calculated derived factor returns, not raw exchange prices or official benchmark series. No investment, financial, or legal advice; historical results do not guarantee future performance. Use is at your own risk. This independent project is not affiliated with or endorsed by the Tel Aviv Stock Exchange or any referenced institution.',
    maintained: 'Created and maintained by',
    citation: 'Citation',
  },
  factors: {
    rf: {
      name: 'Risk-free',
      meaning: 'Short-term shekel return',
      detail: '3-month MAKAM benchmark',
    },
    mkt_rf: {
      name: 'Market',
      meaning: 'Market return above RF',
      detail: 'Full-market-cap weighted · 7% cap per security',
    },
    smb: { name: 'Size', meaning: 'Small minus large', detail: 'Annual 2×3 sort · June' },
    hml: {
      name: 'Value',
      meaning: 'Value minus growth',
      detail: 'Book-to-market · annual June sort',
    },
    mom: { name: 'Momentum', meaning: 'Winners minus losers', detail: 'Monthly rebalance' },
  },
  home: {
    description:
      'Open factor library for the Israeli equity market | Daily and monthly data | In-browser fund performance analysis',
    social:
      'Open library of factor returns for the Israeli equity market | In-browser fund performance analysis',
    eyebrow: 'Open quantitative research',
    lead: 'Daily and monthly factor returns for the Israeli equity market.',
    dailyDownload: 'Download daily CSV',
    monthlyDownload: 'Download monthly CSV',
    published: 'Published',
    pending: 'Publication pending',
    pendingText: 'Downloads will activate after the first reviewed data release.',
    release: 'Release',
    dailyCoverage: 'Daily coverage',
    monthlyCoverage: 'monthly coverage',
    updated: 'Updated',
    csvFormat: 'CSV format',
    csvDescription:
      'ISO dates and decimal simple returns, sorted in ascending order. Coverage, generation time, data version, and methodology version are supplied by the release manifest.',
    dataLicense: 'Data license:',
    licenseText:
      'Published under CC BY-NC 4.0, which requires attribution and does not permit commercial use.',
    principlesTitle: 'An open resource for Israel’s research community',
    principles: [
      'Clean, processed series',
      'Monthly releases',
      'Transparent, documented methodology',
      'Factor model in the browser',
    ],
    factorTitle: 'Factor returns and the risk-free rate',
    methodologyLink: 'Read methodology →',
    regressionTitle: 'Analyze a fund or portfolio',
    regressionText:
      'Upload performance data to estimate factor exposures and alpha. The regression runs locally in your browser, so your file never leaves your computer.',
    regressionLink: 'Open regression tool',
  },
  chart: {
    title: 'Cumulative returns',
    growth: 'Growth of 100',
    arithmetic: 'Cumulative return (%)',
    scale: 'Chart scale',
    logScale: 'Logarithmic scale',
    arithmeticScale: 'Arithmetic scale',
    range: 'Chart range',
    series: 'Chart series',
    checking: 'Checking data publication status…',
    pendingTitle: 'Data pending',
    pending:
      'Factor data publication is pending. The chart will activate when validated files are added.',
    failed: 'Factor data could not be loaded.',
    aria: 'Interactive cumulative factor returns chart. Use the series controls to show or hide returns.',
    latestCaption: 'Latest cumulative return by factor',
    ranges: { ytd: 'YTD', '1y': '1Y', '3y': '3Y', all: 'ALL' },
  },
  performance: {
    title: 'Factor performance',
    months: 'months',
    rfPrefix: 'Risk-free rate averaged',
    rfSuffix: 'annually over the period.',
    factor: 'Factor',
    mean: 'Mean return',
    monthly: '(monthly)',
    volatility: 'Volatility',
    sharpe: 'Sharpe',
    annualized: '(ann.)',
    significance: 'Significance',
    drawdown: 'Max drawdown',
    pendingTitle: 'Data pending',
    pending: 'Performance statistics will appear when validated files are added.',
    sharpeHelp: '',
    inferenceHelp: '',
    frictionless: '',
    power: '',
  },
  regression: {
    title: 'Factor model',
    description: 'Analyze portfolio returns against the library’s factors in your browser.',
    lead: 'See how a fund or portfolio’s past returns relate to the library’s factors. The results show its factor exposures, estimated alpha, and how well the model explains its performance. Everything runs locally in your browser.',
    formatsTitle: 'File formats and templates',
    formatsIntro:
      'Upload a CSV or XLSX file, then choose its input type and frequency. XLSX files must contain one worksheet. The required columns are shown in the templates below.',
    dailyNav: 'Daily NAV',
    monthlyNav: 'Monthly NAV',
    dailyReturns: 'Daily returns',
    monthlyReturns: 'Monthly returns',
    navAnchor:
      'The last NAV before factor coverage may be used as the anchor for the first return.',
    monthlyDates: 'Monthly observations are matched to factor data by calendar month.',
    decimalReturns: 'Use decimal simple returns: 0.0125 means 1.25%.',
    downloadDailyNav: 'Download daily NAV template',
    downloadMonthlyNav: 'Download monthly NAV template',
    downloadDailyReturns: 'Download daily returns template',
    downloadMonthlyReturns: 'Download monthly returns template',
    contractRule:
      'Dates must be unique and ascending. Returns must be decimal simple returns, and NAV values must be positive. History outside factor coverage is ignored. NAV observations within coverage must be consecutive; returns may omit dates.',
    step1: 'Step 1',
    describe: 'Describe your file',
    inputType: 'Input type',
    returns: 'Returns',
    frequency: 'Frequency',
    daily: 'Daily',
    monthly: 'Monthly',
    requiredColumns: 'Required columns',
    csvDates:
      'Required column names are case-insensitive and may appear in any order. Extra columns and blank rows are ignored. CSV dates use YYYY-MM-DD; Excel dates also work in XLSX.',
    navValues: 'Use positive end-of-period NAV values.',
    returnValues: 'Use decimal returns above −1; 0.0125 means 1.25%.',
    datesMatch: 'Only dates overlapping the published factor data are used.',
    template: 'Download {frequency} {kind} template',
    step2: 'Step 2',
    chooseModel: 'Choose your factor model',
    modelHelp:
      'MKT-RF is required. Toggle the other factors to compare models. RF is always subtracted from portfolio returns.',
    factors: 'Factors',
    required: 'Required',
    optional: 'Optional',
    currentModel: 'Current model:',
    step3: 'Step 3',
    validate: 'Validate and run',
    chooseFile: 'Choose a CSV or XLSX file',
    localFile: 'Your file remains in this browser.',
    validating: 'Validating…',
    run: 'Run regression',
    rejected: 'File rejected',
    reviewFormat: 'Review the file format',
    initialStatus: 'Choose the options that match your file.',
    publicationPending:
      'Factor data publication is pending. Templates are available, but regression is disabled.',
    manifestFailed: 'The factor-data manifest could not be loaded.',
    settingsChanged: 'File settings changed. Run again to validate the selected file.',
    warningShortSample: 'Interpret with caution: fewer than {threshold} {frequency} observations.',
    warningPercentScale:
      'Check the scale of your returns. This file moves about {ratio} times as much as the market over the same dates, which suggests the values are percentages rather than decimals. Use 0.0125 to mean 1.25%. If the file is in percent, alpha and the factor coefficients are wrong by roughly a factor of 100.',
    modelChangedFile: 'Model changed. Your file is still selected; run the regression again.',
    modelChanged: 'Model changed. Select a matching file when ready.',
    fileSelected: 'File selected. Run the regression when ready.',
    chooseFileStatus: 'Choose a CSV or XLSX file.',
    chooseBeforeRun: 'Choose a CSV or XLSX file before running the regression.',
    checking: 'Checking your file…',
    validated: 'Used {observations} observations from {start} to {end}.',
    alignmentExcluded:
      'Excluded rows — before coverage: {before}; after coverage: {after}; unmatched dates: {unmatched}.',
    failed: 'The regression could not be completed.',
    validationFailed: 'Validation failed. No calculations were run.',
    resultsTitle: 'Factor regression',
    model: 'Model:',
    downloadResults: 'Download results',
    alpha: 'Annualized alpha',
    alphaInference: 'Alpha inference',
    rSquared: 'R²',
    adjustedRSquared: 'Adjusted R²',
    observations: 'Observations',
    factor: 'Factor',
    coefficient: 'Coefficient (beta)',
    incrementalRSquared: 'ΔR²',
    hacSe: 'HAC SE',
    tStat: 't-stat',
    pValue: 'p-value',
    methodNote:
      'Newey–West HAC standard errors with {lags} lag{plural} and two-sided asymptotic-normal p-values.',
    guide: 'How do I read these results?',
    guideIntro:
      'The model separates the portfolio return, after deducting the risk-free rate, into two parts: the return that came from exposure to known market risks, and the return left over once those risks are accounted for.',
    readingOrderTitle: 'Read the results in this order',
    orderStep1Label: 'Sample size:',
    orderStep1:
      'Start with the number of observations and the period covered. A short sample supports weak conclusions, even when the numbers look significant.',
    orderStep2Label: 'Adjusted R²:',
    orderStep2:
      'Shows how much of the movement in the portfolio is explained by the selected factors, after deducting a penalty for each factor added. A high value indicates the portfolio moved largely in line with known exposures.',
    orderStep3Label: 'Size and sign of the coefficients (the portfolio profile):',
    orderStep3:
      'A positive sign means movement with the factor, a negative sign movement in the opposite direction. The market coefficient is compared to 1: a value above 1 means higher sensitivity (or risk) than the market itself, and a value below 1 means lower sensitivity. For the other factors the reference point is zero, and the further the coefficient sits from it, the stronger the tilt.',
    orderStep4Label: 'Alpha (α):',
    orderStep4:
      'The average return the factors do not explain, shown annualized alongside its significance measures (it is important to read the warning about what alpha means under "What to watch out for").',
    termsTitle: 'What each measure says',
    deltaLabel: 'Incremental R² (marginal contribution)',
    deltaText:
      'The share of R² that the factor explains uniquely. Because the factors are correlated and overlap, the marginal contributions need not sum to the overall R².',
    hacLabel: 'Standard error (HAC)',
    hacText:
      'A measure of the uncertainty around the coefficient, correcting for bias caused by changing volatility or by correlation between periods.',
    tpLabel: 't-value and p-value',
    tpText:
      'These test whether the coefficient differs from zero, that is, whether the result reflects a consistent pattern or a random fluctuation. The smaller the p-value (below 0.05), the more significant the result, but significance does not necessarily indicate economic importance or that it will recur.',
    misreadTitle: 'What to watch out for',
    warn1Label: 'A high t-value on the market coefficient:',
    warn1:
      'Expected in advance, since every equity portfolio is exposed to the market. Examine the size of the coefficient itself rather than its significance.',
    warn2Label: 'Data frequency:',
    warn2:
      'Daily data produces higher t-values than monthly data because of the sample size. Significance cannot be compared across frequencies.',
    warn3Label: 'What alpha means:',
    warn3:
      'Alpha is entirely dependent on the model selected. Even a significant alpha does not necessarily indicate talent or skill, and may leave a mistaken impression because of exposure to other risk factors (such as specific sectors or additional factors) that the chosen model did not account for.',
    warn4Label: 'The caveat:',
    warn4: 'The results describe past data only, and are not a forecast or investment advice.',
    fitTitle: 'Cumulative excess return: actual vs explained by the factors',
    date: 'Date',
    actual: 'Actual',
    explained: 'Explained by the factors',
    fitCaption:
      'The purple line is what the estimated factor exposures alone would have earned. The shaded band between the lines is the part the factors do not explain, and the cumulative gap at the end of the sample is {alpha}. That gap compounds over the whole period, so it is not the annualized alpha reported in the table. It is also measured against the selected model only: a factor left out of the model shows up here as alpha, so the gap is not in itself evidence of skill.',
    fitAria: 'Cumulative excess return, actual against the part explained by the factors',
    fitSummary:
      'Sample from {start} to {end}. Final cumulative actual excess return {actual}; the part explained by the factors {explained}.',
  },
  methodology: {
    title: 'Methodology',
    description:
      'Methodology for the Israeli risk-free, Market, Size, Value, and Momentum return series.',
    version: 'Version',
    overview1a: 'The library is grounded in the ',
    framework: 'Fama–French and Carhart factor models',
    overview1b:
      '. Those models were built to explain the variation in asset returns through systematic factors. In practice they are also used to isolate the return that remains beyond those factors (alpha). The library keeps the economic reasoning established in the literature, while adapting the portfolio construction rules to the smaller and more concentrated structure of the Israeli equity market.',
    overview2:
      'The research universe covers the broad layer of the Israeli equity market, smaller companies included, and holds about 185 stocks at a typical date. Each period includes every company that met the eligibility conditions, judged on the information available at that time (point-in-time).',
    overview3:
      'The market portfolio (MKT-RF) is weighted by market capitalization, while the factor portfolios give every stock equal weight. Holdings are held unchanged until the next rebalance; daily returns are recorded, and the monthly return is compounded from the daily series. Returns are total returns, including dividends.',
    rfTitle: 'RF: Risk-Free Return',
    rfIntro:
      'The risk-free series represents the return on a short-term, shekel-denominated asset. It is based on the Bank of Israel’s official yield-to-maturity series for three-month MAKAM.',
    monthly: 'Monthly',
    rfMonthly:
      'Monthly RF is not derived from a separate monthly yield series. It is the compound return of the published daily RF observations within each calendar month.',
    daily: 'Daily',
    rfDaily:
      'The MAKAM yield is quoted on an annualized basis. For each trading day, it is converted into a holding-period return using the actual number of calendar days since the previous observation. Interest accrued over weekends and holidays is therefore included in the next published daily return.',
    rfNotation:
      'Yₜ is the annualized yield expressed as a percentage, and Δdₜ is the calendar-day gap between consecutive daily observations.',
    marketTitle: 'MKT-RF: Market',
    marketIntro:
      'MKT-RF represents the return of the eligible Israeli equity universe in excess of the risk-free rate.',
    marketWeightingText:
      'Each stock is weighted by its full market capitalization at the end of the preceding period. The calculation uses full market capitalization rather than free-float capitalization.',
    marketCapText:
      'Because the Israeli market can be highly concentrated, no single stock may account for more than 7% of the portfolio. Any weight above the cap is redistributed among the remaining stocks in proportion to their market capitalization. This process is repeated until every stock is within the limit.',
    marketPurposeText:
      'The cap reduces dependence on a small number of companies without changing the eligible universe. Without it, a single stock would historically have represented as much as 35% of the universe’s total market capitalization.',
    marketFormula:
      'After the capped market return has been calculated, the corresponding risk-free return is subtracted:',
    sizeTitle: 'SMB: Size',
    sizeIntro: 'The size factor (SMB) measures the return gap between small and large companies.',
    ffSortText:
      'SMB and the value factor (HML) are built from a single combined sort at the end of June each year (t):',
    sortSize: 'Size: two groups split at the median market capitalization, small and large.',
    sortValue:
      'Value: three groups by the ratio of book equity to market value, the bottom 30%, the middle 40%, and the top 30%.',
    sortResult: 'Crossing the sorts produces six portfolios, held for twelve months.',
    bookEquityText:
      'The book-to-market ratio uses book equity for year t−1 over market value at the end of December t−1, which keeps a neutral six-month window, while the size sort uses market capitalization at the end of June t.',
    pitText: 'Financial statement figures enter on the date they were actually published.',
    breakpointText:
      'Unlike the source literature, which computes the breakpoints from New York Stock Exchange listings alone, in Israel they are computed from the broad market index. Including the whole market lets the smaller stocks pull the median down, and can even affect the sign of the factor’s return.',
    smbFormula:
      'Averaging the returns of the value groups neutralizes the value effect and isolates the size premium:',
    valueTitle: 'HML: Value',
    valueIntro:
      'The value factor (HML) measures the return gap between companies with a high ratio of book equity to market value (value companies) and companies with a low ratio (growth companies).',
    valueSharedText:
      'The factor is built from the same six portfolios and the same annual formation at the end of June. Averaging the two size groups neutralizes the size effect and isolates the value premium, while the middle group (medium value) is excluded from the calculation.',
    hmlFormula:
      'HML is the difference between the average return of the two high-value portfolios and the average return of the two low-value portfolios:',
    momentumTitle: 'MOM: Momentum',
    momentumIntro:
      'The momentum factor (MOM) measures the return gap between the stocks with the strongest performance over the past year (the winners) and those with the weakest (the losers).',
    momentumSortText:
      'Stocks are ranked at the end of each month (t) by their cumulative return over the eleven months that have passed, from t−12 to t−1. The formation month itself (t) is excluded from the measurement, to avoid the bias that short-term reversal would introduce. The top 30% are classified as winners, the bottom 30% as losers, and the middle 40% are excluded from the calculation.',
    sizeSortText:
      'To neutralize the size effect, stocks are split in parallel into small and large at the median. Crossing the two sorts produces four equally weighted portfolios — small winners, large winners, small losers and large losers — rebalanced monthly.',
    momentumFormula:
      'MOM is the difference between the average return of the winner portfolios and that of the loser portfolios:',
    regressionTitle: 'Regression and performance evaluation',
    regressionIntro:
      'The regression model splits a portfolio return into two parts: exposure to broad market risks, which are the factors, and the excess return that remains — alpha (α).',
    regressionEquationLead: 'The full model equation:',
    regressionBasis:
      'The risk-free return (RF) is subtracted from the portfolio return before the analysis, and the market factor (MKT-RF) is included in every specification.',
    technicalTitle: 'Technical notes',
    techAnnual:
      'Annualization: daily alpha is multiplied by 252 and monthly alpha by 12 to give an annual figure.',
    techHac:
      'Standard-error accuracy (Newey–West): the calculation corrects for bias from persistent trends and from changes in volatility over time. The lag length (L) is set by:',
    techPValue:
      'Significance (p-value): a two-sided test based on the normal distribution, to check that a result is not down to chance.',
    fitMeasuresTitle: 'Goodness-of-fit measures',
    regressionDeltaR2:
      'Incremental contribution (ΔR²): how much unique explanatory power a given factor adds, found by comparing the full model with the same model estimated without it. Because the factors are related and correlated, the incremental contributions do not sum to the overall R².',
    regressionAdjR2:
      'Adjusted R²: the main measure for comparison. Unlike plain R², which always rises when variables are added, the adjusted measure charges a penalty for each factor added, which makes comparison between model specifications reliable.',
    revisionsTitle: 'Revisions',
    revisions:
      'Material data or methodology changes are recorded in the changelog with their effective version and date.',
  },
  about: {
    title: 'Open Tools for Israeli Factor Research',
    description: 'About Factor Library IL, its public data, maintainer, citation, and licensing.',
    intro1:
      'Factor Library IL makes systematic research on the Israeli equity market more accessible. While standardized factor datasets are widely available for major global markets, comparable data for the Israeli market remains difficult to obtain and use.',
    intro2:
      'The project provides a focused, transparent collection of factor return series, documented methodologies, and simple tools for downloading data and analyzing portfolio returns against the factors.',
    approachTitle: 'Project Approach',
    approach1:
      'The library is designed to be straightforward. Factor definitions and methodological choices are documented, historical data is constructed on a point-in-time basis where applicable, and material changes are publicly versioned.',
    approach2:
      'The website is entirely static. No account is required, and portfolio files submitted to the regression tool are processed locally in the user’s browser and never uploaded.',
    maintainerTitle: 'Maintainer',
    maintainedBy: 'Created and maintained by',
    onX: 'on X). Development is hosted at',
    citationTitle: 'Citation',
    citation:
      'Any use, sharing, or presentation of the data should credit Factor Library IL and Gilad. Full citation details are in the project repository’s CITATION.cff, and it is good practice to include the data version, the methodology version, and the date on which the data was accessed.',
    licensing1:
      'The website’s source code is licensed under the MIT License. Published factor datasets are separately licensed under',
    licensing2:
      ', which requires appropriate attribution to Factor Library IL and Gilad and does not permit commercial use. Reusers must clearly identify any modifications and must not imply endorsement.',
    independenceTitle: 'Independence',
    independence:
      'Factor Library IL is an independent project. It is not affiliated with, sponsored by, or endorsed by the Tel Aviv Stock Exchange, Eugene Fama, Kenneth French, Mark Carhart, or any associated institution. Academic names are used solely to identify the methodological frameworks on which the project draws.',
    disclaimerTitle: 'Legal Disclaimer',
    disclaimer1:
      'The data, methodology, and tools are provided for educational, academic, and research purposes only. The published datasets consist of independently calculated and derived financial factor return series. They do not contain raw exchange prices, publish official benchmark values, or reproduce proprietary benchmark return series.',
    disclaimer2:
      'Factor Library IL is not affiliated with, sponsored by, or endorsed by the Tel Aviv Stock Exchange, any index administrator or data vendor, Eugene Fama, Kenneth French, Mark Carhart, or any associated institution. References to market segments and benchmark-based eligibility are included solely to explain the author’s methodology and do not imply sponsorship, endorsement, or ownership of any official benchmark.',
    disclaimer3:
      'Nothing in this project constitutes financial, investment, tax, or legal advice; a recommendation; or an offer to buy or sell any security. Backtested and historical results do not guarantee future performance. Use of the data, methodology, and tools is entirely at the user’s own risk. To the fullest extent permitted by applicable law, the author accepts no liability for trading losses, investment decisions, or any direct or indirect consequences arising from their use.',
    disclaimer4a:
      'Reasonable efforts are made to maintain data quality and apply point-in-time treatment where appropriate. Nevertheless, the data may contain errors, omissions, or inconsistencies and is provided as is. The ',
    valueFactor: 'Value factor',
    disclaimer4b:
      ' relies partly on reported accounting information that may subsequently be restated, corrected, or revised.',
  },
  changelog: {
    title: 'Changelog',
    description: 'Public changes to Factor Library IL data, methodology, and software.',
    lead: 'Material data and methodology revisions are recorded here.',
    entries: [
      {
        heading: 'Initial public release',
        version: 'Methodology 1.1.0 · Data 2026.07.2',
        items: [
          'The library’s starting point. Every entry above it records a change relative to this.',
          'First publication of the factor series: RF, MKT-RF, SMB, HML and MOM, daily and monthly. Current coverage is shown on the home page and in the release manifest.',
          'A documented construction for every series, including the formulas and the departures from the source literature that the structure of the Israeli market requires.',
          'A regression tool that runs entirely in the browser; the selected file never leaves the reader’s computer.',
          'The project’s public source repository was opened on GitHub, where releases are tracked and issues can be reported.',
        ],
      },
    ],
  },
  accessibility: {
    title: 'Accessibility statement',
    description: 'Accessibility information and feedback route for Factor Library IL.',
    intro:
      'Factor Library IL is designed and tested with accessibility in mind. The project aims to make its research pages, data tables, downloads, and regression tool usable by as many people as possible.',
    targetTitle: 'Technical target',
    target:
      'The website targets the applicable Level AA criteria of Israeli Standard 5568 and WCAG 2.0. This statement describes the current implementation and does not constitute certification or a legal compliance opinion.',
    featuresTitle: 'Implemented features',
    features: [
      'Semantic page structure, descriptive titles, landmarks, and a skip link.',
      'Keyboard access, visible focus, and reduced-motion support.',
      'English and Hebrew pages with declared language and direction.',
      'Direction isolation for formulas, factor symbols, dates, percentages, and code.',
      'Headers for data tables and text or tabular summaries for charts.',
      'Responsive layouts that support narrow screens and browser zoom.',
    ],
    testingTitle: 'Testing',
    testing:
      'Automated accessibility checks, keyboard navigation, responsive reflow, and mixed-direction content are tested as part of the project’s release checks in both languages. Automated testing is only one part of accessibility review and does not establish full conformance.',
    limitationsTitle: 'Known limitations',
    limitations:
      'Interactive charts are primarily visual and may not expose every plotted point to a screen reader. The site provides summaries, performance tables, and downloadable CSV files as alternatives. Third-party destinations linked from this site are outside the project’s control.',
    feedbackTitle: 'Feedback and contact',
    feedback1:
      'If an accessibility barrier is found, open an accessibility issue in the project repository. Include the page URL, a short description, the browser or device used, and any relevant assistive technology.',
    feedbackLink: 'Report an accessibility problem',
    reviewed: 'Statement last reviewed:',
  },
  notFound: {
    title: 'Page not found',
    description: 'The requested Factor Library IL page was not found.',
    text: 'The requested research page does not exist.',
    home: 'Return home',
  },
} as const;

type TranslationShape<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly TranslationShape<Item>[]
    : { [Key in keyof T]: TranslationShape<T[Key]> };

const heSource: TranslationShape<typeof en> = {
  localeName: 'עברית',
  languageSwitch: 'English',
  languageSwitchLabel: 'הצגת האתר באנגלית',
  skip: 'מעבר לתוכן הראשי',
  navLabel: 'תפריט ראשי',
  navToggle: 'פתיחה או סגירה של התפריט הראשי',
  nav: {
    home: 'בית',
    methodology: 'מתודולוגיה',
    regression: 'מודל',
    changelog: 'יומן שינויים',
    about: 'אודות',
    accessibility: 'נגישות',
  },
  footer: {
    title: 'הבהרה',
    body: 'האתר מיועד ללימוד ולמחקר בלבד. קובצי הנתונים כוללים תשואות פקטורים שחושבו באופן עצמאי; הם אינם כוללים מחירי מסחר גולמיים או סדרות רשמיות של מדדי שוק. אין לראות בתוכן ייעוץ פיננסי, השקעות או משפטי. ביצועי עבר אינם מבטיחים ביצועים בעתיד, וכל שימוש בנתונים ובכלים נעשה באחריות המשתמשים. זהו פרויקט עצמאי, ללא קשר או חסות מצד הבורסה לניירות ערך בתל אביב או כל גוף אחר המוזכר באתר.',
    maintained: 'יצירה ותחזוקה:',
    citation: 'ציטוט',
  },
  factors: {
    rf: {
      name: 'ריבית',
      meaning: 'תשואה שקלית לטווח קצר',
      detail: 'מק״ם לשלושה חודשים',
    },
    mkt_rf: {
      name: 'שוק',
      meaning: 'תשואת השוק העודפת',
      detail: 'משוקלל לפי שווי שוק מלא · עד 7% לנייר',
    },
    smb: { name: 'גודל', meaning: 'קטנות פחות גדולות', detail: 'מיון שנתי 2×3 · יוני' },
    hml: { name: 'ערך', meaning: 'ערך פחות צמיחה', detail: 'הון עצמי לשווי שוק · מיון שנתי ביוני' },
    mom: { name: 'מומנטום', meaning: 'מנצחות פחות מפסידות', detail: 'הרכב חודשי' },
  },
  home: {
    description:
      'ספריית פקטורים פתוחה עבור שוק המניות הישראלי | דאטא בתדירות יומית וחודשית | כלי לניתוח ביצועי קרנות בדפדפן',
    social: 'ספרייה פתוחה לסדרות פקטורים עבור שוק המניות הישראלי | ניתוח ביצועי קרנות בדפדפן',
    eyebrow: 'מחקר כמותי פתוח',
    lead: 'נתוני פקטורים יומיים וחודשיים לשוק המניות הישראלי.',
    dailyDownload: 'הורדת נתונים יומיים',
    monthlyDownload: 'הורדת נתונים חודשיים',
    published: 'הנתונים זמינים',
    pending: 'טרם פורסם',
    pendingText: 'ההורדות ייפתחו עם פרסום גרסת הנתונים הראשונה.',
    release: 'גרסה',
    dailyCoverage: 'כיסוי יומי',
    monthlyCoverage: 'כיסוי חודשי',
    updated: 'עודכן',
    csvFormat: 'מבנה הקבצים',
    csvDescription:
      'התאריכים נכתבים בתבנית ISO והתשואות הן תשואות פשוטות בפורמט עשרוני. השורות מסודרות לפי תאריך. קובץ manifest.json מציין את טווח הנתונים, מועד ההפקה וגרסאות הנתונים והמתודולוגיה.',
    dataLicense: 'רישיון הנתונים:',
    licenseText: 'הנתונים מתפרסמים ברישיון CC BY-NC 4.0, המחייב מתן קרדיט ואינו מתיר שימוש מסחרי.',
    principlesTitle: 'משאב פתוח לקהילת המחקר',
    principles: [
      'סדרות נקיות ומעובדות',
      'עדכון חודשי',
      'מתודולוגיה שקופה ומתועדת',
      'מודל פקטורים בדפדפן',
    ],
    factorTitle: 'תשואות פקטורים וריבית חסרת סיכון',
    methodologyLink: 'איך מחושבים הפקטורים ←',
    regressionTitle: 'ניתוח קרן או תיק',
    regressionText:
      'העלו את ביצועי הקרן או התיק וקבלו אומדן של החשיפה לפקטורים ושל האלפא. החישוב מתבצע בדפדפן, והקובץ נשאר במחשב שלכם.',
    regressionLink: 'לכלי הרגרסיה',
  },
  chart: {
    title: 'תשואה מצטברת',
    growth: 'שווי השקעה התחלתית של 100',
    arithmetic: 'תשואה מצטברת (%)',
    scale: 'סוג סולם',
    logScale: 'סולם לוגריתמי',
    arithmeticScale: 'סולם אריתמטי',
    range: 'טווח זמן',
    series: 'סדרות להצגה',
    checking: 'בודקים אם הנתונים זמינים…',
    pendingTitle: 'הנתונים טרם פורסמו',
    pending: 'התרשים יוצג לאחר פרסום קובצי הנתונים.',
    failed: 'לא ניתן לטעון את נתוני הפקטורים.',
    aria: 'תרשים אינטראקטיבי של תשואות הפקטורים המצטברות. אפשר לבחור אילו סדרות להציג.',
    latestCaption: 'תשואה מצטברת בסוף התקופה',
    ranges: { ytd: 'YTD', '1y': '1Y', '3y': '3Y', all: 'ALL' },
  },
  performance: {
    title: 'ביצועי הפקטורים',
    months: 'חודשים',
    rfPrefix: 'הריבית חסרת הסיכון הממוצעת בתקופה הייתה',
    rfSuffix: 'במונחים שנתיים.',
    factor: 'פקטור',
    mean: 'תשואה ממוצעת',
    monthly: '(חודשי)',
    volatility: 'תנודתיות',
    sharpe: 'שארפ',
    annualized: '(שנתי)',
    significance: 'מובהקות',
    drawdown: 'ירידה מרבית',
    pendingTitle: 'הנתונים טרם פורסמו',
    pending: 'טבלת הביצועים תוצג לאחר פרסום קובצי הנתונים.',
    sharpeHelp:
      'יחס שארפ מוצג במונחים שנתיים: הממוצע החודשי מחולק בסטיית התקן החודשית ומוכפל בשורש 12. לא מנוכה ממנו RF, משום ש־MKT-RF כבר מייצג תשואה עודפת ושאר הפקטורים הם תיקי לונג־שורט ללא השקעה נטו.',
    inferenceHelp:
      'הממוצע והתנודתיות מחושבים ברמה חודשית. סטטיסטי t לממוצע מחושב בעזרת שגיאות תקן HAC של Newey–West. ככלל אצבע, ערך מוחלט מעל 2 מצביע בקירוב על מובהקות ברמה של 5%.',
    frictionless:
      'החישוב אינו כולל עמלות, מרווחי קנייה ומכירה או השפעת שוק. לכן אין לראות בתשואות המוצגות תשואות שניתן בהכרח להשיג במסחר בפועל.',
    power:
      'המדגם כולל {months} חודשים. היעדר מובהקות סטטיסטית אינו מעיד בהכרח שהתשואה הצפויה היא אפס.',
  },
  regression: {
    title: 'מודל פקטורים',
    description: 'בדיקת הקשר בין תשואות של קרן או תיק לבין הפקטורים בספרייה.',
    lead: 'הכלי ממדל את תשואות העבר של קרן או תיק בעזרת הפקטורים בספרייה. כך אפשר לאמוד את החשיפה לכל פקטור, את האלפא ואת שיעור השונות בתשואות שהמודל מסביר. החישוב כולו מתבצע בדפדפן.',
    formatsTitle: 'הכנת הקובץ',
    formatsIntro:
      'הכלי מקבל קובצי CSV ו־XLSX. לאחר בחירת סוג הנתונים והתדירות, אפשר להעלות את הקובץ. קובץ XLSX יכול לכלול גיליון אחד בלבד. העמודות הנדרשות מופיעות בתבניות שלמטה.',
    dailyNav: 'NAV יומי',
    monthlyNav: 'NAV חודשי',
    dailyReturns: 'תשואות יומיות',
    monthlyReturns: 'תשואות חודשיות',
    navAnchor: 'ערך ה־NAV האחרון שלפני תחילת הכיסוי יכול לשמש עוגן לחישוב התשואה הראשונה.',
    monthlyDates: 'תצפיות חודשיות מותאמות לנתוני הפקטורים לפי החודש הקלנדרי.',
    decimalReturns: 'תשואות נכתבות בפורמט עשרוני: 0.0125 מייצג 1.25%.',
    downloadDailyNav: 'הורדת תבנית NAV יומית',
    downloadMonthlyNav: 'הורדת תבנית NAV חודשית',
    downloadDailyReturns: 'הורדת תבנית תשואות יומיות',
    downloadMonthlyReturns: 'הורדת תבנית תשואות חודשיות',
    contractRule:
      'התאריכים חייבים להיות ייחודיים ומסודרים מהישן לחדש. תשואות נכתבות כמספר עשרוני, וערכי NAV חייבים להיות חיוביים. נתונים שמחוץ לתקופת הכיסוי אינם נכללים במודל. ערכי NAV בתוך תקופת הכיסוי חייבים להיות רצופים; בקובץ תשואות מותר להחסיר תאריכים.',
    step1: 'שלב 1',
    describe: 'בחר את פורמט הקובץ שלך',
    inputType: 'סוג הנתונים',
    returns: 'תשואות',
    frequency: 'תדירות',
    daily: 'יומית',
    monthly: 'חודשית',
    requiredColumns: 'שמות העמודות',
    csvDates:
      'אין חשיבות לסדר העמודות או לגודל האותיות בשמותיהן. עמודות נוספות ושורות ריקות אינן מפריעות. בקובץ CSV יש לכתוב תאריכים בתבנית YYYY-MM-DD; בקובץ XLSX אפשר להשתמש גם בתאי תאריך של Excel.',
    navValues: 'ערכי ה־NAV חייבים להיות חיוביים ולייצג שווי בסוף התקופה.',
    returnValues:
      'יש להזין תשואות פשוטות בפורמט עשרוני, וכולן חייבות להיות גדולות מ־−1. לדוגמה, 0.0125 מייצג 1.25%.',
    datesMatch: 'במודל נכללים רק תאריכים החופפים לנתוני הפקטורים שפורסמו.',
    template: 'הורדת תבנית {kind} {frequency}',
    step2: 'שלב 2',
    chooseModel: 'בחירת הפקטורים',
    modelHelp:
      'MKT-RF נכלל בכל רגרסיה. אפשר להוסיף או להסיר את שאר הפקטורים. RF מנוכה תמיד מתשואת התיק לפני אמידת המודל.',
    factors: 'פקטורים',
    required: 'נדרש',
    optional: 'לבחירה',
    currentModel: 'המודל שנבחר:',
    step3: 'שלב 3',
    validate: 'העלאת הקובץ והרצה',
    chooseFile: 'בחירת קובץ CSV או XLSX מהמחשב',
    localFile: 'הקובץ מעובד בדפדפן ואינו נשלח לשרת.',
    validating: 'בודקים את הקובץ…',
    run: 'הרצת הרגרסיה',
    rejected: 'הקובץ נדחה',
    reviewFormat: 'לבדיקת דרישות הקובץ',
    initialStatus: 'תחילה יש לבחור את סוג הנתונים ואת התדירות.',
    publicationPending:
      'נתוני הפקטורים טרם פורסמו. אפשר להוריד תבניות, אך עדיין אי אפשר להריץ רגרסיה.',
    manifestFailed: 'לא הצלחנו לטעון את פרטי גרסת הנתונים.',
    settingsChanged: 'ההגדרות השתנו. יש להריץ שוב כדי לבדוק את הקובץ שנבחר.',
    warningShortSample: 'יש לפרש את התוצאות בזהירות: פחות מ־{threshold} תצפיות {frequency}.',
    warningPercentScale:
      'כדאי לבדוק את הסקאלה של התשואות בקובץ. התנועה בו גדולה פי {ratio} בערך מתנועת השוק באותם תאריכים, ונראה שהערכים רשומים באחוזים ולא כשברים עשרוניים. יש להזין 0.0125 במשמעות 1.25%. אם הקובץ באחוזים, האלפא ומקדמי הפקטורים שגויים בפקטור של כ־100.',
    modelChangedFile: 'בחירת הפקטורים השתנתה. הקובץ עדיין מוכן; יש להריץ שוב את הרגרסיה.',
    modelChanged: 'בחירת הפקטורים השתנתה. כעת אפשר לבחור קובץ.',
    fileSelected: 'הקובץ מוכן לבדיקה ולהרצה.',
    chooseFileStatus: 'יש לבחור קובץ CSV או XLSX.',
    chooseBeforeRun: 'יש לבחור קובץ CSV או XLSX לפני הרצת הרגרסיה.',
    checking: 'בודקים את הקובץ…',
    validated: 'המודל נאמד על {observations} תצפיות, מ־{start} עד {end}.',
    alignmentExcluded:
      'שורות שלא נכללו — לפני תקופת הכיסוי: {before}; אחרי התקופה: {after}; תאריכים ללא התאמה: {unmatched}.',
    failed: 'לא ניתן להשלים את הרגרסיה.',
    validationFailed: 'הבדיקה נכשלה. לא בוצעו חישובים.',
    resultsTitle: 'תוצאות הרגרסיה',
    model: 'מודל:',
    downloadResults: 'הורדת התוצאות',
    alpha: 'אלפא במונחים שנתיים',
    alphaInference: 'מובהקות אלפא',
    rSquared: 'R²',
    adjustedRSquared: 'R² מתוקנן',
    observations: 'תצפיות',
    factor: 'פקטור',
    coefficient: 'מקדם (בטא)',
    incrementalRSquared: 'ΔR²',
    hacSe: 'שגיאת תקן HAC',
    tStat: 'סטטיסטי t',
    pValue: 'ערך p',
    methodNote:
      'שגיאות התקן הן HAC של Newey–West עם {lags} פיגורים. ערכי p הם דו־צדדיים ומבוססים על קירוב נורמלי אסימפטוטי.',
    guide: 'איך לקרוא את התוצאות?',
    guideIntro:
      'המודל מפריד את תשואת התיק, בניכוי הריבית חסרת הסיכון, לשני חלקים: התשואה שנבעה מחשיפה לסיכוני שוק מוכרים, והתשואה שנותרה לאחר שסיכונים אלה הובאו בחשבון.',
    readingOrderTitle: 'סדר קריאת התוצאות',
    orderStep1Label: 'היקף המדגם:',
    orderStep1:
      'יש להתחיל במספר התצפיות ובתקופה הנסקרת. מדגם קצר תומך במסקנות חלשות, גם אם המספרים נראים מובהקים.',
    orderStep2Label: 'R² מתוקנן:',
    orderStep2:
      'מראה איזה חלק מתנודות התיק מוסבר על ידי הפקטורים שנבחרו, תוך ניכוי "קנס" על כל פקטור שנוסף. ערך גבוה מעיד שהתיק נע בעיקר בהתאם לחשיפות מוכרות.',
    orderStep3Label: 'גודל המקדמים וסימנם (פרופיל התיק):',
    orderStep3:
      'סימן חיובי מציין תנועה עם הפקטור, וסימן שלילי – תנועה בכיוון הנגדי. את מקדם השוק משווים ל־1: ערך מעל 1 מבטא רגישות (או סיכון) גבוהה מזו של השוק עצמו, וערך מתחת ל־1 מבטא רגישות נמוכה יותר. בשאר הפקטורים נקודת הייחוס היא אפס, וככל שהמקדם רחוק ממנה הנטייה חזקה יותר.',
    orderStep4Label: 'אלפא (α):',
    orderStep4:
      'התשואה הממוצעת שהפקטורים אינם מסבירים, המוצגת במונחים שנתיים לצד מדדי המובהקות שלה (חשוב לקרוא את ההזהרה לגבי משמעות האלפא בחלק "ממה להיזהר בקריאה").',
    termsTitle: 'מה כל מדד אומר?',
    deltaLabel: 'תוספת ל־R² (תרומה שולית)',
    deltaText:
      'חלק ה־R² שהפקטור מסביר באופן ייחודי. בשל מתאם וחפיפה בין הפקטורים, סכום התרומות השוליות אינו חייב להיות שווה ל־R² הכולל.',
    hacLabel: 'שגיאת תקן (HAC)',
    hacText:
      'מדד לאי־הוודאות סביב המקדם, המתקן הטיות הנובעות מתנודתיות משתנה או מתאימות בין תקופות.',
    tpLabel: 'ערך t וערך p',
    tpText:
      'בודקים אם המקדם שונה מאפס, כלומר אם התוצאה משקפת דפוס עקבי או תנודה מקרית. ככל שערך p קטן יותר (מתחת ל־0.05), התוצאה מובהקת יותר – אך מובהקות אינה מעידה בהכרח על חשיבות כלכלית או על הישנות בעתיד.',
    misreadTitle: 'ממה להיזהר בקריאה?',
    warn1Label: 'ערך t גבוה במקדם השוק:',
    warn1: 'צפוי מראש, שכן כל תיק מניות חשוף לשוק. יש לבחון את גודל המקדם עצמו ולא את מובהקותו.',
    warn2Label: 'תדירות הנתונים:',
    warn2:
      'נתונים יומיים מניבים ערכי t גבוהים מנתונים חודשיים בשל גודל המדגם. אין להשוות מובהקות בין תדירויות שונות.',
    warn3Label: 'משמעות האלפא:',
    warn3:
      'האלפא מושפעת לחלוטין מהמודל שנבחר. גם אלפא מובהקת אינה מעידה בהכרח על כישרון או מיומנות, ועשויה לנטוע רושם מוטעה בשל חשיפה לגורמי סיכון אחרים (כגון סקטורים ספציפיים או פקטורים נוספים) שלא נלקחו בחשבון בבחירת המודל.',
    warn4Label: 'הסייג:',
    warn4: 'התוצאות מתארות את נתוני העבר בלבד, ואינן מהוות תחזית או ייעוץ השקעות.',
    fitTitle: 'תשואה עודפת מצטברת: בפועל מול המוסבר על ידי הפקטורים',
    date: 'תאריך',
    actual: 'בפועל',
    explained: 'מוסבר על ידי הפקטורים',
    fitCaption:
      'הקו הסגול מציג את התשואה שהחשיפות לפקטורים בלבד היו מניבות. השטח המוצלל שבין הקווים הוא החלק שהפקטורים אינם מסבירים, והפער המצטבר בסוף התקופה הוא {alpha}. הפער מורכב לאורך כל התקופה, ולכן אינו זהה לאלפא השנתית המדווחת בטבלה. כמו כן הוא נמדד ביחס למודל שנבחר בלבד: פקטור שאינו נכלל במודל יופיע כאן כאלפא, ולכן אין לראות בפער עדות למיומנות.',
    fitAria: 'תשואה עודפת מצטברת, בפועל מול החלק המוסבר על ידי הפקטורים',
    fitSummary:
      'תקופת המדגם: {start} עד {end}. בסוף התקופה התשואה העודפת המצטברת בפועל היא {actual}, והחלק המוסבר על ידי הפקטורים הוא {explained}.',
  },
  methodology: {
    title: 'מתודולוגיה',
    description: 'הסבר על בניית הריבית חסרת הסיכון ופקטורי השוק, הגודל, הערך והמומנטום.',
    version: 'גרסה',
    overview1a: 'הספרייה מבוססת על ',
    framework: 'מודלי הפקטורים של Fama–French ו־Carhart',
    overview1b:
      '. במקור, מודלים אלו נועדו להסביר את השונות בתשואות הנכסים באמצעות גורמים סיסטמטיים. בפועל משתמשים בהם גם כדי לבודד את התשואה שנותרה מעבר לאותם גורמים (אלפא). מטרת הספרייה היא לשמר את ההיגיון הכלכלי המקובל בספרות, תוך התאמה של כללי הרכבת התיקים למבנה הקטן והריכוזי יחסית של שוק המניות בישראל.',
    overview2:
      'אוכלוסיית המחקר מבוססת על שכבת המניות הרחבה בשוק הישראלי, לרבות חברות קטנות, וכוללת כ־185 מניות בנקודת זמן ממוצעת. בכל תקופה נכללות כל החברות שעמדו בתנאי הסף, בהתאם למידע שהיה זמין באותה עת (Point-In-Time – PIT).',
    overview3:
      'תיק השוק (MKT-RF) משוקלל לפי שווי שוק, בעוד שבתיקי הפקטורים ניתן משקל שווה לכל מניה (Equal-Weighted). התיקים מוחזקים ללא שינוי עד למועד האיזון הבא; התשואות היומיות מתועדות, והתשואה החודשית מחושבת באמצעות צבירת הסדרה היומית. התשואות המחושבות הן תשואות כוללות (Total Return), הכוללות חלוקת דיבידנדים.',
    rfTitle: 'RF: ריבית חסרת סיכון',
    rfIntro:
      'סדרת RF מייצגת תשואה שקלית חסרת סיכון לטווח קצר. הסדרה היומית מבוססת על התשואה לפדיון של מק״ם לשלושה חודשים, כפי שמתפרסמת בסדרה הרשמית של בנק ישראל.',
    monthly: 'חודשי',
    rfMonthly:
      'ה־RF החודשי אינו מחושב מסדרת תשואות חודשית נפרדת, אלא מצבירת תשואות ה־RF היומיות שפורסמו במהלך החודש.',
    daily: 'יומי',
    rfDaily:
      'תשואת המק״ם מתפרסמת במונחים שנתיים. בכל יום מסחר היא מומרת לתשואה לתקופת ההחזקה בהתאם למספר הימים הקלנדריים שחלפו מאז התצפית הקודמת. באופן זה, הריבית שנצברה בסופי שבוע ובחגים נכללת בתשואה היומית העוקבת המפורסמת.',
    rfNotation:
      'בנוסחאות להלן, Yₜ מייצג את התשואה השנתית באחוזים, ו־Δdₜ מייצג את מספר הימים הקלנדריים שחלפו בין שתי תצפיות יומיות עוקבות.',
    marketTitle: 'MKT-RF: שוק',
    marketIntro: 'MKT-RF מייצג את תשואת השוק העודפת של אוכלוסיית המניות שנכללה במחקר.',
    marketWeightingText:
      'משקלה של כל מניה נקבע לפי שווי השוק המלא שלה בסוף התקופה הקודמת. החישוב מבוסס על שווי השוק המלא, ולא על שווי החזקות הציבור (Free Float).',
    marketCapText:
      'הואיל ושוק המניות הישראלי מתאפיין בריכוזיות, משקלה של מניה בודדת מוגבל ל־7% מהתיק. המשקל העודף מעל התקרה מבוזר בין יתר המניות בהתאם לשווי השוק היחסי שלהן, בתהליך איטרטיבי החוזר על עצמו עד שאף מניה אינה חורגת מהמגבלה.',
    marketPurposeText:
      'קביעת התקרה מפחיתה את התלות במספר מצומצם של חברות מבלי לשנות את אוכלוסיית המחקר. ללא מגבלה זו, משקלה של מניה בודדת הגיע בעבר לכ־35% משווי השוק הכולל של האוכלוסייה.',
    marketFormula: 'לאחר חישוב תשואת תיק השוק, מנוכה ממנה תשואת ה־RF לאותה תקופה:',
    sizeTitle: 'SMB: גודל',
    sizeIntro: 'פקטור גודל (SMB) מודד את פער התשואות בין חברות קטנות לגדולות.',
    ffSortText:
      'בניית ה־SMB ופקטור הערך (HML) נעשית באמצעות מיון מלוכד אחד בסוף יוני של כל שנה (t):',
    sortSize: 'גודל: חלוקה לשתי קבוצות לפי חציון שווי השוק (קטנות וגדולות).',
    sortValue:
      'ערך: חלוקה לשלוש קבוצות לפי היחס בין ההון העצמי לשווי השוק (30% נמוך, 40% בינוני, 30% גבוה).',
    sortResult: 'הצלבת המיונים יוצרת שישה תיקים המוחזקים במשך 12 חודשים.',
    bookEquityText:
      'היחס בין ההון העצמי לשווי השוק מחושב לפי ההון של שנת t−1 חלקי שווי השוק בסוף דצמבר t−1 (להבטחת חלון ניטרלי של שישה חודשים), בעוד המיון לפי גודל מבוסס על שווי השוק בסוף יוני t.',
    pitText: 'נתוני הדוחות הכספיים משולבים במועד פרסומם בפועל.',
    breakpointText:
      'בשונה מהספרות המקורית המחשבת את נקודות החיתוך מבורסת ניו יורק בלבד, בישראל הן מחושבות מתוך המדד הרחב. הכללת כלל השוק מאפשרת למניות הקטנות להסיט את החציון כלפי מטה, ואף להשפיע על סימן התשואה של הפקטור.',
    smbFormula: 'ממוצע התשואות של קבוצות הערך מנטרל את השפעת פקטור הערך ומבודד את פרמיית הגודל:',
    valueTitle: 'HML: ערך',
    valueIntro:
      'פקטור ערך (HML) מודד את פער התשואות בין חברות בעלות יחס גבוה בין ההון העצמי לשווי השוק (חברות ערך) לבין חברות בעלות יחס נמוך (חברות צמיחה).',
    valueSharedText:
      'הפקטור נבנה מאותם שישה תיקים ובאותו מועד קביעה שנתי בסוף יוני. מיצוע שתי קבוצות הגודל מנטרל את השפעת הגודל ומבודד את פרמיית הערך, בעוד קבוצת האמצע (ערך בינוני) מוחרגת מהחישוב.',
    hmlFormula:
      'ה־HML מחושב כהפרש בין ממוצע התשואות של שני תיקי הערך הגבוה לבין ממוצע התשואות של שני תיקי הערך הנמוך:',
    momentumTitle: 'MOM: מומנטום',
    momentumIntro:
      'פקטור מומנטום (MOM) מודד את פער התשואות בין המניות בעלות הביצועים הטובים ביותר בשנה האחרונה ("המנצחות") לבין אלו בעלות הביצועים החלשים ביותר ("המפסידות").',
    momentumSortText:
      'הדירוג מבוצע בסוף כל חודש (t) לפי התשואה המצטברת של המניה ב־11 החודשים שחלפו (מ־t−12 עד t−1). חודש הקביעה עצמו (t) מוחרג מהמדידה כדי למנוע הטיה הנובעת מהיפוך מגמה קצר טווח. 30% מהמניות המובילות מסווגות כ"מנצחות", 30% התחתונות כ"מפסידות", ו־40% האמצעיות מוחרגות מהחישוב.',
    sizeSortText:
      'כדי לנטרל את השפעת הגודל, המניות מחולקות במקביל לקטנות וגדולות לפי החציון. הצלבת שני המיונים יוצרת ארבעה תיקים בשקלול שווה – מנצחות־קטנות, מנצחות־גדולות, מפסידות־קטנות ומפסידות־גדולות – המתעדכנים מדי חודש.',
    momentumFormula: 'ה־MOM מחושב כהפרש בין ממוצע התשואות של תיקי המנצחות לזה של תיקי המפסידות:',
    regressionTitle: 'אמידת הרגרסיה והערכת ביצועים',
    regressionIntro:
      'מודל הרגרסיה מפרק את תשואת התיק לשני חלקים: חשיפה לסיכונים כלליים בשוק (הפקטורים) ותשואה עודפת נקייה – אלפא (α).',
    regressionEquationLead: 'משוואת המודל המלאה:',
    regressionBasis:
      'תשואת הריבית חסרת הסיכון (RF) מנוכה מתשואת התיק טרם הניתוח, ופקטור השוק (MKT-RF) נכלל בכל מפרט.',
    technicalTitle: 'דגשים טכניים',
    techAnnual: 'הצגה שנתית: אלפא יומית מוכפלת ב־252 ואלפא חודשית ב־12 לקבלת ערך שנתי.',
    techHac:
      'דיוק מדד הסטייה (Newey–West): החישוב מתקן הטיות הנובעות ממגמות מתמשכות או משינויים בעוצמת התנודתיות לאורך זמן. אורך הפיגור (L) נקבע לפי:',
    techPValue:
      'בדיקת אמינות (p-value): מבוצעת במבחן דו־צדדי המבוסס על התפלגות נורמלית, כדי לוודא שהתוצאה אינה מקרית.',
    fitMeasuresTitle: 'מדדי טיב התאמה',
    regressionDeltaR2:
      'תרומה שולית (ΔR²): מדד זה בודק כמה כוח הסבר ייחודי מוסיף פקטור מסוים, על ידי השוואת המודל המלא למודל שנאמד בלעדיו. בשל קשרים ומתאם בין הפקטורים השונים, סכום התרומות השוליות אינו שווה ל־R² הכולל.',
    regressionAdjR2:
      'R² מתוקנן: המדד המרכזי להשוואה. בניגוד ל־R² רגיל (שעולה תמיד כשמוסיפים משתנים), המדד המתוקנן מנכה "קנס" על כל פקטור שנוסף, וכך מאפשר להשוות בצורה אמינה בין הרכבי מודל שונים.',
    revisionsTitle: 'שינויים במתודולוגיה',
    revisions:
      'שינויים מהותיים בנתונים או בשיטת החישוב מתועדים ביומן השינויים (Changelog), לצד מספר הגרסה והמועד שבו נכנס השינוי לתוקף.',
  },
  about: {
    title: 'כלים פתוחים למחקר פקטורים בשוק הישראלי',
    description: 'על Factor Library IL, הנתונים, המתודולוגיה, הרישיון ואופן הציטוט.',
    intro1:
      'Factor Library IL נועדה להקל על מחקר שיטתי בשוק המניות הישראלי. בשווקים מרכזיים בעולם קיימים מאגרי פקטורים מקובלים ונגישים, אך נתונים מקבילים לשוק הישראלי עדיין אינם פשוטים להשגה ולשימוש.',
    intro2:
      'הפרויקט מרכז במקום אחד סדרות תשואה של פקטורים, תיעוד של שיטות החישוב וכלים פשוטים להורדת הנתונים ולניתוח קרנות ותיקים.',
    approachTitle: 'עקרונות הפרויקט',
    approach1:
      'הספרייה בנויה להיות פשוטה ושקופה. לכל פקטור יש הגדרה ברורה ושיטת חישוב מתועדת. כל שינוי מהותי בנתונים או במתודולוגיה מתועד ביומן השינויים ונכלל בגרסה חדשה.',
    approach2:
      'זהו אתר סטטי שאינו דורש הרשמה. קבצים שמועלים לכלי הרגרסיה מעובדים במחשב של המשתמשים ואינם נשלחים לשרת.',
    maintainerTitle: 'יוצר הפרויקט',
    maintainedBy: 'הפרויקט נוצר ומתוחזק על ידי',
    onX: 'ב־X). קוד המקור נמצא ב־',
    citationTitle: 'איך לצטט',
    citation:
      'בכל שימוש בנתונים, בשיתופם או בהצגתם יש לתת קרדיט ל־Factor Library IL ולגלעד. פרטי הציטוט המלאים נמצאים בקובץ CITATION.cff שבמאגר הפרויקט, ומומלץ לציין גם את גרסת הנתונים, את גרסת המתודולוגיה ואת מועד הורדת הנתונים.',
    licensing1: 'קוד האתר מופץ ברישיון MIT. קובצי נתוני הפקטורים מופצים בנפרד ברישיון',
    licensing2:
      '. הרישיון מחייב מתן קרדיט מתאים ל־Factor Library IL ולגלעד, ואינו מתיר שימוש מסחרי. אם הנתונים שונו, יש לציין זאת בבירור. אין להציג שימוש בנתונים כאילו זכה לחסות או לאישור מצד הפרויקט.',
    independenceTitle: 'פרויקט עצמאי',
    independence:
      'Factor Library IL אינו קשור לבורסה לניירות ערך בתל אביב, ל־Eugene Fama, ל־Kenneth French, ל־Mark Carhart או למוסדות הקשורים אליהם, ואינו פועל מטעמם או בחסותם. שמות החוקרים מוזכרים רק כדי לזהות את המסגרות האקדמיות שעליהן מבוססת המתודולוגיה.',
    disclaimerTitle: 'הבהרה משפטית',
    disclaimer1:
      'הנתונים, המתודולוגיה והכלים מיועדים לשימוש לימודי, אקדמי ומחקרי בלבד. קובצי הנתונים כוללים סדרות תשואה פיננסיות נגזרות שחושבו באופן עצמאי. הם אינם כוללים מחירי מסחר גולמיים, אינם מפרסמים ערכים רשמיים של מדדי שוק ואינם משחזרים סדרות תשואה קנייניות של מדדים.',
    disclaimer2:
      'Factor Library IL אינו קשור לבורסה לניירות ערך בתל אביב, למנהל מדד, לספק נתונים, ל־Eugene Fama, ל־Kenneth French, ל־Mark Carhart או למוסדות הקשורים אליהם, ואינו פועל מטעמם או בחסותם. אזכורים של פלחי שוק ושל תנאי סף המבוססים על מדדי ייחוס נועדו להסביר את המתודולוגיה בלבד. אין בהם כדי להעיד על חסות, תמיכה או זכויות במדד רשמי כלשהו.',
    disclaimer3:
      'אין בתוכן הפרויקט ייעוץ פיננסי, השקעות, מס או משפטי, ואין בו המלצה או הצעה לקנות או למכור נייר ערך. ביצועים היסטוריים או תוצאות של בדיקה לאחור אינם מבטיחים ביצועים בעתיד. השימוש בנתונים, במתודולוגיה ובכלים נעשה באחריות המשתמשים בלבד. במידה המרבית המותרת על פי דין, המחבר אינו אחראי להפסדי מסחר, להחלטות השקעה או לתוצאות ישירות או עקיפות הנובעות מהשימוש בהם.',
    disclaimer4a:
      'נעשים מאמצים סבירים לשמור על איכות הנתונים ולהשתמש במידע שהיה זמין בכל מועד, ככל שהדבר רלוונטי. עם זאת, ייתכנו בנתונים טעויות, חוסרים או אי־התאמות, והם ניתנים כפי שהם. ',
    valueFactor: 'פקטור הערך',
    disclaimer4b:
      ' מבוסס בחלקו על דיווחים חשבונאיים שעשויים להתעדכן, להשתנות או להתפרסם מחדש לאחר מועד החישוב.',
  },
  changelog: {
    title: 'יומן שינויים',
    description: 'תיעוד השינויים בנתונים, במתודולוגיה ובאתר של Factor Library IL.',
    lead: 'כאן מתועדים שינויים מהותיים בנתונים, בשיטת החישוב ובכלי המחקר.',
    entries: [
      {
        heading: 'הגרסה הציבורית הראשונה',
        version: 'מתודולוגיה 1.1.0 · נתונים 2026.07.2',
        items: [
          'נקודת הפתיחה של הספרייה. כל רשומה שמעליה מתעדת שינוי ביחס אליה.',
          'פרסום ראשון של סדרות הפקטורים: RF, MKT-RF, SMB, HML ו־MOM, בתדירות יומית וחודשית. טווח הכיסוי המעודכן מופיע בעמוד הבית ובקובץ ה־manifest.',
          'תיעוד מלא של אופן חישוב כל סדרה, לרבות הנוסחאות והסטיות מהספרות המקורית שמבנה השוק הישראלי מחייב.',
          'כלי רגרסיה הפועל כולו בדפדפן; הקובץ הנבחר אינו יוצא מהמחשב של המשתמש.',
          'פתיחת מאגר הקוד הציבורי של הפרויקט ב־GitHub, שבו מתועדות הגרסאות ואפשר לדווח על תקלות.',
        ],
      },
    ],
  },
  accessibility: {
    title: 'הצהרת נגישות',
    description: 'מידע על נגישות האתר ועל הדרך לדווח על קושי בשימוש ב־Factor Library IL.',
    intro:
      'בעת בניית Factor Library IL ניתנה תשומת לב לנגישות של עמודי התוכן, טבלאות הנתונים, הקבצים להורדה וכלי הרגרסיה. המטרה היא לאפשר לכמה שיותר אנשים להשתמש באתר באופן עצמאי ונוח.',
    targetTitle: 'תקן היעד',
    target:
      'מטרת העבודה היא לעמוד בדרישות הרלוונטיות ברמה AA של תקן ישראלי 5568 ושל WCAG 2.0. הצהרה זו מתארת את מצב האתר בפועל; היא אינה אישור נגישות או חוות דעת משפטית לגבי עמידה בדרישות הדין.',
    featuresTitle: 'מה הונגש באתר',
    features: [
      'מבנה סמנטי, כותרות ברורות, אזורי ניווט וקישור לדילוג ישירות לתוכן הראשי.',
      'תפעול באמצעות מקלדת, סימון ברור של הרכיב שבמיקוד ותמיכה בהעדפה להפחתת תנועה.',
      'הגדרה נכונה של השפה וכיוון הקריאה בעמודים בעברית ובאנגלית.',
      'שמירה על כיוון קריאה תקין בנוסחאות, בקודי פקטורים, בתאריכים, באחוזים ובקטעי קוד.',
      'כותרות מזוהות בטבלאות וחלופה טקסטואלית או טבלאית למידע מרכזי שמוצג בתרשימים.',
      'פריסה שמתאימה למסכים צרים ולהגדלת התצוגה בדפדפן.',
    ],
    testingTitle: 'בדיקות',
    testing:
      'בדיקות ההפצה כוללות בדיקות נגישות אוטומטיות בשתי השפות, ניווט במקלדת, תצוגה במסכים צרים ובדיקה של תוכן המשלב עברית ואנגלית. בדיקה אוטומטית היא כלי עזר בלבד ואינה מוכיחה התאמה מלאה לתקן.',
    limitationsTitle: 'מגבלות ידועות',
    limitations:
      'התרשימים האינטראקטיביים הם רכיב חזותי, ולא כל נקודת מידע בהם זמינה לקורא מסך. המידע המרכזי זמין גם בסיכומים, בטבלאות ביצועים ובקובצי CSV להורדה. נגישותם של אתרים חיצוניים שאליהם מפנה האתר אינה בשליטת הפרויקט.',
    feedbackTitle: 'דיווח על בעיית נגישות',
    feedback1:
      'נתקלתם בקושי להשתמש באתר? אפשר לפתוח דיווח במאגר הפרויקט. כדי שנוכל לבדוק את הבעיה, יש לצרף את כתובת העמוד, תיאור קצר, סוג הדפדפן או המכשיר ופרטים על טכנולוגיה מסייעת, אם נעשה בה שימוש.',
    feedbackLink: 'פתיחת דיווח נגישות',
    reviewed: 'עדכון אחרון של ההצהרה:',
  },
  notFound: {
    title: 'העמוד לא נמצא',
    description: 'לא מצאנו את העמוד המבוקש ב־Factor Library IL.',
    text: 'ייתכן שהכתובת שגויה או שהעמוד הועבר.',
    home: 'לעמוד הבית',
  },
};

const he = isolateTechnicalCopy(heSource);

export type Messages = TranslationShape<typeof en>;

export const COPY: Record<Locale, Messages> = { en, he };

export function pageLabel(locale: Locale, page: PageKey): string {
  return COPY[locale].nav[page];
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, isolateTechnicalRuns(String(value))),
    template,
  );
}
