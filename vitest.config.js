import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
    setupFiles: './src/test/setup.js',
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'src/test/**',
        '**/*.test.js',
        '**/*.test.ts',
        'eslint.config.js',
        'vitest.config.js',
        'vite.config.js',
        'postcss.config.js',
        'tailwind.config.js',
      ],
    },
  },
})
