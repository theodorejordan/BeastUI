// Browser checks on the built docs (decision 0009, "browser"): axe and keyboard. Run after
// `pnpm --filter docs build`. Screenshots (visual regression) come later, in Docker.
import { defineConfig, devices } from '@playwright/test';

const port = 4330;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // --ignore-lock: a one-off server for the tests. It also stops Astro from moving the server
    // to the background when it detects an AI agent, which Playwright would read as an exit.
    command: `astro preview --port ${port} --ignore-lock`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
  },
});
