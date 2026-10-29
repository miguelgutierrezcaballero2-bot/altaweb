import { defineConfig } from '@playwright/test';

/**
 * Playwright E2E — production build on the dedicated E2E port (3100).
 *
 * - webServer builds and starts `next start` so tests exercise the real
 *   production bundle (prod 404/redirect semantics, single-process seeding).
 * - `channel: 'msedge'` targets the system-installed Edge: npm policy blocks
 *   browser-download scripts, so no `pnpm exec playwright install` step.
 * - Port 3100 keeps the everyday dev/server port 3000 semantics untouched.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    channel: 'msedge',
    baseURL: 'http://127.0.0.1:3100',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command:
      'npm run build && npm run start -- --port 3100 --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
