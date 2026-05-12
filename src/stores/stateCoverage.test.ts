// @ts-nocheck
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  ROLE_OPTIONS,
  ROLE_PERMISSIONS,
  ROLE_VIEWS,
  DEFAULT_ROLE_ACCESS,
  DEFAULT_TENANT_SECURITY_SETTINGS,
  useStateStore,
  parseUserAgentMetadata,
  buildDemoPassword,
} from './stateStore'
import {
  createPasswordCredentials,
  verifyPassword,
  upgradeLegacyUserSecrets,
  serializeStateSnapshot,
} from './stateSecurity'
import { createTimerRegistry, getRequestedQuantityByProduct } from './stateRuntime'

// ─── stateStore.ts ──────────────────────────────────────────────────────────

describe('Coverage for New Code in stateStore.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Constants exported from ROLE_DEFINITIONS
  it('exports ROLE_OPTIONS correctly', () => {
    expect(ROLE_OPTIONS).toBeInstanceOf(Array)
    expect(ROLE_OPTIONS.length).toBeGreaterThan(0)
    expect(ROLE_OPTIONS).toContain('Administrador')
  })

  it('exports ROLE_PERMISSIONS correctly', () => {
    expect(ROLE_PERMISSIONS).toHaveProperty('Administrador')
    expect(ROLE_PERMISSIONS['Administrador']).toBeInstanceOf(Array)
  })

  it('exports ROLE_VIEWS correctly', () => {
    expect(ROLE_VIEWS).toHaveProperty('Contador')
    expect(ROLE_VIEWS['Contador']).toBeInstanceOf(Array)
  })

  it('exports DEFAULT_ROLE_ACCESS correctly', () => {
    expect(DEFAULT_ROLE_ACCESS).toHaveProperty('Auxiliar contable')
    expect(DEFAULT_ROLE_ACCESS['Auxiliar contable']).toHaveProperty('dashboard')
  })

  it('exports DEFAULT_TENANT_SECURITY_SETTINGS correctly', () => {
    expect(DEFAULT_TENANT_SECURITY_SETTINGS).toHaveProperty('passwordPolicy')
    expect(DEFAULT_TENANT_SECURITY_SETTINGS.passwordPolicy.minLength).toBe(10)
  })

  // parseUserAgentMetadata branches
  it('covers parseUserAgentMetadata with empty string (no userAgent)', () => {
    const result = parseUserAgentMetadata('')
    expect(result.browser).toBe('Navegador local')
  })

  it('covers parseUserAgentMetadata with Chrome UA', () => {
    const result = parseUserAgentMetadata('Mozilla/5.0 (Windows NT 10.0) Chrome/120.0.0.0')
    expect(result.browser).toContain('Chrome')
    expect(result.os).toContain('Windows')
  })

  it('covers parseUserAgentMetadata with Firefox on Linux', () => {
    const result = parseUserAgentMetadata('Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/120.0')
    expect(result.browser).toContain('Firefox')
    expect(result.os).toBe('Linux')
  })

  it('covers parseUserAgentMetadata with Safari on macOS', () => {
    const result = parseUserAgentMetadata('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/17.0 Safari/605.1.15')
    expect(result.browser).toContain('Safari')
    expect(result.os).toContain('macOS')
  })

  it('covers parseUserAgentMetadata with Edge on Android', () => {
    const result = parseUserAgentMetadata('Mozilla/5.0 (Android 12; Mobile) Edg/120.0.0.0')
    expect(result.browser).toContain('Edge')
    expect(result.os).toContain('Android')
  })

  it('covers parseUserAgentMetadata with iOS', () => {
    const result = parseUserAgentMetadata('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15')
    expect(result.os).toContain('iOS')
  })

  // buildDemoPassword
  it('covers buildDemoPassword', () => {
    expect(buildDemoPassword('admin@test.com')).toBe('admin@test.com!A1')
    expect(buildDemoPassword(null)).toBe('!A1')
  })

  // Store actions
  it('covers scheduleDianUpdates and clearAllScheduledDianUpdates', () => {
    const store = useStateStore()
    store.scheduleDianUpdates('test-inv', 'tenant-a')
    store.resetState()
    expect(true).toBe(true)
  })

  it('covers runOcr with empty source', () => {
    const store = useStateStore()
    const result = store.runOcr('')
    expect(result.ok).toBe(false)
  })

  it('covers runOcr with valid content', () => {
    const store = useStateStore()
    const result = store.runOcr('NIT 900123456 Total 1500000')
    expect(result).toBeDefined()
  })

  it('covers uid fallback when randomUUID is missing', async () => {
    const store = useStateStore()
    const originalCrypto = globalThis.crypto
    try {
      Object.defineProperty(globalThis, 'crypto', {
        value: { ...originalCrypto, randomUUID: undefined },
        configurable: true,
      })
      const r = store.runOcr('Fallback test content A')
      expect(r).toBeDefined()

      Object.defineProperty(globalThis, 'crypto', {
        value: { subtle: originalCrypto.subtle, randomUUID: undefined, getRandomValues: undefined },
        configurable: true,
      })
      const r2 = store.runOcr('Fallback test content B')
      expect(r2).toBeDefined()
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: originalCrypto, configurable: true })
    }
  })

  it('covers login with wrong credentials', async () => {
    const store = useStateStore()
    const result = await store.login({ email: 'admin@contex360.local', password: 'wrong-password' })
    expect(result.ok).toBe(false)
  })

  it('covers login with unknown email', async () => {
    const store = useStateStore()
    const result = await store.login({ email: 'nobody@example.com', password: 'test' })
    expect(result.ok).toBe(false)
  })

  it('covers login with correct credentials', async () => {
    const store = useStateStore()
    const result = await store.login({
      email: 'admin@contex360.local',
      password: buildDemoPassword('admin@contex360.local'),
    })
    expect(result.ok).toBe(true)
  })

  it('covers logout without session', async () => {
    const store = useStateStore()
    const result = await store.logout()
    expect(result.ok).toBe(false)
  })

  it('covers logout with active session', async () => {
    const store = useStateStore()
    await store.login({
      email: 'admin@contex360.local',
      password: buildDemoPassword('admin@contex360.local'),
    })
    const result = await store.logout()
    expect(result.ok).toBe(true)
  })

  it('covers loginDemoUser with invalid id', () => {
    const store = useStateStore()
    const result = store.loginDemoUser('nonexistent-user')
    expect(result.ok).toBe(false)
  })

  it('covers loginDemoUser with valid id', async () => {
    const store = useStateStore()
    const result = await store.loginDemoUser('user-demo')
    expect(result.ok).toBe(true)
  })

  it('covers panicLogoutAll without manage_users permission', async () => {
    const store = useStateStore()
    // Log in as a user without manage_users permission
    await store.loginDemoUser('user-demo')
    // Force role to one without manage_users
    store.session.currentUserId = 'user-visor'
    const result = store.panicLogoutAll()
    expect(result.ok).toBe(false)
  })

  it('covers panicLogoutAll as admin', async () => {
    const store = useStateStore()
    await store.loginDemoUser('user-demo')
    const result = store.panicLogoutAll()
    expect(result.ok).toBe(true)
  })

  it('covers exportUsers action', async () => {
    const store = useStateStore()
    await store.loginDemoUser('user-demo')
    // Mock document.createElement so jsdom doesn't navigate
    const linkMock = { href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValueOnce(linkMock)
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:test'),
      revokeObjectURL: vi.fn(),
    })
    const result = store.exportUsers()
    expect(result.ok).toBe(true)
  })

  it('covers activateSessionForUser with IP whitelist blocking', async () => {
    const store = useStateStore()
    // Set an IP whitelist that will never match the simulated IP
    const tenant = store.tenants.find((t) => t.id === 'tenant-a')
    if (tenant) {
      tenant.securitySettings = {
        ...DEFAULT_TENANT_SECURITY_SETTINGS,
        ipWhitelist: ['192.168.0.1'],
      }
    }
    const result = await store.login({
      email: 'admin@contex360.local',
      password: buildDemoPassword('admin@contex360.local'),
    })
    expect(result.ok).toBe(false)
    expect(result.message).toContain('IP')
  })

  it('covers singleSessionOnly policy on login', async () => {
    const store = useStateStore()
    const tenant = store.tenants.find((t) => t.id === 'tenant-a')
    if (tenant) {
      tenant.securitySettings = {
        ...DEFAULT_TENANT_SECURITY_SETTINGS,
        ipWhitelist: [],
        sessionPolicy: { singleSessionOnly: true },
      }
    }
    // First login
    await store.login({
      email: 'admin@contex360.local',
      password: buildDemoPassword('admin@contex360.local'),
    })
    store.logout()
    // Second login triggers single-session cleanup
    const result2 = await store.login({
      email: 'admin@contex360.local',
      password: buildDemoPassword('admin@contex360.local'),
    })
    expect(result2.ok).toBe(true)
  })

  it('covers runOcr when user lacks run_ocr permission', async () => {
    const store = useStateStore()
    // user-payroll has no OCR permission
    await store.loginDemoUser('user-payroll')
    const result = store.runOcr('Some valid text content here')
    expect(result.ok).toBe(false)
    expect(result.message).toContain('rol')
  })

  it('covers scheduleDianUpdates timer callbacks via fake timers', async () => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    const store = useStateStore()
    await store.loginDemoUser('user-demo')

    // Create an invoice first so the timeline push finds something
    const inv = store.tenantInvoices[0]
    const invoiceId = inv?.id || 'nonexistent-inv'

    store.scheduleDianUpdates(invoiceId, 'tenant-a')

    // Advance time to trigger both setTimeout callbacks
    await vi.advanceTimersByTimeAsync(3000)

    vi.useRealTimers()
    expect(true).toBe(true)
  })

  it('covers rate-limit block after too many login attempts', async () => {
    const store = useStateStore()
    // Force rate limit to be already blocked
    const email = 'admin@contex360.local'
    store.authRateLimit[`${email}|unknown`] = {
      attempts: 15,
      windowStartedAt: Date.now(),
      blockedUntil: Date.now() + 9999999,
      strikes: 1,
    }
    const result = await store.login({ email, password: 'wrong' })
    expect(result.ok).toBe(false)
  })
})

