import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'python -m uvicorn main:app --port 8000',
      url: 'http://localhost:8000/docs',
      cwd: '..',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        MONGO_DB: 'projekt_e2e',
      },
    },
    {
      command: 'npm start',
      url: 'http://localhost:3000',
      cwd: '../front',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        BROWSER: 'none',
      },
    },
  ],
});
