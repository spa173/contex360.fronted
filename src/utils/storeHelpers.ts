
import { AppState, AuditPayload } from '@/stores/stateStore'

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
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
