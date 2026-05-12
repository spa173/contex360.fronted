<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['back'])

const form = ref({
  nombre: '',
  empresa: '',
  correo: '',
  telefono: '',
  mensaje: ''
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
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/demo`, form.value)
    successMessage.value = response.data.message || 'Solicitud enviada correctamente. Nuestro equipo te contactará pronto.'
    form.value = { nombre: '', empresa: '', correo: '', telefono: '', mensaje: '' }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Error al enviar la solicitud. Intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="demo-wrap">
    <div class="demo-page">
      <button class="demo-back" @click="emit('back')">
        ← Volver al login
      </button>

      <div class="demo-header">
        <h1 class="demo-title">Solicita una Demo</h1>
        <p class="demo-subtitle">Descubre cómo Contex360 puede transformar la gestión financiera de tu empresa</p>
      </div>

      <div v-if="successMessage" class="demo-alert demo-alert--success">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="demo-alert demo-alert--error">
        {{ errorMessage }}
      </div>

      <form v-if="!successMessage" @submit.prevent="handleSubmit" class="demo-form">
        <div class="demo-field">
          <label for="nombre">Nombre completo <span class="demo-required">*</span></label>
          <input
            id="nombre"
            v-model="form.nombre"
            type="text"
            placeholder="Tu nombre"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="demo-field">
          <label for="empresa">Empresa <span class="demo-required">*</span></label>
          <input
            id="empresa"
            v-model="form.empresa"
            type="text"
            placeholder="Nombre de tu empresa"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="demo-field">
          <label for="correo">Correo electrónico <span class="demo-required">*</span></label>
          <input
            id="correo"
            v-model="form.correo"
            type="email"
            placeholder="tu@empresa.com"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="demo-field">
          <label for="telefono">Teléfono</label>
          <input
            id="telefono"
            v-model="form.telefono"
            type="tel"
            placeholder="+57 300 123 4567"
            :disabled="isLoading"
          />
        </div>

        <div class="demo-field">
          <label for="mensaje">Mensaje</label>
          <textarea
            id="mensaje"
            v-model="form.mensaje"
            rows="4"
            placeholder="Cuéntanos sobre tus necesidades..."
            :disabled="isLoading"
          ></textarea>
        </div>

        <button type="submit" class="demo-submit" :disabled="isLoading">
          {{ isLoading ? 'Enviando...' : 'Solicitar Demo' }}
        </button>
      </form>

      <div v-if="successMessage" class="demo-cta">
        <button @click="successMessage = ''" class="demo-secondary">
          Enviar otra solicitud
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-wrap {
  padding: 24px 16px 48px;
}

.demo-back {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0 0 8px;
  transition: color 0.15s;
}

.demo-back:hover {
  color: #e2e8f0;
}

.demo-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin: 0 auto;
  max-width: 600px;
}

.demo-header {
  text-align: center;
}

.demo-title {
  color: #e2e8f0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}

.demo-subtitle {
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.demo-alert {
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 16px 20px;
}

.demo-alert--success {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.28);
  color: #6ee7b7;
}

.demo-alert--error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.28);
  color: #fca5a5;
}

.demo-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-field label {
  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 500;
}

.demo-required {
  color: #ef4444;
}

.demo-field input,
.demo-field textarea {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #f1f5f9;
  font-size: 0.95rem;
  padding: 12px 16px;
  transition: border-color 0.15s;
}

.demo-field input:focus,
.demo-field textarea:focus {
  outline: none;
  border-color: #10b981;
}

.demo-field input:disabled,
.demo-field textarea:disabled {
  opacity: 0.6;
}

.demo-field textarea {
  resize: vertical;
}

.demo-submit {
  background: #10b981;
  border: none;
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  padding: 14px 24px;
  transition: opacity 0.15s;
}

.demo-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.demo-submit:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.demo-cta {
  text-align: center;
}

.demo-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 12px 24px;
  transition: all 0.15s;
}

.demo-secondary:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
