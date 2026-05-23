import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getApiBaseUrl } from './apiBase'

describe('apiBase', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should return normalized api base url', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/')
    expect(getApiBaseUrl()).toBe('https://api.example.com')
  })

  it('should throw error if VITE_API_BASE_URL is not set', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(() => getApiBaseUrl()).toThrow('VITE_API_BASE_URL environment variable is required')
  })
})
