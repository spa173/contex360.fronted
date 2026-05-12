import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.removeItem('contex360-theme')
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to dark theme and syncs the document', () => {
    const store = useThemeStore()

    store.initializeTheme()

    expect(store.theme).toBe('dark')
    expect(store.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('contex360-theme')).toBe('dark')
  })

  it('toggles to light theme and persists the selection', () => {
    const store = useThemeStore()

    store.initializeTheme()
    store.toggleTheme()

    expect(store.theme).toBe('light')
    expect(store.isLight).toBe(true)
    expect(store.nextThemeLabel).toBe('Tema oscuro')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(localStorage.getItem('contex360-theme')).toBe('light')
  })
})
