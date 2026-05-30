import { afterEach, beforeEach, vi } from 'vitest'
import { clearToasts } from '../composables/useToasts'

if (typeof globalThis !== 'undefined' && globalThis.crypto) {
  Object.defineProperty(window, 'crypto', {
    value: globalThis.crypto,
    configurable: true,
  })
}
if (typeof globalThis !== 'undefined' && globalThis.Element) {
  const originalSetAttribute = globalThis.Element.prototype.setAttribute;
  globalThis.Element.prototype.setAttribute = function (name, value) {
    if ((name === 'src' || name === 'srcset') && typeof value === 'string' && value.startsWith('/')) {
      value = 'http://localhost' + value;
    }
    return originalSetAttribute.call(this, name, value);
  };
}

beforeEach(() => {
  globalThis.localStorage.clear()
  clearToasts()
  vi.useRealTimers()
})

afterEach(async () => {
  vi.clearAllTimers()
  vi.useRealTimers()
  clearToasts()
  globalThis.localStorage.clear()
  await vi.dynamicImportSettled()
})
