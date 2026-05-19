
import { AppState, AuditPayload } from '@/stores/stateStore'

function randomSegment(length: number) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const crypto = globalThis.crypto
  if (crypto?.getRandomValues) {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
  }

  return alphabet.slice(0, length)
}

export function uid(prefix: string) {
  return `${prefix}-${randomSegment(7)}`
}

export function appendAuditEvent(targetState: any, payload: any) {
  const tenantId = payload.tenantId || targetState.activeTenantId

  if (!tenantId) {
    return
  }

  targetState.auditEvents.unshift({
    id: uid('aud'),
    tenantId,
    entity: payload.entity,
    action: payload.action,
    description: payload.description,
    at: new Date().toISOString(),
    actor: payload.actor || 'Sistema local',
    severity: payload.severity || 'info',
    attachmentUrl: payload.attachmentUrl || null,
  })

  if (targetState.auditEvents.length > 500) {
    targetState.auditEvents.pop()
  }
}
