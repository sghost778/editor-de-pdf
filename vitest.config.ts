import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '.',
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  test: {
    include: ['tests/**/*.spec.{ts,tsx}'],
  },
});
