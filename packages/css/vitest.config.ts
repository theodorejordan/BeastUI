// The contrast test runs in a real Chromium (Vitest browser mode): colours are resolved by the
// browser, light-dark() and color-mix() included, exactly as on screen.
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
