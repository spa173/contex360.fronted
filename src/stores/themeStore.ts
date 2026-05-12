import { defineStore } from 'pinia'

export type ThemeMode = 'dark'

const STORAGE_KEY = 'contex360-theme'

function applyDarkTheme() {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.add('dark')
  root.classList.remove('light')
  root.dataset.theme = 'dark'
  root.style.colorScheme = 'dark'

  if (document.body) {
    document.body.dataset.theme = 'dark'
  }

  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    globalThis.localStorage.setItem(STORAGE_KEY, 'dark')
  }
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'dark' as ThemeMode,
    initialized: false,
  }),

  getters: {
    isDark: () => true,
    isLight: () => false,
    nextThemeLabel: () => 'Tema oscuro',
    nextThemeIcon: () => 'dark_mode',
  },

  actions: {
    initializeTheme() {
      this.theme = 'dark'
      this.initialized = true
      applyDarkTheme()
    },

    setTheme(_theme: ThemeMode) {
      applyDarkTheme()
    },

    toggleTheme() {
      applyDarkTheme()
    },
  },
})
