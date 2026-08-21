import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

const productionBase = process.env.PUBLIC_BASE_PATH ?? '/factor-lib-il/';
const productionSite = process.env.PUBLIC_SITE_URL ?? 'https://g-lad81.github.io';

export default defineConfig({
  site: productionSite,
  base: process.env.NODE_ENV === 'production' ? productionBase : '/',
  output: 'static',
  integrations: [preact(), sitemap()],
  server: { host: '127.0.0.1', port: 4322 },
});