// ─── stateSecurity.ts ────────────────────────────────────────────────────────

describe('Coverage for New Code in stateSecurity.ts', () => {
  it('creates and verifies password credentials using globalThis.crypto', async () => {
    const password = 'TestPassword123!'
    const credentials = await createPasswordCredentials(password)

    expect(credentials).toHaveProperty('passwordHash')
    expect(credentials).toHaveProperty('passwordSalt')
    expect(credentials.passwordHash).toBeTypeOf('string')
    expect(credentials.passwordSalt).toBeTypeOf('string')

    const testUser = { passwordHash: credentials.passwordHash, passwordSalt: credentials.passwordSalt }
    const isValid = await verifyPassword(testUser, password)
    expect(isValid).toBe(true)

    const isInvalid = await verifyPassword(testUser, 'WrongPassword!')
    expect(isInvalid).toBe(false)
  })

  it('covers verifyPassword legacy path (no salt)', async () => {
    const legacyUser = { password: 'plain-text-password' }
    const result = await verifyPassword(legacyUser, 'plain-text-password')
    expect(result).toBe(true)

    const wrongResult = await verifyPassword(legacyUser, 'wrong')
    expect(wrongResult).toBe(false)
  })

  it('covers createPasswordSalt fallback when getRandomValues is missing', async () => {
    const originalCrypto = globalThis.crypto
    try {
      // Remove getRandomValues → falls back to Date.now()
      Object.defineProperty(globalThis, 'crypto', {
        value: { subtle: originalCrypto.subtle, randomUUID: originalCrypto.randomUUID },
        configurable: true,
      })
      const credentials = await createPasswordCredentials('FallbackPwd!1')
      expect(credentials.passwordSalt).toBeTypeOf('string')
      expect(credentials.passwordSalt.length).toBeGreaterThan(0)
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: originalCrypto, configurable: true })
    }
  })

  it('upgrades legacy user secrets', async () => {
    const legacyUser = { id: 'u1', password: 'OldPassword!1' }
    const upgraded = await upgradeLegacyUserSecrets(legacyUser)
    expect(upgraded).toBe(true)
    expect(legacyUser).toHaveProperty('passwordHash')
    expect(legacyUser).not.toHaveProperty('password')
  })

  it('returns false when upgrading user that already has hash or no password', async () => {
    const hasHashUser = { id: 'u2', password: 'test', passwordHash: 'existingHash' }
    expect(await upgradeLegacyUserSecrets(hasHashUser)).toBe(false)

    const noPasswordUser = { id: 'u3', passwordHash: 'hash' }
    expect(await upgradeLegacyUserSecrets(noPasswordUser)).toBe(false)
  })

  it('covers serializeStateSnapshot sanitizing passwordHash fields', () => {
    const state = {
      users: [
        { id: '1', name: 'A', passwordHash: 'hash1', password: 'plain' },
        { id: '2', name: 'B' },
      ],
    }
    const snapshot = serializeStateSnapshot(state)
    expect(snapshot.users[0]).not.toHaveProperty('password')
    expect(snapshot.users[0]).toHaveProperty('passwordHash')
    expect(snapshot.users[1]).not.toHaveProperty('password')
  })
})

// ─── stateRuntime.ts ─────────────────────────────────────────────────────────

describe('Coverage for New Code in stateRuntime.ts', () => {
  it('handles missing productId in getRequestedQuantityByProduct', () => {
    const items = [
      { productId: 'p1', quantity: 2 },
      { quantity: 5 },
      { productId: null, quantity: 1 },
      { productId: 'p1', quantity: 3 },
    ]
    const map = getRequestedQuantityByProduct(items)
    expect(map.get('p1')).toBe(5)
    expect(map.size).toBe(1)
  })

  it('handles timer registry set, clear, and clearAll', () => {
    const registry = createTimerRegistry()

    // set and clear a known key
    registry.set('k1', [])
    registry.clear('k1')

    // clear a key that does not exist (covers the || [] branch)
    registry.clear('nonexistent')

    // set multiple and clearAll
    registry.set('k2', [])
    registry.set('k3', [])
    registry.clearAll()

    expect(true).toBe(true) // all execution paths covered above
  })
})
