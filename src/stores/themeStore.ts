import { defineStore } from 'pinia'

export type ThemeMode = 'dark' | 'light' | 'auto'

const STORAGE_KEY = 'contex360-theme'
let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  
  // Clean up previous listeners if any
  if (mediaQueryListener && typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.removeEventListener('change', mediaQueryListener)
    mediaQueryListener = null
  }

  let resolvedMode: 'dark' | 'light' = 'dark'
  if (mode === 'auto') {
    resolvedMode = getSystemTheme()
    
    // Add real-time listener for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQueryListener = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? 'dark' : 'light'
        applyResolvedTheme(newResolved)
      }
      mediaQuery.addEventListener('change', mediaQueryListener)
    }
  } else {
    resolvedMode = mode
  }

  applyResolvedTheme(resolvedMode)

  root.dataset.theme = mode
  if (document.body) document.body.dataset.theme = mode
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    globalThis.localStorage.setItem(STORAGE_KEY, mode)
  }
}

function applyResolvedTheme(mode: 'dark' | 'light') {
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
}

function getStoredTheme(): ThemeMode {
  if (typeof globalThis === 'undefined' || !globalThis.localStorage) return 'auto'
  const stored = globalThis.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored
  return 'auto'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'auto' as ThemeMode,
    initialized: false,
  }),

  getters: {
    isDark: (state) => {
      if (state.theme === 'auto') return getSystemTheme() === 'dark'
      return state.theme === 'dark'
    },
    isLight: (state) => {
      if (state.theme === 'auto') return getSystemTheme() === 'light'
      return state.theme === 'light'
    },
    nextThemeLabel: (state) => {
      const darkActive = state.theme === 'auto' ? getSystemTheme() === 'dark' : state.theme === 'dark'
      return darkActive ? 'Tema claro' : 'Tema oscuro'
    },
    nextThemeIcon: (state) => {
      const darkActive = state.theme === 'auto' ? getSystemTheme() === 'dark' : state.theme === 'dark'
      return darkActive ? 'light_mode' : 'dark_mode'
    },
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
      const currentResolved = this.theme === 'auto' ? getSystemTheme() : this.theme
      this.setTheme(currentResolved === 'dark' ? 'light' : 'dark')
    },
  },
})
