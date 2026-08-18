export const LOCALES = ['he', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'he';

export const PAGE_PATHS = {
  home: '/',
  methodology: '/methodology/',
  regression: '/regression/',
  changelog: '/changelog/',
  about: '/about/',
  accessibility: '/accessibility/',
} as const;

export type PageKey = keyof typeof PAGE_PATHS;

export function direction(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'he' ? 'rtl' : 'ltr';
}

export function localePath(locale: Locale, page: PageKey): string {
  const path = PAGE_PATHS[page];
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? '/en/' : `/en${path}`;
}

export function pageFromPath(pathname: string, base = '/'): PageKey | undefined {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  let path = pathname.startsWith(normalizedBase)
    ? `/${pathname.slice(normalizedBase.length)}`
    : pathname;
  if (path === '/en') path = '/en/';
  if (path.startsWith('/en/')) path = `/${path.slice(4)}`;
  if (!path.endsWith('/')) path = `${path}/`;
  return (Object.entries(PAGE_PATHS) as Array<[PageKey, string]>).find(
    ([, candidate]) => candidate === path,
  )?.[0];
}
