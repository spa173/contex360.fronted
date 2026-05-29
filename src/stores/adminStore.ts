import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdminSettings, TaxConfig } from '../types/admin'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'

const regionalRegistry = new WeakMap<Text, string>()
let regionalObserver: MutationObserver | null = null

function formatNodeText(node: Node, currencyType: string, dateFmt: string, exchangeRate: number) {
  if (node.nodeType === Node.TEXT_NODE) {
    const textNode = node as Text
    let orig = regionalRegistry.get(textNode)
    if (orig === undefined) {
      orig = textNode.nodeValue || ''
      if (orig.trim()) {
        regionalRegistry.set(textNode, orig)
      }
    }
    if (!orig.trim()) return

    let transformed = orig

    if (exchangeRate <= 0) return
    if (currencyType.includes('USD')) {
      transformed = transformed.replace(/\$(\s*)([\d,]+(?:\.\d+)?)(?:\s*COP)?/g, (match, space, numStr) => {
        const cleanNum = parseFloat(numStr.replace(/,/g, ''))
        if (isNaN(cleanNum) || cleanNum < 50) return match
        const usdVal = cleanNum / exchangeRate
        return `$${space}${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
      })
    } else {
      transformed = transformed.replace(/\$(\s*)([\d,]+(?:\.\d+)?)\s*USD/g, (match, space, numStr) => {
        const cleanNum = parseFloat(numStr.replace(/,/g, ''))
        if (isNaN(cleanNum)) return match
        const copVal = cleanNum * exchangeRate
        return `$${space}${copVal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} COP`
      })
    }

    transformed = transformed.replace(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g, (match, dd, mm, yyyy) => {
      if (dateFmt === 'MM/DD/YYYY') {
        return `${mm}/${dd}/${yyyy}`
      } else if (dateFmt === 'YYYY-MM-DD') {
        return `${yyyy}-${mm}-${dd}`
      }
      return `${dd}/${mm}/${yyyy}`
    })

    if (textNode.nodeValue !== transformed) {
      textNode.nodeValue = transformed
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return
    const childNodes = Array.from(el.childNodes)
    for (let i = 0; i < childNodes.length; i++) {
      formatNodeText(childNodes[i], currencyType, dateFmt, exchangeRate)
    }
  }
}

export const useAdminStore = defineStore('admin', () => {
  const ocrEnabled = ref(true)
  const razonSocial = ref('Andina Cargo SAS')
  const nit = ref('900.123.456-7')
  const language = ref('Español (Colombia)')
  const timezone = ref('(UTC-05) Bogotá')
  const currency = ref('COP · Peso colombiano')
  const dateFormat = ref('DD/MM/YYYY')
  const exchangeRate = ref(0)
  const defaultPaymentTerms = ref('Válido por 30 días. Pago del 50% al aceptar y 50% al entregar.')
  
  const taxes = ref<TaxConfig[]>([
    { id: 'iva', name: 'IVA', code: '01', type: 'Suma', rate: '19.00%', active: true },
    { id: 'retefuente', name: 'Retefuente', code: '06', type: 'Resta', rate: '2.50%', active: true },
    { id: 'reteica', name: 'ReteICA', code: '07', type: 'Resta', rate: '9.66‰', active: true },
  ])

  function applyRegionalFormatting() {
    if (typeof document !== 'undefined' && document.body) {
      formatNodeText(document.body, currency.value, dateFormat.value, exchangeRate.value)

      if (!regionalObserver) {
        regionalObserver = new MutationObserver((mutations) => {
          for (let i = 0; i < mutations.length; i++) {
            const addedNodes = Array.from(mutations[i].addedNodes)
            for (let j = 0; j < addedNodes.length; j++) {
              formatNodeText(addedNodes[j], currency.value, dateFormat.value, exchangeRate.value)
            }
          }
        })
        regionalObserver.observe(document.body, { childList: true, subtree: true, characterData: true })
      }
    }
  }

  async function loadSettings() {
    const stateStore = useStateStore()
    if (!stateStore.activeTenantId) return
    try {
      const tenant = await businessApi.getTenantDetails(stateStore.activeTenantId)
      razonSocial.value = tenant.name || 'Andina Cargo SAS'
      nit.value = tenant.nit || '900.123.456-7'
      
      const parsed = tenant.adminSettings || {}
      ocrEnabled.value = parsed.ocrEnabled ?? true
      language.value = parsed.language ?? 'Español (Colombia)'
      timezone.value = parsed.timezone ?? '(UTC-05) Bogotá'
      currency.value = parsed.currency ?? 'COP · Peso colombiano'
      dateFormat.value = parsed.dateFormat ?? 'DD/MM/YYYY'
      exchangeRate.value = parsed.exchangeRate ?? 0
      defaultPaymentTerms.value = parsed.defaultPaymentTerms ?? 'Válido por 30 días. Pago del 50% al aceptar y 50% al entregar.'
      if (parsed.taxes) taxes.value = parsed.taxes
    } catch (e) {
      console.error('Error loading admin settings', e)
    }
    applyRegionalFormatting()
  }

  async function saveSettings() {
    const stateStore = useStateStore()
    if (!stateStore.activeTenantId) return
    const payload = {
      ocrEnabled: ocrEnabled.value,
      language: language.value,
      timezone: timezone.value,
      currency: currency.value,
      dateFormat: dateFormat.value,
      exchangeRate: exchangeRate.value,
      defaultPaymentTerms: defaultPaymentTerms.value,
      taxes: taxes.value
    }
    try {
      await businessApi.updateTenant(stateStore.activeTenantId, {
        name: razonSocial.value,
        nit: nit.value,
        adminSettings: payload
      })
    } catch (e) {
      console.error('Error saving admin settings', e)
    }
    applyRegionalFormatting()
  }

  function toggleOcr() {
    ocrEnabled.value = !ocrEnabled.value
    saveSettings()
    return ocrEnabled.value
  }

  function addTax(tax: Omit<TaxConfig, 'id' | 'active'>) {
    taxes.value.push({
      id: tax.name.toLowerCase().replace(/\s+/g, '-'),
      name: tax.name,
      code: tax.code,
      type: tax.type,
      rate: tax.rate.includes('%') || tax.rate.includes('‰') ? tax.rate : `${tax.rate}%`,
      active: true
    })
    saveSettings()
  }

  return {
    ocrEnabled,
    razonSocial,
    nit,
    language,
    timezone,
    currency,
    dateFormat,
    exchangeRate,
    defaultPaymentTerms,
    taxes,
    loadSettings,
    saveSettings,
    toggleOcr,
    addTax,
    applyRegionalFormatting
  }
})
