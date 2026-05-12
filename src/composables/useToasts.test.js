import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useToasts, clearToasts } from './useToasts'

describe('Coverage for useToasts.js', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearToasts()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('pushes a toast with a generated id and clears it after timeout', () => {
    const { toasts, pushToast } = useToasts()
    
    expect(toasts.value.length).toBe(0)
    
    pushToast('Test Message', 'Test Detail')
    
    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].message).toBe('Test Message')
    expect(toasts.value[0].detail).toBe('Test Detail')
    expect(toasts.value[0].id).toBeTypeOf('string')

    // Fast-forward time to trigger globalThis.setTimeout
    vi.advanceTimersByTime(3700)
    
    expect(toasts.value.length).toBe(0)
  })

  it('does not push if message is empty', () => {
    const { toasts, pushToast } = useToasts()
    pushToast('')
    expect(toasts.value.length).toBe(0)
  })
})
