/** Coverage gates apply to all domain logic and server request paths. */
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['server/**/*.ts', 'src/domain/**/*.ts'],
      exclude: ['src/domain/types.ts'],
      reporter: ['text', 'json-summary', 'html'],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
