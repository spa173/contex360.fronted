<script setup>
import { computed, reactive, watch } from 'vue'
import { useThirdPartiesStore } from '../../stores/thirdPartiesStore'
import { mapKindLabel } from '../../utils/ui'
import { businessApi } from '../../services/businessApi'

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
  phone: '',
  address: '',
  city: '',
  taxProfile: '',
  taxRegime: 'comun',
  fiscalResponsibilities: [],
})

function resetForm() {
  thirdPartyForm.kind = 'client'
  thirdPartyForm.name = ''
  thirdPartyForm.nit = ''
  thirdPartyForm.email = ''
  thirdPartyForm.phone = ''
  thirdPartyForm.address = ''
  thirdPartyForm.city = ''
  thirdPartyForm.taxProfile = ''
  thirdPartyForm.taxRegime = 'comun'
  thirdPartyForm.fiscalResponsibilities = []
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

async function handleSubmit() {
  try {
    // Convertir fiscalResponsibilities de string a array
    const formData = {
      ...thirdPartyForm,
      fiscalResponsibilities: thirdPartyForm.fiscalResponsibilities
        ? thirdPartyForm.fiscalResponsibilities.split(',').map(s => s.trim()).filter(Boolean)
        : []
    }
    
    const result = await businessApi.createThirdParty(formData, store.activeTenantId)
    
    emit('notify', {
      message: 'Tercero creado exitosamente',
      detail: result.name || '',
    })
    
    await store.fetchThirdParties()
    resetForm()
  } catch (error) {
    const msg = error?.message || 'Intente nuevamente'
    emit('notify', {
      message: 'Error al crear tercero',
      detail: msg,
    })
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

            <div class="field-grid two">
              <label class="field">
                <span>Telefono</span>
                <input v-model="thirdPartyForm.phone" placeholder="+57 300 123 4567" type="tel" />
              </label>

              <label class="field">
                <span>Ciudad / Municipio</span>
                <input v-model="thirdPartyForm.city" placeholder="Bogota D.C." type="text" />
              </label>
            </div>

            <label class="field">
              <span>Direccion</span>
              <input v-model="thirdPartyForm.address" placeholder="Calle 123 # 45-67, Barrio Centro" type="text" />
            </label>

            <div class="field-grid two">
              <label class="field">
                <span>Regimen tributario</span>
                <select v-model="thirdPartyForm.taxRegime">
                  <option value="simplificado">Simplificado</option>
                  <option value="comun">Comun</option>
                  <option value="especial">Especial</option>
                </select>
              </label>

              <label class="field">
                <span>Perfil tributario</span>
                <input
                  v-model="thirdPartyForm.taxProfile"
                  placeholder="Responsable de IVA"
                  required
                  type="text"
                />
              </label>
            </div>

            <label class="field">
              <span>Responsabilidades fiscales DIAN (separadas por coma)</span>
              <input v-model="thirdPartyForm.fiscalResponsibilities" placeholder="R-99-PN, 48, 49" type="text" />
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
            <span>Contacto</span>
            <span>Ubicacion</span>
          </div>
          <div v-for="party in sortedThirdParties" :key="party.id" class="table-row">
            <div>
              <p>{{ party.name }}</p>
              <p class="label-soft">{{ party.taxProfile }} | {{ party.taxRegime }}</p>
            </div>
            <span class="small-pill">{{ mapKindLabel(party.kind) }}</span>
            <span>{{ party.nit }}</span>
            <div>
              <p>{{ party.email }}</p>
              <p v-if="party.phone" class="label-soft">{{ party.phone }}</p>
            </div>
            <div>
              <p v-if="party.city">{{ party.city }}</p>
              <p v-if="party.address" class="label-soft text-truncate">{{ party.address }}</p>
            </div>
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
