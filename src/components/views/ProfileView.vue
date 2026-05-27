<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useToasts } from '../../composables/useToasts'
import { businessApi } from '../../services/businessApi'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Mi Perfil',
  meta: [
    { name: 'description', content: 'Configura tu perfil y cambia tu contraseña en Contex360.' },
  ]
})

defineProps({ isActive: Boolean })

const store = useAuthStore()
const { pushToast } = useToasts()

const activeTab = ref('personal')
const tabs = [
  { id: 'personal', label: 'Personal' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'notificaciones', label: 'Notificaciones' },
]

const profileForm = ref({ name: '', title: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const loading = ref(false)
const passwordLoading = ref(false)

onMounted(() => {
  if (store.currentUser) {
    profileForm.value.name = store.currentUser.name || ''
    profileForm.value.title = store.currentUser.title || ''
  }
})

function initials(name) {
  if (!name) return 'U'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

async function handleUpdateProfile() {
  loading.value = true
  try {
    const updatedUser = await businessApi.updateProfile({ name: profileForm.value.name, title: profileForm.value.title })
    store.updateCurrentUser(updatedUser)
    pushToast('Perfil actualizado', 'Tus cambios se han guardado.')
  } catch (error) {
    pushToast('Error', error.message || 'No se pudo actualizar el perfil.')
  } finally { loading.value = false }
}

async function handleChangePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    pushToast('Error', 'Las contraseñas no coinciden.'); return
  }
  if (passwordForm.value.newPassword.length < 8) {
    pushToast('Error', 'Mínimo 8 caracteres.'); return
  }
  passwordLoading.value = true
  try {
    await businessApi.changePassword(passwordForm.value.currentPassword, passwordForm.value.newPassword)
    pushToast('Contraseña actualizada', 'Tu contraseña ha sido cambiada.')
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error) {
    pushToast('Error', error.message || 'No se pudo cambiar la contraseña.')
  } finally { passwordLoading.value = false }
}
</script>

<template>
  <section
    v-if="isActive"
    class="animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
        <span>Cuenta</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Perfil</span>
      </div>
      <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">
        Mi perfil
      </h1>
      <p class="text-[14px] text-[#71717A]">
        Información personal, seguridad y autenticación.
      </p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-[#E4E4E7] mb-6">
      <div class="flex gap-1 -mb-px overflow-x-auto">
        <button
          v-for="t in tabs"
          :key="t.id"
          :class="[
            'px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap',
            activeTab === t.id ? 'text-[#18181B] border-[#18181B]' : 'text-[#71717A] hover:text-[#18181B] border-transparent'
          ]"
          @click="activeTab = t.id"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Personal -->
    <div
      v-if="activeTab === 'personal'"
      class="max-w-2xl bg-white border border-[#E4E4E7] rounded-[14px] p-6"
    >
      <div class="flex items-center gap-2 mb-5 pb-3 border-b border-[#F4F4F5]">
        <span class="material-symbols-outlined text-[20px] text-[#18181B]">person</span>
        <h2 class="text-[15px] font-bold tracking-tight text-[#18181B]">
          Información personal
        </h2>
      </div>
      <div class="flex items-center gap-4 mb-5">
        <div class="w-16 h-16 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-[22px]">
          {{ initials(store.currentUser?.name) }}
        </div>
        <div>
          <button class="text-[12px] font-semibold text-[#2563EB] hover:underline">
            Subir foto
          </button><p class="text-[11px] text-[#A1A1AA] mt-0.5">
            JPG, PNG · Máx 1MB
          </p>
        </div>
      </div>
      <form
        class="space-y-4"
        @submit.prevent="handleUpdateProfile"
      >
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Nombre completo</label>
          <input
            v-model="profileForm.name"
            required
            class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04]"
          >
        </div>
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Cargo</label>
          <input
            v-model="profileForm.title"
            placeholder="Ej. Administrador"
            class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04]"
          >
        </div>
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Correo</label>
          <input
            :value="store.currentUser?.email"
            readonly
            class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#A1A1AA] bg-[#FAFAFA] outline-none"
          >
          <p class="text-[11px] text-[#A1A1AA] mt-1.5">
            El correo no se puede cambiar directamente.
          </p>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A] disabled:opacity-50"
        >
          {{ loading ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </form>
    </div>

    <!-- Seguridad -->
    <div
      v-if="activeTab === 'seguridad'"
      class="max-w-2xl bg-white border border-[#E4E4E7] rounded-[14px] p-6"
    >
      <div class="flex items-center gap-2 mb-5 pb-3 border-b border-[#F4F4F5]">
        <span class="material-symbols-outlined text-[20px] text-[#18181B]">lock</span>
        <h2 class="text-[15px] font-bold tracking-tight text-[#18181B]">
          Cambiar contraseña
        </h2>
      </div>
      <form
        class="space-y-4"
        @submit.prevent="handleChangePassword"
      >
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Contraseña actual</label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            required
            placeholder="••••••••"
            class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04]"
          >
        </div>
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Nueva contraseña</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            required
            placeholder="Mínimo 8 caracteres"
            class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04]"
          >
        </div>
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Confirmar</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            required
            class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04]"
          >
        </div>
        <button
          type="submit"
          :disabled="passwordLoading"
          class="w-full py-2.5 border border-[#18181B] text-[#18181B] rounded-[10px] text-[13px] font-semibold hover:bg-[#18181B] hover:text-white transition-colors disabled:opacity-50"
        >
          {{ passwordLoading ? 'Actualizando...' : 'Actualizar contraseña' }}
        </button>
      </form>
    </div>

    <!-- Notificaciones -->
    <div
      v-if="activeTab === 'notificaciones'"
      class="max-w-3xl bg-white border border-[#E4E4E7] rounded-[14px] p-6"
    >
      <div class="flex items-center gap-2 mb-5 pb-3 border-b border-[#F4F4F5]">
        <span class="material-symbols-outlined text-[20px] text-[#18181B]">notifications</span>
        <h2 class="text-[15px] font-bold tracking-tight text-[#18181B]">
          Preferencias de notificación
        </h2>
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[13px] font-semibold text-[#18181B]">
              Resumen diario por email
            </p><p class="text-[11px] text-[#71717A]">
              Cada día a las 08:00
            </p>
          </div><label class="relative inline-flex items-center cursor-pointer"><input
            type="checkbox"
            checked
            class="sr-only peer"
          ><div class="w-9 h-5 bg-[#E4E4E7] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18181B]" /></label>
        </div>
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[13px] font-semibold text-[#18181B]">
              Alertas DIAN
            </p><p class="text-[11px] text-[#71717A]">
              Rechazos en tiempo real
            </p>
          </div><label class="relative inline-flex items-center cursor-pointer"><input
            type="checkbox"
            checked
            class="sr-only peer"
          ><div class="w-9 h-5 bg-[#E4E4E7] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18181B]" /></label>
        </div>
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[13px] font-semibold text-[#18181B]">
              Stock crítico
            </p><p class="text-[11px] text-[#71717A]">
              Cuando un SKU llega a 0
            </p>
          </div><label class="relative inline-flex items-center cursor-pointer"><input
            type="checkbox"
            class="sr-only peer"
          ><div class="w-9 h-5 bg-[#E4E4E7] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18181B]" /></label>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
