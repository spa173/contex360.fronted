<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { businessApi } from '../../services/businessApi'
import { useStateStore } from '../../stores/stateStore'
// @ts-expect-error JS file without types
import { useToasts } from '../../composables/useToasts'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Configura tu empresa',
  meta: [
    { name: 'description', content: 'Completa la configuración inicial de tu empresa en Contex360.' },
  ],
})

defineProps({ isActive: Boolean })

const store = useOnboardingStore()
const state = useStateStore()
const { pushToast } = useToasts()

const sectors = [
  { value: 'comercio', label: 'Comercio' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'industria', label: 'Industria' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'salud', label: 'Salud' },
  { value: 'educacion', label: 'Educación' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'otro', label: 'Otro' },
]

const form = ref({
  companyName: '',
  nit: '',
  address: '',
  phone: '',
  city: '',
  sector: '',
})

const selectedPlan = ref<'starter' | 'pyme' | 'enterprise'>('pyme')
const loading = ref(false)
const step = ref<'company' | 'plan' | 'summary'>('company')

// Aceptaciones legales
const acceptedTerms = ref(false)
const acceptedPrivacy = ref(false)
const acceptedDataProcessing = ref(false)

const plans = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 0,
    period: 'gratis',
    features: ['Hasta 10 facturas/mes', '1 usuario', 'Módulo básico', 'Soporte email'],
    highlighted: false,
  },
  {
    id: 'pyme' as const,
    name: 'PyME',
    price: 99000,
    period: '/mes',
    features: ['Facturas ilimitadas', 'Hasta 5 usuarios', 'Todos los módulos', 'Soporte prioritario', 'Integración DIAN', 'API'],
    highlighted: true,
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 249000,
    period: '/mes',
    features: ['Todo lo de PyME', 'Usuarios ilimitados', 'Soporte dedicado 24/7', 'Onboarding personalizado', 'SLA garantizado', 'Múltiples empresas'],
    highlighted: false,
  },
]

const stepLabels = ['Datos de la empresa', 'Elige tu plan', 'Resumen y confirmación']

function nextStep() {
  if (step.value === 'company') {
    if (!form.value.companyName) {
      pushToast('Error', 'El nombre de la empresa es obligatorio.')
      return
    }
    step.value = 'plan'
    store.setStep('plan')
  } else if (step.value === 'plan') {
    step.value = 'summary'
    store.setStep('summary')
  }
}

function prevStep() {
  if (step.value === 'plan') {
    step.value = 'company'
    store.setStep('company')
  } else if (step.value === 'summary') {
    step.value = 'plan'
    store.setStep('plan')
  }
}

