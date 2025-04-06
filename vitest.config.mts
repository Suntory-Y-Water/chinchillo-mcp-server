/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      // biome-ignore lint/style/useTemplate: <explanation>
      '@': __dirname + '/src',
    },
  },
});
