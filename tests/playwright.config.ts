import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testIgnore: 'production-base.spec.ts',
  fullyParallel: true,
  // Playwright caps CI at one worker by default; these specs are read-only against a static
  // server, so they parallelise safely.
  workers: process.env.CI ? 3 : undefined,
  webServer: {
    // Tested against the built site rather than `astro dev`: the dev server compiles each route on
    // demand, which is most of the CI runtime, and it is not what ships. PUBLIC_BASE_PATH is pinned
    // to the domain root because these specs navigate to root-relative paths; the base-path build is
    // covered separately by production-base.spec.ts.
    command: 'npm run build && npm run preview',
    cwd: '..',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { PUBLIC_BASE_PATH: '/' },
  },
  use: { baseURL: 'http://127.0.0.1:4322', trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
