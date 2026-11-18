import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.js', '../shared/**/*.test.js'],
    testTimeout: 60000,
    hookTimeout: 120000,
  },
});
