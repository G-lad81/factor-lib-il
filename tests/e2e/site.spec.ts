import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function waitForRegression(page: Page) {
  await page.locator('astro-island:not([ssr])').waitFor({ state: 'attached' });
}

function monthlyRegressionFixture() {
  const dates = Array.from({ length: 12 }, (_, index) =>
    new Date(Date.UTC(2024, index + 1, 0)).toISOString().slice(0, 10),
  );
  const factorLines = dates.map((date, index) => {
    const mkt = 0.002 * Math.sin(index * 0.8) + 0.0004 * (index % 3);
    const smb = 0.0015 * Math.cos(index * 0.45) + 0.0002 * (index % 4);
    const hml = 0.0012 * Math.sin(index * 0.31 + 1) + 0.00015 * (index % 5);
    const mom = 0.0025 * Math.cos(index * 0.27 - 0.2) + 0.0001 * index;
    return `${date},0.0001,${mkt},${smb},${hml},${mom}`;
  });
  return { dates, factorCsv: `date,rf,mkt_rf,smb,hml,mom\n${factorLines.join('\n')}` };
}

async function routeMonthlyRegressionData(page: Page, dates: string[], factorCsv: string) {
  await page.route('**/data/manifest.json', (route) =>
    route.fulfill({
      json: {
        schema_version: 1,
        data_license: 'CC-BY-NC-4.0',
        status: 'ready',
        methodology_version: '1.0.0',
        data_version: '2026.08',
        generated_at: '2026-08-12T00:00:00Z',
        factors: ['rf', 'mkt_rf', 'smb', 'hml', 'mom'],
        daily: {
          path: 'data/factors_daily.csv',
          coverage_start: dates[0],
          coverage_end: dates.at(-1),
          rows: dates.length,
        },
        monthly: {
          path: 'data/factors_monthly.csv',
          coverage_start: dates[0],
          coverage_end: dates.at(-1),
          rows: dates.length,
        },
      },
    }),
  );
  await page.route('**/data/factors_monthly.csv', (route) =>
    route.fulfill({ body: factorCsv, contentType: 'text/csv' }),
  );
}

test('public routes render with shared navigation', async ({ page }) => {
  for (const route of [
    '/',
    '/methodology/',
    '/regression/',
    '/changelog/',
    '/about/',
    '/accessibility/',
  ]) {
    await page.goto(route);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('main h1')).toBeVisible();
  }
});

test('language switch maps equivalent routes without persistence', async ({ page }) => {
  await page.goto('/methodology/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    /\/en\/methodology\/$/,
  );
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    'href',
    /\/methodology\/$/,
  );

  const navToggle = page.locator('.nav-toggle');
  if (await navToggle.isVisible()) await navToggle.click();
  await page.locator('a.language-switch').click();
  await expect(page).toHaveURL(/\/en\/methodology\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: 'Methodology', exact: true })).toBeVisible();
  await expect(page.locator('.formula').first()).toHaveAttribute('dir', 'ltr');

  const storage = await page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    databases: (await indexedDB.databases()).length,
    cookies: document.cookie,
  }));
  expect(storage).toEqual({ local: 0, session: 0, databases: 0, cookies: '' });
});

test('external links open safely in a new tab while internal links do not', async ({ page }) => {
  for (const route of ['/', '/about/']) {
    await page.goto(route);
    const external = page.locator('a[data-external-link]');
    await expect(external.first()).toHaveAttribute('target', '_blank');
    for (let index = 0; index < (await external.count()); index += 1) {
      await expect(external.nth(index)).toHaveAttribute('target', '_blank');
      await expect(external.nth(index)).toHaveAttribute('rel', /noopener/);
      await expect(external.nth(index)).toHaveAttribute('rel', /noreferrer/);
    }
    await expect(page.locator('a.brand')).not.toHaveAttribute('target');
  }
});

