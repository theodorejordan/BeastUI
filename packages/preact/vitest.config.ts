// Unit tests run in a real Chromium through Playwright (Vitest browser mode), not in a simulated
// DOM: focus, keyboard activation and form submission behave exactly as in an app.
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.tsx'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
