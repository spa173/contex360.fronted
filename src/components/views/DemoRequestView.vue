<script setup lang="ts">
import { ref } from 'vue'
import { businessApi } from '../../services/businessApi'

const emit = defineEmits(['back'])

const form = ref({
  nombre: '',
  empresa: '',
  correo: '',
  telefono: '',
  mensaje: '',
  nit: '',
  ciudad: '',
  direccion: '',
  sector: '',
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  if (!form.value.nombre || !form.value.empresa || !form.value.correo) {
    errorMessage.value = 'Por favor completa los campos obligatorios.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await businessApi.createDemoRequest(form.value)
    successMessage.value = response.message || 'Solicitud enviada correctamente. Nuestro equipo te contactará pronto.'
    form.value = { nombre: '', empresa: '', correo: '', telefono: '', mensaje: '', nit: '', ciudad: '', direccion: '', sector: '' }
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al enviar la solicitud. Intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FFFFFF] text-[#18181B] font-['Inter'] flex flex-col">
    <!-- Header -->
    <header class="h-20 px-8 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-[#18181B] rounded-lg flex items-center justify-center text-white font-black text-lg">C</div>
        <span class="text-[20px] font-bold tracking-tight text-[#18181B]">Contex360</span>
      </div>
      <button
        @click="emit('back')"
        class="flex items-center gap-2 text-[#71717A] hover:text-[#18181B] transition-all text-[13px] font-bold"
      >
        <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        Volver al inicio
      </button>
    </header>

    <!-- Main Content: Split Screen -->
    <main class="flex-grow flex items-center justify-center py-12 px-6">
      <div class="max-w-7xl w-full grid lg:grid-cols-2 gap-20 items-center">
        
        <!-- Lado Izquierdo: Propuesta de Valor -->
        <div class="space-y-12">
          <div class="space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 text-[#2563EB] font-bold text-[12px] bg-[#2563EB]/5 rounded-full border border-[#2563EB]/10">
              SOLUCIONES ENTERPRISE
            </div>
            <h1 class="text-[48px] lg:text-[60px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B]">
              Experimente el futuro de la <span class="text-[#2563EB]">gestión logística</span>.
            </h1>
            <p class="text-[18px] leading-relaxed text-[#71717A] max-w-md font-medium">
              Descubra cómo nuestra arquitectura multi-empresa e inteligencia artificial transforman operaciones complejas en flujos de trabajo fluidos.
            </p>
          </div>

          <div class="space-y-8">
            <div class="flex items-start gap-5">
              <div class="w-12 h-12 rounded-xl bg-[#F4F4F5] flex items-center justify-center text-[#18181B] shrink-0">
                <span class="material-symbols-outlined">smart_toy</span>
              </div>
              <div>
                <h3 class="text-[16px] font-bold text-[#18181B] mb-1">Facturación Impulsada por IA</h3>
                <p class="text-[14px] text-[#71717A] font-medium">Automatice el ciclo de ingresos y minimice errores humanos en segundos.</p>
              </div>
            </div>

            <div class="flex items-start gap-5">
              <div class="w-12 h-12 rounded-xl bg-[#F4F4F5] flex items-center justify-center text-[#18181B] shrink-0">
                <span class="material-symbols-outlined">groups</span>
              </div>
              <div>
                <h3 class="text-[16px] font-bold text-[#18181B] mb-1">Gestión Multi-Tenant</h3>
                <p class="text-[14px] text-[#71717A] font-medium">Administre múltiples empresas desde un único panel de control centralizado.</p>
              </div>
            </div>

            <div class="flex items-start gap-5">
              <div class="w-12 h-12 rounded-xl bg-[#F4F4F5] flex items-center justify-center text-[#18181B] shrink-0">
                <span class="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <h3 class="text-[16px] font-bold text-[#18181B] mb-1">Seguridad de Nivel Corporativo</h3>
                <p class="text-[14px] text-[#71717A] font-medium">Infraestructura blindada que cumple con los más altos estándares globales.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Lado Derecho: Formulario -->
        <div class="relative">
          <!-- Success Overlay -->
          <div v-if="successMessage" class="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8 rounded-[32px] animate-in fade-in zoom-in duration-300">
            <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <span class="material-symbols-outlined text-emerald-600 text-[40px]">check_circle</span>
            </div>
            <h3 class="text-[24px] font-bold text-[#18181B] mb-2">¡Solicitud Enviada!</h3>
            <p class="text-[15px] text-[#71717A] mb-8 font-medium">{{ successMessage }}</p>
            <button @click="successMessage = ''" class="text-[#2563EB] font-bold hover:underline">Enviar otra consulta</button>
          </div>

          <div class="bg-white rounded-[32px] border border-[#F4F4F5] p-10 lg:p-12 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)]">
            <h2 class="text-[24px] font-bold text-[#18181B] mb-8">Agendar una demostración</h2>
            
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Nombre Completo</label>
                  <input
                    v-model="form.nombre"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Empresa / Cargo</label>
                  <input
                    v-model="form.empresa"
                    required
                    placeholder="Logística S.A."
                    class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Correo Corporativo</label>
                <input
                  v-model="form.correo"
                  required
                  type="email"
                  placeholder="ejecutivo@empresa.com"
                  class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium"
                />
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Teléfono de Contacto</label>
                  <input
                    v-model="form.telefono"
                    placeholder="+57 300..."
                    class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Sector Económico</label>
                  <select
                    v-model="form.sector"
                    class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium"
                  >
                    <option value="">Seleccione uno...</option>
                    <option value="logistics">Logística & Transporte</option>
                    <option value="retail">Comercio / Retail</option>
                    <option value="fintech">Finanzas & Fintech</option>
                    <option value="other">Otro sector</option>
                  </select>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">¿Cómo podemos ayudarle?</label>
                <textarea
                  v-model="form.mensaje"
                  rows="3"
                  placeholder="Cuéntenos sus retos operativos..."
                  class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium resize-none"
                ></textarea>
              </div>

              <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold rounded-lg">
                {{ errorMessage }}
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="w-full py-4 bg-[#18181B] text-white font-bold text-[15px] rounded-xl hover:bg-[#27272A] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-black/5"
              >
                <span v-if="isLoading" class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                {{ isLoading ? 'Procesando solicitud...' : 'Solicitar Acceso a Demo' }}
              </button>
              
              <p class="text-center text-[12px] text-[#71717A] font-medium">
                Al solicitar acceso, un experto se pondrá en contacto con usted en menos de 24 horas laborables.
              </p>
            </form>
          </div>

          <!-- Multi-tenant badge -->
          <div class="mt-8 flex justify-center items-center gap-2 text-[#A1A1AA]">
            <span class="material-symbols-outlined text-[16px]">hub</span>
            <span class="text-[11px] font-bold uppercase tracking-widest">Infraestructura Multi-Tenant de Grado Enterprise</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
