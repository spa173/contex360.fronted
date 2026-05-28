<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { businessApi } from '../../services/businessApi'
import { useStateStore } from '../../stores/stateStore'
import { useToasts } from '../../composables/useToasts'

defineProps({ isActive: { type: Boolean, default: true } })
const emit = defineEmits(['notify'])
const state = useStateStore()
const { pushToast } = useToasts()

const consents = ref<any[]>([])
const contratos = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showDerechoForm = ref(false)
const derechoForm = ref({ tipo: 'accesoDatos' })

const tiposConsentimiento: Record<string, string> = {
  politicaPrivacidad: 'Política de Privacidad',
  terminosCondiciones: 'Términos y Condiciones',
  marketingEmails: 'Marketing por Email',
  analiticas: 'Analíticas',
  cookies: 'Cookies',
  facturacion: 'Facturación',
  procesamientoDatos: 'Procesamiento de Datos',
}

const tiposDerecho = [
  { value: 'accesoDatos', label: 'Acceso a mis datos' },
  { value: 'rectificacionDatos', label: 'Rectificación de datos' },
  { value: 'eliminacionDatos', label: 'Eliminación de datos (olvido)' },
  { value: 'limitacionTratamiento', label: 'Limitación del tratamiento' },
  { value: 'portabilidadDatos', label: 'Portabilidad de datos' },
  { value: 'oposicionTratamiento', label: 'Oposición al tratamiento' },
  { value: 'olvidoDigital', label: 'Derecho al olvido digital' },
]

const consentimientosAgrupados = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const c of consents.value) {
    const key = c.userId
    if (!groups[key]) groups[key] = []
    groups[key].push(c)
  }
  return groups
})

onMounted(async () => {
  try {
    const userId = state.currentUser?.id
    const tenantId = state.activeTenantId
    if (userId && tenantId) {
      const [cons, conts] = await Promise.all([
        businessApi.getConsentimientos(userId, tenantId).catch(() => []),
        businessApi.getContratosActivos(tenantId).catch(() => []),
      ])
      consents.value = cons
      contratos.value = conts
    }
  } catch (err) {
    console.error('Error loading privacy data:', err)
  } finally {
    loading.value = false
  }
})

async function handleRetirarConsent(consentId: string) {
  saving.value = true
  try {
    const userId = state.currentUser?.id
    const tenantId = state.activeTenantId
    if (userId && tenantId) {
      await businessApi.registrarConsentimiento({ userId, type: 'procesamientoDatos', estado: 'retirado' }, tenantId)
      pushToast('Consentimiento retirado', 'Se ha registrado tu retiro de consentimiento.')
    }
  } catch (err: any) {
    pushToast('Error', err.message)
  } finally {
    saving.value = false
  }
}

async function handleEjercerDerecho() {
  saving.value = true
  try {
    const userId = state.currentUser?.id
    const tenantId = state.activeTenantId
    if (userId && tenantId && state.currentUser) {
      await businessApi.crearSolicitudDerechos({
        userId,
        tipo: derechoForm.value.tipo,
        solicitante: state.currentUser.name,
        email: state.currentUser.email,
      }, tenantId)
      pushToast('Solicitud enviada', 'Hemos recibido tu solicitud de derechos ARCO. Te contactaremos en un máximo de 15 días hábiles.')
      showDerechoForm.value = false
    }
  } catch (err: any) {
    pushToast('Error', err.message)
  } finally {
    saving.value = false
  }
}

