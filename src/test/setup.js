import { afterEach, beforeEach, vi } from 'vitest'
import { clearToasts } from '../composables/useToasts'

if (typeof globalThis !== 'undefined' && globalThis.crypto) {
  Object.defineProperty(window, 'crypto', {
    value: globalThis.crypto,
    configurable: true,
  })
}

beforeEach(() => {
  globalThis.localStorage.clear()
  clearToasts()
  vi.useRealTimers()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  clearToasts()
  globalThis.localStorage.clear()
})
