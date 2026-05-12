import { describe, expect, it, beforeEach, vi } from 'vitest'
import { businessApi } from './businessApi'

// Mock global fetch using Vitest's recommended way
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('businessApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('getInvoices calls the correct endpoint', async () => {
    localStorage.setItem('contex360-auth-token', 'mock-token')
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: '1', number: 'INV-001' }])
    })

    const result = await businessApi.getInvoices()
    expect(result).toHaveLength(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/invoices'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'authorization': 'Bearer mock-token'
        })
      })
    )
  })

  it('handles error response', async () => {
    localStorage.setItem('contex360-auth-token', 'token')
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad Request' })
    })

    await expect(businessApi.getInvoices()).rejects.toThrow('Bad Request')
  })

  it('getComplianceDashboard calls the correct endpoint', async () => {
    localStorage.setItem('contex360-auth-token', 'mock-token')
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ complianceChecks: [] })
    })

    const result = await businessApi.getComplianceDashboard()
    expect(result).toEqual({ complianceChecks: [] })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/compliance'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'authorization': 'Bearer mock-token'
        })
      })
    )
  })

  it('runAccessReview posts to the correct endpoint', async () => {
    localStorage.setItem('contex360-auth-token', 'mock-token')
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ accessReview: { totals: { totalUsers: 1 } } })
    })

    const result = await businessApi.runAccessReview()
    expect(result).toEqual({ accessReview: { totals: { totalUsers: 1 } } })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/compliance/access-review'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'authorization': 'Bearer mock-token'
        })
      })
    )
  })
})
