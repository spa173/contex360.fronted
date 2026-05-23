import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from './themeStore'

describe('Theme Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have default theme as light', () => {
    const store = useThemeStore()
    expect(store.theme).toBe('light')
  })

  it('should toggle theme from light to dark', () => {
    const store = useThemeStore()
    store.theme = 'light' // explicitly set to light
    store.toggleTheme()
    expect(store.theme).toBe('dark')
  })

  it('should toggle theme from dark to light', () => {
    const store = useThemeStore()
    store.theme = 'dark' // explicitly set to dark
    store.toggleTheme()
    expect(store.theme).toBe('light')
  })

  it('should force light mode', () => {
    const store = useThemeStore()
    store.setForceLightMode(true)
    expect(store.forceLightMode).toBe(true)
    expect(store.isLight).toBe(true)
    expect(store.isDark).toBe(false)
  })
})