test('removed Data page falls through to 404', async ({ page }) => {
  await page.goto('/data/');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Data' })).toHaveCount(0);
});

test('published data state follows the manifest and keeps the public schema visible', async ({
  page,
}) => {
  await page.goto('/en/');
  const manifestResponse = await page.request.get('/data/manifest.json');
  const manifest = await manifestResponse.json();
  await expect(page.getByText('Published', { exact: true })).toBeVisible();
  await expect(page.locator('.csv-format code')).toHaveText(
    ['date', ...manifest.factors].join(','),
  );
  const performance = page.locator('.performance');
  await expect(performance.getByRole('heading', { name: 'Factor performance' })).toBeVisible();
  await expect(performance.locator('thead th')).toHaveCount(6);
  await expect(performance.locator('tbody th')).toHaveCount(manifest.factors.length - 1);
  await expect(page.getByRole('link', { name: 'Download daily CSV' })).toHaveAttribute(
    'href',
    /factors_daily\.csv$/,
  );
  await expect(page.getByRole('link', { name: 'Download monthly CSV' })).toHaveAttribute(
    'href',
    /factors_monthly\.csv$/,
  );
});

test('chart supports scale and series controls with financial labels', async ({
  page,
}, testInfo) => {
  const dates = ['2025-01-02', '2025-01-05', '2025-01-06'];
  const factorCsv = `date,rf,mkt_rf,smb,hml,mom\n${dates
    .map((date, index) => `${date},0.0001,${0.001 + index * 0.0001},0.0002,-0.0001,0.0003`)
    .join('\n')}`;
  await page.route('**/data/manifest.json', (route) =>
    route.fulfill({
      json: {
        schema_version: 1,
        data_license: 'CC-BY-NC-4.0',
        status: 'ready',
        methodology_version: '1.0.0',
        data_version: '2026.08',
        generated_at: '2026-08-12T00:00:00Z',
        factors: ['rf', 'mkt_rf', 'smb', 'hml', 'mom'],
        daily: {
          path: 'data/factors_daily.csv',
          coverage_start: dates[0],
          coverage_end: dates.at(-1),
          rows: dates.length,
        },
        monthly: {
          path: 'data/factors_monthly.csv',
          coverage_start: dates[0],
          coverage_end: dates.at(-1),
          rows: dates.length,
        },
      },
    }),
  );
  await page.route('**/data/factors_daily.csv', (route) =>
    route.fulfill({ body: factorCsv, contentType: 'text/csv' }),
  );
  await page.goto('/en/');
  await page.locator('astro-island:not([ssr])').waitFor({ state: 'attached' });
  const logarithmic = page.getByRole('button', { name: 'Logarithmic scale' });
  const arithmetic = page.getByRole('button', { name: 'Arithmetic scale' });
  await expect(logarithmic).toHaveAttribute('aria-pressed', 'true');
  await arithmetic.click();
  await expect(arithmetic).toHaveAttribute('aria-pressed', 'true');
  if (testInfo.project.name === 'desktop') {
    const overlay = page.locator('.plot .u-over');
    await expect(overlay).toBeVisible();
    await overlay.hover({ position: { x: 100, y: 100 } });
    const chartValues = page.locator('.plot .u-value');
    await expect(chartValues.first()).toHaveText(/^\d{4}-\d{2}-\d{2}$/);
    for (let index = 1; index < (await chartValues.count()); index += 1) {
      await expect(chartValues.nth(index)).toHaveText(/%$/);
    }
  }
  const rfToggle = page.locator('.legend label').filter({ hasText: /^RF$/ }).locator('input');
  await expect(rfToggle).toBeChecked();
  await rfToggle.uncheck();
  await expect(rfToggle).not.toBeChecked();
});

