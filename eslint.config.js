import pluginVue from 'eslint-plugin-vue'
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  // Ignorar carpetas que no deben analizarse
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.vscode/**',
      '.claude/**',
      '.windsurf/**',
      '.agents/**',
      '.gemini/**',
      '.graphify/**',
      'skills/**',
      'tests-local/**',
      '*.json'
    ]
  },

  // Reglas para archivos JS/TS
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Reglas para archivos Vue
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.vue', '**/*.js', '**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'vue/no-unused-vars': 'error',
      'vue/no-unused-components': 'warn',
      'vue/multi-word-component-names': 'off', // desactiva la regla que causó el error
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      'eqeqeq': 'error',
      'no-var': 'error',
      'prefer-const': 'warn'
    }
  }
]