async function handleComplete() {
  // Validar aceptaciones legales
  if (!acceptedTerms.value || !acceptedPrivacy.value || !acceptedDataProcessing.value) {
    pushToast('Aceptación requerida', 'Debes aceptar los términos, la política de privacidad y el procesamiento de datos para continuar.')
    return
  }
  loading.value = true
  try {
    const result = await store.completeOnboarding({
      companyName: form.value.companyName,
      nit: form.value.nit || undefined,
      address: form.value.address || undefined,
      phone: form.value.phone || undefined,
      city: form.value.city || undefined,
      sector: form.value.sector || undefined,
    })
    if (result.success) {
      // Registrar consentimientos
      const userId = state.currentUser?.id
      if (userId && state.activeTenantId) {
        try {
          await Promise.all([
            businessApi.registrarConsentimiento({ userId, type: 'terminosCondiciones', estado: 'aceptado' }, state.activeTenantId),
            businessApi.registrarConsentimiento({ userId, type: 'politicaPrivacidad', estado: 'aceptado' }, state.activeTenantId),
            businessApi.registrarConsentimiento({ userId, type: 'procesamientoDatos', estado: 'aceptado' }, state.activeTenantId),
          ])
        } catch (e) {
          console.warn('Consentimientos no registrados:', e)
        }
      }
      pushToast('¡Bienvenido!', 'Tu empresa ha sido configurada exitosamente.')
    } else {
      pushToast('Error', result.message || 'No se pudo completar la configuración.')
    }
  } catch (error: any) {
    pushToast('Error', error.message || 'Error al configurar la empresa.')
  } finally {
    loading.value = false
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
}

const companyInfoPreview = computed(() => {
  const info = [form.value.companyName]
  if (form.value.nit) info.push(`NIT: ${form.value.nit}`)
  if (form.value.city) info.push(form.value.city)
  if (form.value.sector) {
    const sectorLabel = sectors.find(s => s.value === form.value.sector)?.label || form.value.sector
    info.push(`Sector: ${sectorLabel}`)
  }
  return info.join(' · ')
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div class="w-full max-w-3xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Configura tu empresa</h1>
        <p class="text-gray-500 mt-2">Completa estos pasos para empezar a usar Contex360</p>
      </div>

      <!-- Step indicator -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <template v-for="(label, index) in stepLabels" :key="index">
          <div class="flex items-center">
            <div
              :class="[
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                index === 0 ? (step === 'company' ? 'bg-blue-100 text-blue-700' : 'bg-blue-600 text-white') : '',
                index === 1 ? (step === 'plan' ? 'bg-blue-100 text-blue-700' : step === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400') : '',
                index === 2 ? (step === 'summary' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400') : '',
              ]"
            >
              <span
                :class="[
                  'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                  (step === 'company' && index === 0) || (step === 'plan' && index <= 1) || (step === 'summary' && index <= 2)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500',
                ]"
              >
                {{ index + 1 }}
              </span>
              <span class="hidden sm:inline">{{ label }}</span>
            </div>
            <div v-if="index < stepLabels.length - 1" class="w-8 h-px mx-1 bg-gray-300" />
          </div>
        </template>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <!-- Step 1: Company Data -->
        <div v-if="step === 'company'" class="p-6 sm:p-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Datos de la empresa</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa *</label>
              <input
                v-model="form.companyName"
                type="text"
                placeholder="Ej: Mi Empresa SAS"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">NIT</label>
              <input
                v-model="form.nit"
                type="text"
                placeholder="Ej: 900123456-7"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                v-model="form.phone"
                type="text"
                placeholder="Ej: 3001234567"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                v-model="form.city"
                type="text"
                placeholder="Ej: Bogotá"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sector</label>
              <select
                v-model="form.sector"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="">Selecciona un sector</option>
                <option v-for="s in sectors" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                v-model="form.address"
                type="text"
                placeholder="Ej: Cra 10 # 20-30, Oficina 401"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div class="flex justify-end mt-8 pt-6 border-t border-gray-100">
            <button
              @click="nextStep"
              class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        </div>

        <!-- Step 2: Plan Selection -->
        <div v-if="step === 'plan'" class="p-6 sm:p-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Elige tu plan</h2>
          <p class="text-gray-500 mb-6">Selecciona el plan que mejor se adapte a tu empresa</p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              v-for="plan in plans"
              :key="plan.id"
              @click="selectedPlan = plan.id"
              :class="[
                'relative border-2 rounded-xl p-5 cursor-pointer transition-all',
                selectedPlan === plan.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
                plan.highlighted ? 'ring-1 ring-blue-200' : '',
              ]"
            >
              <div v-if="plan.highlighted" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                Recomendado
              </div>
              <div class="text-center mt-1">
                <h3 class="text-lg font-bold text-gray-900">{{ plan.name }}</h3>
                <div class="mt-2">
                  <span class="text-3xl font-extrabold text-gray-900">{{ plan.price === 0 ? 'Gratis' : formatPrice(plan.price) }}</span>
                  <span v-if="plan.price > 0" class="text-gray-500 text-sm">{{ plan.period }}</span>
                </div>
                <ul class="mt-4 space-y-2 text-left">
                  <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4 mt-0.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button @click="prevStep" class="px-6 py-2.5 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition">
              Atrás
            </button>
            <button @click="nextStep" class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
              Continuar
            </button>
          </div>
        </div>

        <!-- Step 3: Summary -->
        <div v-if="step === 'summary'" class="p-6 sm:p-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Resumen</h2>
          <p class="text-gray-500 mb-6">Revisa la información antes de finalizar</p>

          <div class="bg-gray-50 rounded-xl p-5 space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Empresa</h3>
              <p class="text-gray-900 font-medium mt-1">{{ companyInfoPreview }}</p>
              <p v-if="form.address" class="text-gray-600 text-sm mt-1">{{ form.address }}</p>
              <p v-if="form.phone" class="text-gray-600 text-sm">{{ form.phone }}</p>
            </div>
            <div class="border-t border-gray-200 pt-4">
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Plan seleccionado</h3>
              <p class="text-gray-900 font-medium mt-1">{{ plans.find(p => p.id === selectedPlan)?.name }}</p>
              <p class="text-gray-600 text-sm">
                {{ selectedPlan === 'starter' ? 'Gratis' : `${formatPrice(plans.find(p => p.id === selectedPlan)?.price || 0)}/mes` }}
              </p>
            </div>
          </div>

          <!-- Aceptaciones Legales -->
          <div class="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
            <h3 class="text-sm font-semibold text-blue-800">Aceptaciones legales</h3>
            <label class="flex items-start gap-3 cursor-pointer group">
              <input
                v-model="acceptedTerms"
                type="checkbox"
                class="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 group-hover:text-gray-900">
                Acepto los <a href="/terminos" target="_blank" class="text-blue-600 underline">Términos y Condiciones</a> de Contex360
              </span>
            </label>
            <label class="flex items-start gap-3 cursor-pointer group">
              <input
                v-model="acceptedPrivacy"
                type="checkbox"
                class="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 group-hover:text-gray-900">
                Acepto la <a href="/privacidad" target="_blank" class="text-blue-600 underline">Política de Privacidad</a> y el tratamiento de mis datos personales según la Ley 1581 de 2012
              </span>
            </label>
            <label class="flex items-start gap-3 cursor-pointer group">
              <input
                v-model="acceptedDataProcessing"
                type="checkbox"
                class="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700 group-hover:text-gray-900">
                Autorizo el procesamiento de datos financieros para la generación de facturación electrónica y cumplimiento DIAN
              </span>
            </label>
          </div>

          <div class="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button @click="prevStep" class="px-6 py-2.5 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition">
              Atrás
            </button>
            <button
              @click="handleComplete"
              :disabled="loading"
              class="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ loading ? 'Configurando...' : '¡Comenzar!' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Skip link -->
      <div class="text-center mt-6">
        <button class="text-sm text-gray-400 hover:text-gray-600 transition">
          Configurar más tarde
        </button>
      </div>
    </div>
  </div>
</template>
