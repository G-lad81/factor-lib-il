/** Build and test target URLs, from the same env vars `astro.config.ts` uses. */
export const siteUrl = (process.env.PUBLIC_SITE_URL ?? 'https://g-lad81.github.io').replace(
  /\/$/,
  '',
);

/** Always leading- and trailing-slashed: `/factor-lib-il/`, or `/` at a domain root. */
export const basePath = (() => {
  const raw = process.env.PUBLIC_BASE_PATH ?? '/factor-lib-il/';
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
})();

/** No trailing slash, so it can be concatenated with a rooted pathname. */
export const basePrefix = basePath === '/' ? '' : basePath.slice(0, -1);

/** Absolute public URL for a rooted path: `publicUrl('/about/')`. */
export const publicUrl = (pathname: string): string =>
  `${siteUrl}${basePrefix}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

export const testServerHost = '127.0.0.1';
export const testServerPort = Number(process.env.PRODUCTION_TEST_PORT ?? 4323);
export const testServerUrl = `http://${testServerHost}:${testServerPort}${basePath}`;
