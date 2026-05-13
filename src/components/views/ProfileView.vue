<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useToasts } from '../../composables/useToasts'
import { businessApi } from '../../services/businessApi'

const props = defineProps({
  isActive: Boolean,
})

const store = useAuthStore()
const { pushToast } = useToasts()

const profileForm = ref({
  name: '',
  title: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const loading = ref(false)
const passwordLoading = ref(false)

onMounted(() => {
  if (store.currentUser) {
    profileForm.value.name = store.currentUser.name || ''
    profileForm.value.title = store.currentUser.title || ''
  }
})

async function handleUpdateProfile() {
  loading.value = true
  try {
    const updatedUser = await businessApi.updateProfile({
      name: profileForm.value.name,
      title: profileForm.value.title,
    })
    
    // Update local state
    store.updateCurrentUser(updatedUser)
    
    pushToast('Perfil actualizado', 'Tus cambios se han guardado correctamente.')
  } catch (error) {
    pushToast('Error', error.message || 'No se pudo actualizar el perfil.')
  } finally {
    loading.value = false
  }
}

async function handleChangePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    pushToast('Error', 'Las contraseñas no coinciden.')
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    pushToast('Error', 'La nueva contraseña debe tener al menos 8 caracteres.')
    return
  }

  passwordLoading.value = true
  try {
    await businessApi.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    pushToast('Contraseña actualizada', 'Tu contraseña ha sido cambiada exitosamente.')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  } catch (error) {
    pushToast('Error', error.message || 'No se pudo cambiar la contraseña.')
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div v-if="isActive" class="profile-view animate-in">
    <header class="view-header">
      <div class="header-main">
        <h1>Mi Perfil</h1>
        <p>Gestiona tu información personal y configuración de seguridad.</p>
      </div>
    </header>

    <div class="profile-grid">
      <!-- Información Personal -->
      <section class="profile-section card">
        <div class="section-header">
          <span class="material-icons">person</span>
          <h2>Información Personal</h2>
        </div>
        
        <form @submit.prevent="handleUpdateProfile" class="profile-form">
          <div class="form-group">
            <label for="profile-name">Nombre completo</label>
            <input 
              id="profile-name"
              v-model="profileForm.name" 
              type="text" 
              placeholder="Tu nombre"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="profile-title">Cargo / Título</label>
            <input 
              id="profile-title"
              v-model="profileForm.title" 
              type="text" 
              placeholder="Ej: Administrador, Contador"
            />
          </div>

          <div class="form-group">
            <label>Correo electrónico</label>
            <input 
              type="email" 
              :value="store.currentUser?.email" 
              disabled 
              class="disabled-input"
            />
            <span class="input-hint">El correo electrónico no se puede cambiar directamente.</span>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </section>

      <!-- Seguridad -->
      <section class="profile-section card">
        <div class="section-header">
          <span class="material-icons">lock</span>
          <h2>Seguridad</h2>
        </div>

        <div class="security-intro">
          <h3>Cambiar contraseña</h3>
          <p>Te recomendamos usar una contraseña fuerte que no uses en otros sitios.</p>
        </div>

        <form @submit.prevent="handleChangePassword" class="profile-form">
          <div class="form-group">
            <label for="current-password">Contraseña actual</label>
            <input 
              id="current-password"
              v-model="passwordForm.currentPassword" 
              type="password" 
              placeholder="••••••••"
              required
            />
          </div>

          <div class="form-group">
            <label for="new-password">Nueva contraseña</label>
            <input 
              id="new-password"
              v-model="passwordForm.newPassword" 
              type="password" 
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirmar nueva contraseña</label>
            <input 
              id="confirm-password"
              v-model="passwordForm.confirmPassword" 
              type="password" 
              placeholder="Repite la contraseña"
              required
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-secondary" :disabled="passwordLoading">
              {{ passwordLoading ? 'Actualizando...' : 'Actualizar contraseña' }}
            </button>
          </div>
        </form>

        <div class="security-footer">
          <div class="status-item">
            <span class="status-dot active"></span>
            <span>Sesión activa desde {{ store.currentUser?.lastLoginAt ? new Date(store.currentUser.lastLoginAt).toLocaleDateString() : 'hoy' }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 1rem;
}

.view-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.view-header p {
  color: #94a3b8;
  font-size: 1rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(12px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  color: #10b981;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e2e8f0;
}

.form-group input {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #fff;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.disabled-input {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(15, 23, 42, 0.3) !important;
}

.input-hint {
  font-size: 0.75rem;
  color: #64748b;
}

.security-intro {
  margin-bottom: 1.5rem;
}

.security-intro h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 0.25rem;
}

.security-intro p {
  font-size: 0.875rem;
  color: #94a3b8;
}

.form-actions {
  margin-top: 1rem;
}

.btn-primary {
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.1);
}

.security-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.active {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@media (max-width: 640px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
