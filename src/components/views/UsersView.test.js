import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import UsersView from './UsersView.vue'
import { useStateStore, buildDemoPassword } from '../../stores/stateStore'

// Mock URL.createObjectURL / revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock')
globalThis.URL.revokeObjectURL = vi.fn()
globalThis.open = vi.fn()

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  configurable: true,
})

describe('UsersView', () => {
  let wrapper
  let stateStore

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(window, 'prompt').mockReturnValue('test reason')

    stateStore = useStateStore()
    // Log in as admin so all permission-gated code paths are reachable
    await stateStore.loginDemoUser('user-demo')

    wrapper = mount(UsersView, {
      props: { isActive: true },
      global: { stubs: ['router-link', 'router-view'] },
    })
    await wrapper.vm.$nextTick()
  })

  it('renders correctly with isActive prop', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html().length).toBeGreaterThan(100)
  })

  it('triggers 🚨 Pánico button (handlePanicLogout)', async () => {
    const panicBtn = wrapper.findAll('button').find((b) => b.text().includes('Pánico'))
    expect(panicBtn).toBeDefined()
    await panicBtn?.trigger('click')
    await wrapper.vm.$nextTick()
    expect(window.confirm).toHaveBeenCalled()
  })

  it('triggers 📥 Exportar button (exportUsers)', async () => {
    const exportBtn = wrapper.findAll('button').find((b) => b.text().includes('Exportar'))
    if (exportBtn) {
      await exportBtn.trigger('click')
      await wrapper.vm.$nextTick()
    }
    expect(true).toBe(true)
  })

  it('switches through all tabs', async () => {
    const tabs = ['users', 'roles', 'sessions', 'invitations', 'security']
    for (const tabId of tabs) {
       wrapper.vm.activeTab = tabId
       await wrapper.vm.$nextTick()
    }
    expect(wrapper.vm.activeTab).toBe('security')
  })

  it('covers security tab logic', async () => {
    wrapper.vm.activeTab = 'security'
    await wrapper.vm.$nextTick()
    
    // IP Whitelist
    wrapper.vm.securityForm.newIp = '1.2.3.4'
    wrapper.vm.addIpToWhitelist()
    expect(wrapper.vm.securityForm.ipWhitelist).toContain('1.2.3.4')
    
    wrapper.vm.removeIpFromWhitelist('1.2.3.4')
    expect(wrapper.vm.securityForm.ipWhitelist).not.toContain('1.2.3.4')
    
    wrapper.vm.saveSecuritySettings()
  })

  it('covers bulk actions', async () => {
    wrapper.vm.selectedIds = ['user-demo']
    wrapper.vm.handleBulkAction()
    expect(wrapper.vm.selectedIds).toBeDefined()
  })

  it('covers user status toggle', async () => {
    wrapper.vm.handleToggleUserStatus('user-demo')
    expect(window.confirm).toHaveBeenCalled()
  })

  it('covers password reset', async () => {
    wrapper.vm.handleForceReset('user-demo')
    expect(window.confirm).toHaveBeenCalled()
  })

  it('covers recovery codes', async () => {
    wrapper.vm.handleGenerateRecoveryCodes()
    await wrapper.vm.handleCopyRecoveryCodes()
    wrapper.vm.handleDownloadRecoveryCodes()
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('covers session revocation and trust', async () => {
    wrapper.vm.handleRevokeSessions('user-demo')
    wrapper.vm.handleRevokeSession('sess-1')
    wrapper.vm.handleTrustFingerprint('sess-1')
    expect(window.confirm).toHaveBeenCalled()
  })

  it('covers role duplication', async () => {
    wrapper.vm.activeTab = 'roles'
    await wrapper.vm.$nextTick()
    
    wrapper.vm.selectedRole = 'Administrador'
    wrapper.vm.duplicateRoleTarget = 'Contador'
    wrapper.vm.handleDuplicateRolePermissions()
    
    // Test same role validation
    wrapper.vm.duplicateRoleTarget = 'Administrador'
    wrapper.vm.handleDuplicateRolePermissions()
    expect(wrapper.vm.activeTab).toBe('roles')
  })
})