test('methodology and legal disclosures are published', async ({ page }) => {
  await page.goto('/en/methodology/');
  await expect(page.getByRole('heading', { name: 'Methodology', exact: true })).toBeVisible();
  await expect(page.getByText(/Fama–French and Carhart factor models/)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Carhart factors/ })).toHaveCount(0);
  // the page must never name index constituents
  await expect(page.getByText(/TA-125|TA-SME60/)).toHaveCount(0);
  for (const section of ['MKT-RF: Market', 'SMB: Size', 'HML: Value', 'MOM: Momentum']) {
    await page.getByText(section, { exact: true }).click();
  }
  await expect(page.getByText(/no single stock may account for more than 7%/)).toBeVisible();
  await expect(page.getByText(/top 30% are classified as winners/i)).toBeVisible();
  // Size and Value are published, so no section may still be waiting on a definition
  await expect(page.locator('.method-content .pending')).toHaveCount(0);
  await expect(page.getByText(/SMBₜ = ⅓/)).toBeVisible();
  await expect(page.getByText(/HMLₜ = ½/)).toBeVisible();
  await page.goto('/en/about/');
  await expect(
    page.getByRole('heading', { name: 'Open Tools for Israeli Factor Research' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Legal Disclaimer' })).toBeVisible();
  await expect(page.getByText(/do not contain raw exchange prices/)).toBeVisible();
  await expect(page.getByText(/author accepts no liability for trading losses/)).toBeVisible();
});

test('methodology sections are collapsed by default and keyboard accessible', async ({ page }) => {
  await page.goto('/en/methodology/');
  const sections = page.locator('.method-section');
  await expect(sections).toHaveCount(7);
  for (let index = 0; index < 7; index += 1) {
    await expect(sections.nth(index)).not.toHaveAttribute('open', '');
  }
  const riskFree = page.locator('summary').filter({ hasText: 'RF: Risk-Free Return' });
  await riskFree.focus();
  await page.keyboard.press('Enter');
  await expect(sections.first()).toHaveAttribute('open', '');
  await expect(page.getByText(/official yield-to-maturity series/)).toBeVisible();
});

test('regression preferences persist while portfolio files remain in memory', async ({ page }) => {
  const { dates, factorCsv } = monthlyRegressionFixture();
  await routeMonthlyRegressionData(page, dates, factorCsv);
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4322') {
      externalRequests.push(request.url());
    }
  });
  await page.goto('/en/regression/');
  await waitForRegression(page);
  await page.getByRole('button', { name: 'Returns' }).click();
  await page.getByRole('button', { name: 'Daily' }).click();
  await page.locator('input[type=file]').setInputFiles({
    name: 'portfolio.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('date,return\n2025-01-02,0.01'),
  });
  await page.getByRole('button', { name: 'Monthly' }).click();
  await expect(page.getByText('portfolio.csv', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Daily' }).click();
  await page.getByRole('checkbox', { name: /^HML/ }).uncheck();
  await page.goto('/en/about/');
  await page.goto('/en/regression/');
  await waitForRegression(page);
  await expect(page.getByRole('button', { name: 'Returns' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Daily' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('checkbox', { name: /^HML/ })).not.toBeChecked();
  await expect(page.getByText('portfolio.csv', { exact: true })).toHaveCount(0);
  expect(externalRequests).toEqual([]);
  const storage = await page.evaluate(async () => ({
    preferences: JSON.parse(
      localStorage.getItem('factor-lib-il:regression-preferences:v1') ?? 'null',
    ),
    session: sessionStorage.length,
    databases: (await indexedDB.databases()).length,
  }));
  expect(storage).toEqual({
    preferences: {
      version: 1,
      kind: 'returns',
      frequency: 'daily',
      selectedFactors: ['smb', 'mom'],
    },
    session: 0,
    databases: 0,
  });
});

test('all four portfolio templates download', async ({ page }) => {
  await page.goto('/en/regression/');
  const links = page.locator('.example-grid a');
  await expect(links).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    const link = links.nth(index);
    await expect(link).toHaveAttribute('download', '');
    const href = await link.getAttribute('href');
    expect(href).toMatch(/template_(daily|monthly)_(nav|returns)\.csv$/);
    const response = await page.request.get(href!);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toMatch(/^date,(nav|return)\n/);
  }
});

test('valid aligned monthly returns produce regression results', async ({ page }) => {
  const { dates, factorCsv } = monthlyRegressionFixture();
  await routeMonthlyRegressionData(page, dates, factorCsv);
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4322') {
      externalRequests.push(request.url());
    }
  });
  await page.goto('/en/regression/');
  await waitForRegression(page);
  await page.getByRole('button', { name: 'Returns' }).click();
  const marketFactor = page.getByRole('checkbox', { name: /^MKT-RF/ });
  await expect(marketFactor).toBeChecked();
  await expect(marketFactor).toBeDisabled();
  const portfolio = `date,return\n${dates
    .map((date, index) => `${date},${0.002 + 0.0003 * index + 0.0002 * Math.sin(index)}`)
    .join('\n')}`;
  await page.locator('input[type=file]').setInputFiles({
    name: 'portfolio.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(portfolio),
  });
  await page.getByRole('checkbox', { name: /^HML/ }).uncheck();
  await expect(page.getByText('portfolio.csv', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run regression' }).click();
  await expect(page.getByRole('heading', { name: 'Factor regression', exact: true })).toBeVisible();
  await expect(page.locator('.results .eyebrow')).toHaveCount(0);
  await expect(page.getByText('Model: MKT-RF + SMB + MOM', { exact: true })).toBeVisible();
  await expect(page.locator('.table-wrap tbody th')).toHaveText(['MKT-RF', 'SMB', 'MOM']);
  await expect(page.getByText('12', { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download results' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('factor_library_il_regression_results.csv');
  expect(externalRequests).toEqual([]);
});

test('Hebrew regression localizes the UI but preserves the English export contract', async ({
  page,
}) => {
  const { dates, factorCsv } = monthlyRegressionFixture();
  await routeMonthlyRegressionData(page, dates, factorCsv);
  await page.goto('/regression/');
  await waitForRegression(page);
  await page.getByRole('button', { name: /תשואות/ }).click();
  const portfolio = `date,return\n${dates
    .map((date, index) => `${date},${0.002 + 0.0003 * index + 0.0002 * Math.sin(index)}`)
    .join('\n')}`;
  await page.locator('input[type=file]').setInputFiles({
    name: 'portfolio.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(portfolio),
  });
  await page.getByRole('button', { name: 'הרצת הרגרסיה' }).click();
  await expect(
    page.locator('.results').getByRole('heading', { name: 'תוצאות הרגרסיה' }),
  ).toBeVisible();
  await expect(page.locator('.table-wrap tbody th').first()).toHaveText('MKT-RF');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'הורדת התוצאות' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('factor_library_il_regression_results.csv');
  const path = await download.path();
  const csv = await (await import('node:fs/promises')).readFile(path!, 'utf8');
  expect(csv).toMatch(
    /^term,coefficient,incremental_r_squared,hac_standard_error,hac_t_stat,hac_p_value/,
  );
  expect(csv).toContain(',monthly,returns,');
});

test('representative English and Hebrew pages have no serious accessibility violations', async ({
  page,
}) => {
  for (const route of [
    '/',
    '/methodology/',
    '/regression/',
    '/accessibility/',
    '/en/',
    '/en/methodology/',
    '/en/regression/',
    '/en/accessibility/',
  ]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((item) => ['critical', 'serious'].includes(item.impact ?? '')),
      `accessibility violations on ${route}`,
    ).toEqual([]);
  }
});

test('representative English and Hebrew pages reflow without document-level overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const route of [
    '/',
    '/methodology/',
    '/regression/',
    '/en/',
    '/en/methodology/',
    '/en/regression/',
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
      `document overflow on ${route}`,
    ).toBe(true);
  }
});
