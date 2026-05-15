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
  <div class="bg-background min-h-screen flex flex-col font-inter antialiased text-text-main">
    <!-- Header -->
    <header class="flex justify-between items-center w-full px-6 h-16 bg-surface border-b border-border-subtle sticky top-0 z-50">
      <div class="flex items-center gap-2">
        <span class="font-serif text-2xl font-bold text-primary">Contex360</span>
      </div>
      <button
        @click="emit('back')"
        class="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-medium"
      >
        <span class="material-symbols-outlined">arrow_back</span>
        Volver al inicio
      </button>
    </header>

    <!-- Main Content Canvas -->
    <main class="pt-12 pb-24 px-4 sm:px-8 flex flex-col items-center flex-grow w-full">
      <!-- Hero Section for Form -->
      <div class="max-w-2xl w-full text-center mb-12">
        <span class="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
          ERP de Próxima Generación
        </span>
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-on-surface mb-4 font-serif">
          Solicita una Demo Personalizada
        </h1>
        <p class="text-base sm:text-lg text-text-muted px-4 leading-relaxed">
          Descubre cómo la IA de Contex360 puede transformar la gestión financiera de tu empresa con herramientas quirúrgicas de precisión.
        </p>
      </div>

      <!-- Success State -->
      <div v-if="successMessage" class="max-w-3xl w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-8 sm:p-12 text-center shadow-sm mb-12 animate-in fade-in duration-300">
        <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2 font-serif">¡Solicitud Recibida con Éxito!</h3>
        <p class="text-base text-gray-600 mb-6">{{ successMessage }}</p>
        <button @click="successMessage = ''" class="text-primary font-bold hover:underline">
          Enviar otra solicitud
        </button>
      </div>

      <!-- Error State -->
      <div v-if="errorMessage" class="max-w-3xl w-full mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl text-center">
        {{ errorMessage }}
      </div>

      <!-- Form Card -->
      <section v-if="!successMessage" class="max-w-3xl w-full bg-white rounded-2xl border border-border-subtle shadow-sm p-8 sm:p-12 mb-16">
        <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Full Name -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant" for="fullName">Nombre completo *</label>
            <input
              v-model="form.nombre"
              required
              class="w-full px-4 py-3.5 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-muted text-text-main text-sm outline-none transition-all"
              id="fullName"
              placeholder="Ej. Juan Pérez"
              type="text"
            />
          </div>
          <!-- Company Name -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant" for="company">Empresa *</label>
            <input
              v-model="form.empresa"
              required
              class="w-full px-4 py-3.5 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-muted text-text-main text-sm outline-none transition-all"
              id="company"
              placeholder="Empresa S.A.S"
              type="text"
            />
          </div>
          <!-- Work Email -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant" for="email">Correo electrónico *</label>
            <input
              v-model="form.correo"
              required
              class="w-full px-4 py-3.5 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-muted text-text-main text-sm outline-none transition-all"
              id="email"
              placeholder="juan@empresa.com"
              type="email"
            />
          </div>
          <!-- Phone Number -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant" for="phone">Teléfono</label>
            <input
              v-model="form.telefono"
              class="w-full px-4 py-3.5 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-muted text-text-main text-sm outline-none transition-all"
              id="phone"
              placeholder="+57 300 000 0000"
              type="tel"
            />
          </div>
          <!-- City -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant" for="city">Ciudad</label>
            <select
              v-model="form.ciudad"
              class="w-full px-4 py-3.5 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-muted text-text-main text-sm outline-none transition-all"
              id="city"
            >
              <option value="">Selecciona tu ciudad</option>
              <option value="bogota">Bogotá</option>
              <option value="medellin">Medellín</option>
              <option value="cali">Cali</option>
              <option value="barranquilla">Barranquilla</option>
            </select>
          </div>
          <!-- Industry -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant" for="industry">Sector</label>
            <select
              v-model="form.sector"
              class="w-full px-4 py-3.5 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-muted text-text-main text-sm outline-none transition-all"
              id="industry"
            >
              <option value="">Selecciona un sector</option>
              <option value="tech">Tecnología</option>
              <option value="finance">Finanzas</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufactura</option>
              <option value="salud">Salud</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <!-- Help Area -->
          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="text-xs font-bold uppercase tracking-wider text-on-surface-variant" for="help">¿Cómo podemos ayudarte?</label>
            <textarea
              v-model="form.mensaje"
              class="w-full px-4 py-3.5 border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface-muted text-text-main text-sm outline-none transition-all resize-none"
              id="help"
              placeholder="Cuéntanos sobre los retos financieros y de ERP en tu empresa..."
              rows="4"
            ></textarea>
          </div>
          <!-- CTA Button -->
          <div class="md:col-span-2 mt-6">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-4 bg-primary text-white font-bold text-base rounded-xl transition-all shadow-lg active:scale-[0.98] hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="isLoading" class="material-symbols-outlined animate-spin">progress_activity</span>
              {{ isLoading ? 'Enviando solicitud...' : 'Agendar Demo Gratis' }}
            </button>
            <p class="text-center mt-4 text-xs sm:text-sm text-text-muted">
              Un experto en Contex360 se pondrá en contacto contigo en menos de 24 horas.
            </p>
          </div>
        </form>
      </section>

      <!-- Trust Section -->
      <section class="max-w-3xl w-full flex flex-col items-center gap-8 mb-16">
        <p class="text-xs text-text-muted uppercase tracking-widest font-bold">Respaldo y Certificaciones</p>
        <div class="flex flex-wrap justify-center items-center gap-10 sm:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-4xl text-primary">verified_user</span>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-on-surface leading-none mb-1">Partner DIAN</span>
              <span class="text-xs text-text-muted">Facturación Electrónica</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-4xl text-primary">cloud_done</span>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-on-surface leading-none mb-1">Cloud Native</span>
              <span class="text-xs text-text-muted">99.9% Uptime</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-4xl text-primary">security</span>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-on-surface leading-none mb-1">ISO 27001</span>
              <span class="text-xs text-text-muted">Seguridad Bancaria</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature Highlight Bento-lite -->
      <section class="max-w-5xl w-full mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 bg-primary/5 rounded-2xl p-8 border border-primary/10 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <img
            class="w-full md:w-56 h-36 object-cover rounded-xl shadow-md"
            alt="Data analytics dashboard"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLefOBPwpKO-GASuaBGRXJuDLr9KDcGhP1iRBj7IltYvCqYISND48nAff74BZVFCHhr5CH-QBxzCPO8igS1sWqfYTdRNZrUd3stMmiLvtmWwqF-iNZf4oLXvngOr1Ys50bkNWGu11OLvwdvHiX27T9XS7Z_J5OJ4Y_pqfJ98GXq0RJGBtYq8jIp-4M5hEapv3BOGe-ABf1lcutHvBrvXW116UOy9-Bd0DLOLkCmHEJ3CfP4_vZo4WEyOwdni3d_WInPz1KA6JEzCf9"
          />
          <div>
            <h3 class="text-xl font-bold text-primary mb-2 font-serif">Análisis Predictivo IA</h3>
            <p class="text-sm text-on-surface-variant leading-relaxed">
              Utilizamos ContexAI para predecir flujos de caja y optimizar tus inventarios y obligaciones fiscales antes de que surjan imprevistos.
            </p>
          </div>
        </div>
        <div class="bg-surface rounded-2xl p-8 flex flex-col justify-center text-center border border-border-subtle shadow-sm">
          <span class="material-symbols-outlined text-4xl text-primary mb-4">psychology</span>
          <h3 class="text-xl font-bold text-on-surface mb-2 font-serif">IA Integrada</h3>
          <p class="text-sm text-text-muted leading-relaxed">Gestión inteligente y automatización sin complicaciones para tu equipo contable.</p>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="w-full py-10 px-6 sm:px-12 bg-surface border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
      <div class="flex flex-col items-center md:items-start gap-2">
        <div class="flex items-center gap-2">
          <span class="text-base font-bold text-on-surface font-serif">Contex360</span>
          <span class="text-border-subtle">|</span>
          <span class="text-xs text-text-muted">ERP Administrativo &amp; Contable</span>
        </div>
        <p class="text-xs text-text-muted">© 2026 Contex360. Todos los derechos reservados. Colombia.</p>
      </div>
      <div class="flex gap-8 text-xs text-text-muted font-medium">
        <a class="hover:text-primary transition-colors" href="#">Términos y Condiciones</a>
        <a class="hover:text-primary transition-colors" href="#">Privacidad</a>
        <a class="hover:text-primary transition-colors" href="#">Contacto</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
