import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Standalone config (no SvelteKit plugin): tests cover pure `.ts` logic only, so
// they need neither the Svelte compiler nor `$env`. Just the `$lib` alias.
export default defineConfig({
  resolve: {
    alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) }
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node'
  }
});
