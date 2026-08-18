import { expect, test } from '@playwright/test';
import { basePrefix, publicUrl } from '../../scripts/site-target';

test('production build serves routes and assets below the repository base path', async ({
  page,
}) => {
  const failed: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Factor Library IL' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await page.getByRole('navigation').getByRole('link', { name: 'מתודולוגיה', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${basePrefix}/methodology/$`));
  await expect(page.getByRole('heading', { name: 'מתודולוגיה', exact: true })).toBeVisible();

  const manifest = await page.request.get('./data/manifest.json');
  expect(manifest.ok()).toBe(true);
  const metadata = await manifest.json();
  expect(metadata).toMatchObject({
    schema_version: 1,
    data_license: 'CC-BY-NC-4.0',
  });
  expect(['pending', 'ready']).toContain(metadata.status);
  expect(failed).toEqual([]);
});

test('production data files are directly accessible without the website UI', async ({ page }) => {
  const manifestResponse = await page.request.get('./data/manifest.json');
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();

  if (manifest.status === 'pending') {
    expect(manifest.daily).toBeNull();
    expect(manifest.monthly).toBeNull();
    return;
  }

  const daily = await page.request.get(`./${manifest.daily.path}`);
  const monthly = await page.request.get(`./${manifest.monthly.path}`);
  const statistics = await page.request.get('./data/stats.json');
  expect(daily.ok()).toBe(true);
  expect(monthly.ok()).toBe(true);
  expect(statistics.ok()).toBe(true);

  const expectedHeader = ['date', ...manifest.factors].join(',');
  expect((await daily.text()).split(/\r?\n/, 1)[0]).toBe(expectedHeader);
  expect((await monthly.text()).split(/\r?\n/, 1)[0]).toBe(expectedHeader);
  expect(await statistics.json()).toMatchObject({ data_version: manifest.data_version });
});

test('production metadata uses the repository base path', async ({ page }) => {
  await page.goto('./about/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', publicUrl('/about/'));
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    `${basePrefix}/favicon.svg`,
  );
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
    'content',
    /connect-src 'self'.*object-src 'none'/,
  );
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute(
    'content',
    'strict-origin-when-cross-origin',
  );
});

test('production build serves English routes below the repository base path', async ({ page }) => {
  await page.goto('./en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await page.getByRole('navigation').getByRole('link', { name: 'Methodology' }).click();
  await expect(page).toHaveURL(new RegExp(`${basePrefix}/en/methodology/$`));
  await expect(page.locator('link[rel="alternate"][hreflang="he"]')).toHaveAttribute(
    'href',
    publicUrl('/methodology/'),
  );
});
