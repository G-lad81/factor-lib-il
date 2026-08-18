export const SITE = {
  name: 'Factor Library IL',
  description: 'Open factor and risk-free return data for Israeli equities.',
  repository: 'https://github.com/G-lad81/factor-lib-il',
  maintainer: 'Gilad',
  xHandle: '@G_lad3',
  xProfile: 'https://x.com/G_lad3',
} as const;

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL;
  return `${base}${path}` || '/';
}
