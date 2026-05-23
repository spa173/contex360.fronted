import { describe, it, expect } from 'vitest'
import { uid, appendAuditEvent } from './storeHelpers'

describe('storeHelpers', () => {
  describe('uid()', () => {
    it('should generate a string with the provided prefix', () => {
      const id = uid('test')
      expect(id).toMatch(/^test-[a-z0-9]{7}$/)
    })

    it('should generate unique ids', () => {
      const id1 = uid('test')
      const id2 = uid('test')
      expect(id1).not.toBe(id2)
    })
  })

  describe('appendAuditEvent()', () => {
    it('should not append event if tenantId is missing', () => {
      const targetState = { auditEvents: [] }
      const payload = { entity: 'user', action: 'create', description: 'desc' }
      
      appendAuditEvent(targetState, payload)
      
      expect(targetState.auditEvents.length).toBe(0)
    })

    it('should append an event when tenantId is provided', () => {
      const targetState: { activeTenantId?: string; auditEvents: any[] } = { activeTenantId: 'tenant-123', auditEvents: [] }
      const payload = { entity: 'user', action: 'create', description: 'desc' }
      
      appendAuditEvent(targetState, payload)
      
      expect(targetState.auditEvents.length).toBe(1)
      expect(targetState.auditEvents[0]).toMatchObject({
        tenantId: 'tenant-123',
        entity: 'user',
        action: 'create',
        description: 'desc',
        actor: 'Sistema local',
        severity: 'info',
        attachmentUrl: null
      })
      expect(targetState.auditEvents[0].id).toMatch(/^aud-[a-z0-9]{7}$/)
      expect(targetState.auditEvents[0].at).toBeDefined()
    })

    it('should maintain a maximum of 500 events', () => {
      // Mock an array with 500 events
      const mockEvents: any[] = Array.from({ length: 500 }, (_, i) => ({ id: i.toString() }))
      const targetState: { activeTenantId?: string; auditEvents: any[] } = { activeTenantId: 'tenant-123', auditEvents: mockEvents }
      
      const payload = { entity: 'user', action: 'create', description: 'desc' }
      appendAuditEvent(targetState, payload)
      
      expect(targetState.auditEvents.length).toBe(500)
      // The new event is unshifted to the beginning
      expect(targetState.auditEvents[0].entity).toBe('user')
    })
  })
})
