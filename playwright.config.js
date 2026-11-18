import { defineConfig, devices } from '@playwright/test';

// Dedicated ports for the test run, so stray dev servers on the defaults cannot leak into it.
const PORT = 5273;
const API_PORT = 4200;

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile-390', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: [
    {
      command: 'npm run dev -w api',
      url: `http://localhost:${API_PORT}/api/v1/health`,
      reuseExistingServer: false,
      timeout: 180_000,
      env: { NODE_ENV: 'development', PORT: String(API_PORT) },
    },
    {
      command: 'npm run dev -w web',
      url: `http://localhost:${PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { WEB_PORT: String(PORT), API_ORIGIN: `http://localhost:${API_PORT}` },
    },
  ],
});