async function handleSeedContratos() {
  try {
    const tenantId = state.activeTenantId
    if (tenantId) {
      const res = await businessApi.seedContratos(tenantId)
      pushToast('Contratos creados', `Se crearon ${res.creados?.length || 0} contratos legales.`)
      contratos.value = await businessApi.getContratosActivos(tenantId)
    }
  } catch (err: any) {
    pushToast('Error', err.message)
  }
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Configuración</span>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="text-[#71717A]">Privacidad y Datos</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">
          Privacidad y Datos
        </h1>
        <p class="text-[14px] text-[#71717A]">
          Gestiona tus consentimientos, contratos aceptados y derechos ARCO.
        </p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <span class="material-symbols-outlined animate-spin text-[32px] text-[#2563EB]">progress_activity</span>
    </div>

    <template v-else>
      <!-- Consentimientos -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
          <h2 class="text-[15px] font-bold tracking-tight text-[#18181B]">Consentimientos</h2>
          <span class="text-[11px] text-[#71717A]">Según Ley 1581 de 2012</span>
        </div>
        <div v-if="consents.length === 0" class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]">
          No hay consentimientos registrados aún.
        </div>
        <div v-else class="divide-y divide-[#F4F4F5]">
          <div v-for="c in consents" :key="c.id" class="px-5 py-3.5 flex items-center justify-between">
            <div>
              <p class="text-[13px] font-semibold text-[#18181B]">
                {{ tiposConsentimiento[c.type] || c.type }}
              </p>
              <p class="text-[11px] text-[#71717A]">
                {{ c.estado === 'aceptado' ? 'Aceptado' : c.estado }} · {{ new Date(c.fecha).toLocaleDateString('es-CO') }}
                <span v-if="c.hashConsent" class="ml-2 font-mono text-[10px]">#{{ c.hashConsent.slice(0, 8) }}</span>
              </p>
            </div>
            <button
              v-if="c.estado === 'aceptado'"
              class="px-3 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              @click="handleRetirarConsent(c.id)"
            >
              Retirar
            </button>
          </div>
        </div>
      </div>

      <!-- Derechos ARCO -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
          <h2 class="text-[15px] font-bold tracking-tight text-[#18181B]">Derechos ARCO</h2>
          <span class="text-[11px] text-[#71717A]">Acceso, Rectificación, Cancelación, Oposición</span>
        </div>
        <div class="px-5 py-5">
          <p class="text-[13px] text-[#71717A] mb-4">
            Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición sobre tus datos personales en cualquier momento.
          </p>
          <button
            class="px-4 py-2 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A] transition-colors"
            @click="showDerechoForm = true"
          >
            Ejercer un derecho ARCO
          </button>

          <!-- Formulario de derecho -->
          <div v-if="showDerechoForm" class="mt-4 p-4 bg-[#FAFAFA] rounded-[12px] border border-[#E4E4E7]">
            <label class="block text-[13px] font-semibold text-[#18181B] mb-2">Tipo de solicitud</label>
            <select
              v-model="derechoForm.tipo"
              class="w-full px-3 py-2 border border-[#E4E4E7] rounded-[8px] text-[13px] bg-white mb-4"
            >
              <option v-for="d in tiposDerecho" :key="d.value" :value="d.value">{{ d.label }}</option>
            </select>
            <div class="flex gap-3">
              <button
                class="px-4 py-2 border border-[#E4E4E7] rounded-[10px] text-[13px] font-semibold hover:bg-[#FAFAFA]"
                @click="showDerechoForm = false"
              >
                Cancelar
              </button>
              <button
                :disabled="saving"
                class="px-4 py-2 bg-[#2563EB] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 flex items-center gap-2"
                @click="handleEjercerDerecho"
              >
                <span v-if="saving" class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contratos Aceptados -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
          <h2 class="text-[15px] font-bold tracking-tight text-[#18181B]">Contratos Legales</h2>
          <button
            class="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            @click="handleSeedContratos"
          >
            Cargar contratos predeterminados
          </button>
        </div>
        <div v-if="contratos.length === 0" class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]">
          No hay contratos disponibles. Haz clic en "Cargar contratos predeterminados".
        </div>
        <div v-else class="divide-y divide-[#F4F4F5]">
          <div v-for="c in contratos" :key="c.id" class="px-5 py-3.5 flex items-center justify-between">
            <div>
              <p class="text-[13px] font-semibold text-[#18181B]">{{ c.titulo }}</p>
              <p class="text-[11px] text-[#71717A]">v{{ c.version }} · Publicado {{ new Date(c.publicadoEn).toLocaleDateString('es-CO') }}</p>
            </div>
            <span class="text-[11px] font-mono text-[#A1A1AA]">#{{ c.hash.slice(0, 12) }}</span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
