<script setup>
import { computed, reactive, watch } from 'vue'
import { useThirdPartiesStore } from '../../stores/thirdPartiesStore'
import { mapKindLabel } from '../../utils/ui'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['notify'])
const store = useThirdPartiesStore()

const thirdPartyForm = reactive({
  kind: 'client',
  name: '',
  nit: '',
  email: '',
  taxProfile: '',
})

function resetForm() {
  thirdPartyForm.kind = 'client'
  thirdPartyForm.name = ''
  thirdPartyForm.nit = ''
  thirdPartyForm.email = ''
  thirdPartyForm.taxProfile = ''
}

watch(
  () => store.activeTenantId,
  () => {
    resetForm()
  },
  { immediate: true },
)

const canThirdParties = computed(() => store.canManageThirdParties)

const permissionNote = computed(() =>
  canThirdParties.value
    ? 'Tu rol puede registrar y editar terceros en este tenant.'
    : 'Modo solo lectura. Tu rol activo no puede crear terceros.',
)

const sortedThirdParties = computed(() =>
  [...(store.tenantThirdParties || [])].sort((left, right) => (left.name || '').localeCompare(right.name || '', 'es')),
)

function handleSubmit() {
  const result = store.createThirdParty(thirdPartyForm)

  emit('notify', {
    message: result.message,
    detail: result.detail || '',
  })

  if (result.ok) {
    resetForm()
  }
}
</script>

<template>
  <section :class="['view', { active: isActive }]">
    <div class="two-column">
      <article class="panel-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">Base maestra</p>
            <h3>Registrar tercero</h3>
          </div>
        </div>

        <p class="permission-note">{{ permissionNote }}</p>

        <form class="form-layout" @submit.prevent="handleSubmit">
          <fieldset class="form-fieldset" :disabled="!canThirdParties">
            <div class="field-grid two">
              <label class="field">
                <span>Tipo</span>
                <select v-model="thirdPartyForm.kind">
                  <option value="client">Cliente</option>
                  <option value="provider">Proveedor</option>
                  <option value="employee">Empleado</option>
                </select>
              </label>

              <label class="field">
                <span>Nombre / razon social</span>
                <input v-model="thirdPartyForm.name" placeholder="Cliente Demo SAS" required type="text" />
              </label>
            </div>

            <div class="field-grid two">
              <label class="field">
                <span>NIT / identificacion</span>
                <input v-model="thirdPartyForm.nit" placeholder="900123456-7" required type="text" />
              </label>

              <label class="field">
                <span>Email</span>
                <input v-model="thirdPartyForm.email" placeholder="contacto@empresa.co" required type="email" />
              </label>
            </div>

            <label class="field">
              <span>Perfil tributario</span>
              <input
                v-model="thirdPartyForm.taxProfile"
                placeholder="Responsable de IVA"
                required
                type="text"
              />
            </label>

            <div class="form-actions">
              <button class="primary-button" type="submit">Guardar tercero</button>
            </div>
          </fieldset>
        </form>
      </article>

      <article class="panel-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">Catalogo por empresa</p>
            <h3>Terceros disponibles</h3>
          </div>
        </div>

        <div v-if="sortedThirdParties.length" class="table-card">
          <div class="table-header">
            <span>Tercero</span>
            <span>Tipo</span>
            <span>NIT</span>
            <span>Email</span>
          </div>
          <div v-for="party in sortedThirdParties" :key="party.id" class="table-row">
            <div>
              <p>{{ party.name }}</p>
              <p class="label-soft">{{ party.taxProfile }}</p>
            </div>
            <span class="small-pill">{{ mapKindLabel(party.kind) }}</span>
            <span>{{ party.nit }}</span>
            <span>{{ party.email }}</span>
          </div>
        </div>
        <p v-else class="empty-state">No hay terceros configurados para esta empresa.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.form-fieldset {
  border: 0;
  display: grid;
  gap: 20px;
  margin: 0;
  min-inline-size: 0;
  padding: 0;
}
</style>
