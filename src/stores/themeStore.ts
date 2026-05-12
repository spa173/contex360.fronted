import { defineStore } from 'pinia'

export type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'contex360-theme'

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'dark' || value === 'light'
}

function readStoredTheme(): ThemeMode | null {
  if (typeof globalThis === 'undefined' || !globalThis.localStorage) {
    return null
  }

  const stored = globalThis.localStorage.getItem(STORAGE_KEY)
  return isThemeMode(stored) ? stored : null
}

function resolveInitialTheme(): ThemeMode {
  return readStoredTheme() || 'dark'
}

function syncDocumentTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  root.dataset.theme = theme
  root.style.colorScheme = theme

  if (document.body) {
    document.body.dataset.theme = theme
  }
}

function persistTheme(theme: ThemeMode) {
  if (typeof globalThis === 'undefined' || !globalThis.localStorage) {
    return
  }

  globalThis.localStorage.setItem(STORAGE_KEY, theme)
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: resolveInitialTheme(),
    initialized: false,
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
    isLight: (state) => state.theme === 'light',
    nextThemeLabel: (state) => (state.theme === 'dark' ? 'Tema claro' : 'Tema oscuro'),
    nextThemeIcon: (state) => (state.theme === 'dark' ? 'light_mode' : 'dark_mode'),
  },

  actions: {
    initializeTheme() {
      if (!this.initialized) {
        this.theme = resolveInitialTheme()
        this.initialized = true
      }

      syncDocumentTheme(this.theme)
      persistTheme(this.theme)
    },

    setTheme(theme: ThemeMode) {
      this.theme = theme
      this.initialized = true
      syncDocumentTheme(theme)
      persistTheme(theme)
    },

    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark')
    },
  },
})
