import { defineStore } from 'pinia'

export type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'contex360-theme'

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
  root.dataset.theme = mode
  if (document.body) document.body.dataset.theme = mode
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    globalThis.localStorage.setItem(STORAGE_KEY, mode)
  }
}

function getStoredTheme(): ThemeMode {
  if (typeof globalThis === 'undefined' || !globalThis.localStorage) return 'dark'
  const stored = globalThis.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return globalThis.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light' as ThemeMode,
    initialized: false,
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
    isLight: (state) => state.theme === 'light',
    nextThemeLabel: (state) => state.theme === 'dark' ? 'Tema claro' : 'Tema oscuro',
    nextThemeIcon: (state) => state.theme === 'dark' ? 'light_mode' : 'dark_mode',
  },

  actions: {
    initializeTheme() {
      this.theme = getStoredTheme()
      this.initialized = true
      applyTheme(this.theme)
    },

    setTheme(mode: ThemeMode) {
      this.theme = mode
      applyTheme(mode)
    },

    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark')
    },
  },
})
