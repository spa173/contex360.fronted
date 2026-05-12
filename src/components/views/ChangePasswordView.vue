<template>
  <div class="change-password-container">
    <div class="change-password-card">
      <div class="header">
        <span class="material-icons icon">lock</span>
        <h1>Cambia tu contraseña</h1>
        <p>Por seguridad, debes cambiar tu contraseña temporal antes de continuar.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="currentPassword">Contraseña actual</label>
          <input
            id="currentPassword"
            v-model="form.currentPassword"
            type="password"
            placeholder="Ingresa tu contraseña temporal"
            required
          />
        </div>

        <div class="form-group">
          <label for="newPassword">Nueva contraseña</label>
          <input
            id="newPassword"
            v-model="form.newPassword"
            type="password"
            placeholder="Mínimo 8 caracteres"
            required
            minlength="8"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="Repite tu nueva contraseña"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Contraseña cambiada exitosamente. Redirigiendo...
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">Cambiando...</span>
          <span v-else>Cambiar contraseña</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleSubmit = async () => {
  error.value = ''
  success.value = false

  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  if (form.value.newPassword.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  loading.value = true

  try {
    await authStore.changePassword(
      form.value.currentPassword,
      form.value.newPassword
    )
    success.value = true
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err) {
    error.value = err.message || 'Error al cambiar la contraseña'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 70% 22%, rgba(255, 255, 255, 0.05), transparent 18%),
    radial-gradient(circle at 84% 84%, rgba(255, 255, 255, 0.05), transparent 22%),
    linear-gradient(180deg, #182833 0%, #15232d 52%, #1b2b35 100%);
  color: #f7fbff;
  padding: 2rem;
}

.change-password-card {
  background: rgba(21, 35, 45, 0.95);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  padding: 3rem;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.icon {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: #fff;
}

p {
  color: #94a3b8;
  font-size: 0.95rem;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #e2e8f0;
}

input {
  padding: 0.875rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.5);
  color: #fff;
  font-size: 1rem;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

input::placeholder {
  color: #64748b;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.success-message {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.submit-btn {
  padding: 1rem;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
