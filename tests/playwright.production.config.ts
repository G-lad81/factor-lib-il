import { defineConfig, devices } from '@playwright/test';
import { testServerUrl } from '../scripts/site-target';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'production-base.spec.ts',
  webServer: {
    command: 'tsx scripts/serve-production-test.ts',
    cwd: '..',
    url: testServerUrl,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: testServerUrl,
    trace: 'on-first-retry',
  },
});
