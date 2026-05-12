import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ThirdPartiesView from './ThirdPartiesView.vue'
import { useThirdPartiesStore } from '../../stores/thirdPartiesStore'

vi.mock('../../stores/thirdPartiesStore')

describe('ThirdPartiesView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly and submits form', async () => {
    const mockStore = {
      tenantThirdParties: [],
      canManageThirdParties: true,
      createThirdParty: vi.fn().mockReturnValue({ ok: true, message: 'Saved' }),
      activeTenantId: 't1'
    }
    vi.mocked(useThirdPartiesStore).mockReturnValue(mockStore as any)
    
    const wrapper = mount(ThirdPartiesView, {
      props: { isActive: true },
    })

    expect(wrapper.find('h3').text()).toBe('Registrar tercero')
    
    // Fill form
    await wrapper.find('input[placeholder="Cliente Demo SAS"]').setValue('Test Client')
    await wrapper.find('input[placeholder="900123456-7"]').setValue('123456789-0')
    await wrapper.find('input[placeholder="contacto@empresa.co"]').setValue('test@test.com')
    await wrapper.find('input[placeholder="Responsable de IVA"]').setValue('Regimen Simple')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(mockStore.createThirdParty).toHaveBeenCalled()
    expect(wrapper.emitted().notify).toBeTruthy()
  })

  it('shows empty state when no parties', () => {
    vi.mocked(useThirdPartiesStore).mockReturnValue({
      tenantThirdParties: [],
      canManageThirdParties: true,
      createThirdParty: vi.fn(),
      activeTenantId: 't1'
    } as any)
    
    const wrapper = mount(ThirdPartiesView, {
      props: { isActive: true },
    })
    
    expect(wrapper.text()).toContain('No hay terceros configurados')
  })
})
