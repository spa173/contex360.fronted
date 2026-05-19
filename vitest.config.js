import { fileURLToPath, URL } from 'node:url'
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.{test,spec}.{js,ts}'],
      setupFiles: './src/test/setup.js',
      passWithNoTests: true,
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
)
