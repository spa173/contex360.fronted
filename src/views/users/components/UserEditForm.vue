<script setup lang="ts">
import { ROLE_OPTIONS, useUsersStore } from '@/stores/usersStore'
import { reactive } from 'vue'

const props = defineProps<{
  isOpen: boolean
  canEdit: boolean
}>()

const emit = defineEmits<{
  submit: []
  toggle: []
}>()

const store = useUsersStore()

const ONBOARDING_TASK_OPTIONS = [
  'Ver video de bienvenida',
  'Leer manual de seguridad',
  'Configurar 2FA',
  'Completar perfil',
  'Revisar politicas de privacidad',
]

const form = reactive({
  name: '',
  email: '',
  password: '',
  status: 'active',
  title: '',
  role: ROLE_OPTIONS[0],
  initialTasks: [] as string[],
})

async function handleSubmit() {
  const result = await store.createUser({ ...form, tenantId: store.activeTenantId })
  if (result.ok) {
    // Reset form
    form.name = ''
    form.email = ''
    form.password = ''
    form.status = 'active'
    form.title = ''
    form.role = ROLE_OPTIONS[0]
    form.initialTasks = []
  }
  emit('submit')
}
</script>

<template>
  <article
    class="bg-[#131926] border border-slate-800/50 rounded-xl px-6 py-5 shadow-sm user-create-panel"
    :class="{ collapsed: !isOpen }"
  >
    <div class="card-head">
      <div>
        <p class="eyebrow">Alta controlada</p>
        <h3>Crear usuario con clave temporal</h3>
      </div>
      <button class="btn-sm" type="button" @click="$emit('toggle')">
        {{ isOpen ? 'Ocultar' : 'Mostrar' }}
      </button>
    </div>

    <form class="form-layout" @submit.prevent="handleSubmit">
      <fieldset class="form-fieldset" :disabled="!canEdit || !isOpen">
        <div class="field-grid three">
          <label class="field">
            <span>Nombre</span>
            <input v-model="form.name" placeholder="Ana Gomez" required type="text" />
          </label>
          <label class="field">
            <span>Email</span>
            <input v-model="form.email" placeholder="ana@contex360.local" required type="email" />
          </label>
          <label class="field">
            <span>Cargo</span>
            <input v-model="form.title" placeholder="Analista contable" required type="text" />
          </label>
        </div>

        <div class="field-grid three">
          <label class="field">
            <span>Clave temporal</span>
            <input
              v-model="form.password"
              autocomplete="new-password"
              placeholder="ClaveTemporal123"
              required
              type="password"
            />
          </label>
          <label class="field">
            <span>Rol inicial</span>
            <select v-model="form.role">
              <option v-for="role in ROLE_OPTIONS" :key="role" :value="role">{{ role }}</option>
            </select>
          </label>
          <label class="field">
            <span>Estado</span>
            <select v-model="form.status">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </label>
        </div>

        <label class="field">
          <span>Tareas iniciales</span>
          <select v-model="form.initialTasks" multiple>
            <option v-for="task in ONBOARDING_TASK_OPTIONS" :key="task" :value="task">{{ task }}</option>
          </select>
          <small>Selecciona una o varias tareas para el onboarding del usuario.</small>
        </label>

        <div class="form-actions">
          <button class="btn-primary" type="submit">Guardar usuario</button>
        </div>
      </fieldset>
    </form>
  </article>
</template>
