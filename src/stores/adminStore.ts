import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const ocrEnabled = ref(true)
  const razonSocial = ref('Andina Cargo SAS')
  const nit = ref('900.123.456-7')
  const language = ref('Español (Colombia)')
  const timezone = ref('(UTC-05) Bogotá')
  const currency = ref('COP · Peso colombiano')
  const dateFormat = ref('DD/MM/YYYY')
  
  const taxes = ref([
    { id: 'iva', name: 'IVA', code: '01', type: 'Suma', rate: '19.00%', active: true },
    { id: 'retefuente', name: 'Retefuente', code: '06', type: 'Resta', rate: '2.50%', active: true },
    { id: 'reteica', name: 'ReteICA', code: '07', type: 'Resta', rate: '9.66‰', active: true },
  ])

  function loadSettings() {
    const saved = localStorage.getItem('contex_admin_settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        ocrEnabled.value = parsed.ocrEnabled ?? true
        razonSocial.value = parsed.razonSocial ?? 'Andina Cargo SAS'
        nit.value = parsed.nit ?? '900.123.456-7'
        language.value = parsed.language ?? 'Español (Colombia)'
        timezone.value = parsed.timezone ?? '(UTC-05) Bogotá'
        currency.value = parsed.currency ?? 'COP · Peso colombiano'
        dateFormat.value = parsed.dateFormat ?? 'DD/MM/YYYY'
        if (parsed.taxes) taxes.value = parsed.taxes
      } catch (e) {
        console.error('Error loading admin settings', e)
      }
    }
  }

  function saveSettings() {
    const payload = {
      ocrEnabled: ocrEnabled.value,
      razonSocial: razonSocial.value,
      nit: nit.value,
      language: language.value,
      timezone: timezone.value,
      currency: currency.value,
      dateFormat: dateFormat.value,
      taxes: taxes.value
    }
    localStorage.setItem('contex_admin_settings', JSON.stringify(payload))
  }

  function toggleOcr() {
    ocrEnabled.value = !ocrEnabled.value
    saveSettings()
    return ocrEnabled.value
  }

  return {
    ocrEnabled,
    razonSocial,
    nit,
    language,
    timezone,
    currency,
    dateFormat,
    taxes,
    loadSettings,
    saveSettings,
    toggleOcr
  }
})
