import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { onboardingApi } from '../services/onboardingApi'
import { useStateStore } from './stateStore'

export const useOnboardingStore = defineStore('onboarding', () => {
  const root = useStateStore()

  const isOnboardingCompleted = ref(false)
  const isCheckingOnboarding = ref(false)
  const currentStep = ref<'company' | 'plan' | 'summary'>('company')
  
  // Checklist tracking for recommended onboarding improvements
  const checklist = ref({
    companyData: false,     // Configuración básica de empresa
    dianSetup: false,       // Configuración DIAN (facturación electrónica)
    firstProduct: false,    // Primer producto/servicio configurado
    welcomeEmail: false,    // Email de bienvenida enviado
    planSelected: false,    // Plan seleccionado
  })

  const isOnboardingRequired = computed(() => {
    return !!root.currentUser && !isOnboardingCompleted.value
  })

  const isChecklistComplete = computed(() => {
    return Object.values(checklist.value).every(item => item === true)
  })

  async function checkOnboardingStatus() {
    if (!root.currentUser) {
      isOnboardingCompleted.value = true
      return
    }

    isCheckingOnboarding.value = true
    try {
      const status = await onboardingApi.getStatus()
      isOnboardingCompleted.value = status.completed
      
      // Also update individual checklist items based on status
      if (status.checklist) {
        checklist.value = { ...checklist.value, ...status.checklist }
      }
    } catch {
      // If the user doesn't have a membership/tenant yet, onboarding is needed
      isOnboardingCompleted.value = false
      // Reset checklist for new users
      checklist.value = {
        companyData: false,
        dianSetup: false,
        firstProduct: false,
        welcomeEmail: false,
        planSelected: false,
      }
    } finally {
      isCheckingOnboarding.value = false
    }
  }

  async function completeOnboarding(data: {
    companyName: string
    nit?: string
    address?: string
    phone?: string
    city?: string
    sector?: string
    planType?: string
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await onboardingApi.complete(data)
      if (result.success) {
        isOnboardingCompleted.value = true
        // Mark company data as complete
        checklist.value.companyData = true
        // Mark plan as selected if provided in the completion data (we'd need to enhance this)
        if (data.planType) {
          checklist.value.planSelected = true
        }
      }
      return { success: true, message: 'Onboarding completado' }
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al completar onboarding' }
    }
  }

  // Update individual checklist items
  function updateChecklistItem(item: keyof typeof checklist.value, value: boolean) {
    checklist.value = { ...checklist.value, [item]: value }
    
    // If all items are complete, mark onboarding as complete
    if (isChecklistComplete.value) {
      isOnboardingCompleted.value = true
    }
  }

  function setStep(step: 'company' | 'plan' | 'summary') {
    currentStep.value = step
  }

  return {
    isOnboardingCompleted,
    isCheckingOnboarding,
    isOnboardingRequired,
    currentStep,
    checklist,
    isChecklistComplete,
    checkOnboardingStatus,
    completeOnboarding,
    updateChecklistItem,
    setStep,
  }
})
