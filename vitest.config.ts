import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Test runner.
 *
 * Node environment rather than jsdom: what is covered here is server-side - the
 * OAuth helpers, the Vercel client, route handlers - and none of it touches the
 * DOM.
 *
 * The `@/*` alias is declared here rather than read from tsconfig by a plugin.
 * There is exactly one mapping to keep in step, and the plugin that does it
 * automatically is ESM-only, which this CommonJS config cannot require.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
});
