import nextEnv from '@next/env';
import { defineConfig } from '@playwright/test';

nextEnv.loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:3001',
    storageState: '.playwright/phase4i-auth.json',
    trace: 'retain-on-failure',
  },
  globalSetup: './tests/e2e/phase4i.setup.ts',
  globalTeardown: './tests/e2e/phase4i.teardown.ts',
  webServer: {
    command: 'bun run dev -- -p 3001',
    url: 'http://127.0.0.1:3001/login',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
