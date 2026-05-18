import { defineStore } from 'pinia'
import { ref } from 'vue'

const dictionaries: Record<string, Record<string, string>> = {
  en: {
    'Visión general': 'Overview',
    'Dashboard': 'Dashboard',
    'Facturación DIAN': 'DIAN Invoicing',
    'Facturación': 'Invoicing',
    'Cotizaciones': 'Quotes',
    'Compras & OCR': 'Purchases & OCR',
    'Compras': 'Purchases',
    'Inventario': 'Inventory',
    'Tesorería': 'Treasury',
    'Contabilidad': 'Accounting',
    'Terceros': 'Third Parties',
    'Usuarios & RBAC': 'Users & RBAC',
    'Usuarios': 'Users',
    'Configuración': 'Settings',
    'Consola Admin': 'Admin Console',
    'Consola de Administración': 'Administration Console',
    'Configuración global del sistema': 'Global system configuration',
    'Configuración global del sistema y preferencias de inteligencia artificial.': 'Global system configuration and artificial intelligence preferences.',
    'Empresa': 'Company',
    'General': 'General',
    'Impuestos': 'Taxes',
    'Integraciones': 'Integrations',
    'Logs': 'Logs',
    'Descartar': 'Discard',
    'Guardar': 'Save',
    'Identidad Corporativa': 'Corporate Identity',
    'Razón Social': 'Company Name',
    'NIT': 'Tax ID (NIT)',
    'ContexAI Global': 'ContexAI Global',
    'OCR Automático': 'Automatic OCR',
    'Procesar facturas con IA': 'Process invoices with AI',
    'Preferencias regionales': 'Regional Preferences',
    'Idioma': 'Language',
    'Zona horaria': 'Timezone',
    'Moneda': 'Currency',
    'Formato de fecha': 'Date Format',
    'Impuestos configurados': 'Configured Taxes',
    'Nuevo impuesto': 'New Tax',
    'Nombre': 'Name',
    'Código DIAN': 'DIAN Code',
    'Tipo': 'Type',
    'Tasa': 'Rate',
    'Activo': 'Active',
    'Suma': 'Add',
    'Resta': 'Subtract',
    'Conectado': 'Connected',
    'Facturación electrónica directa': 'Direct electronic invoicing',
    'Configurar Parámetros DIAN': 'Configure DIAN Parameters',
    'Conciliación bancaria en tiempo real': 'Real-time bank reconciliation',
    'Configurar Cuentas Bancarias': 'Configure Bank Accounts',
    'Explorar integraciones': 'Explore Integrations',
    '+24 conectores disponibles': '+24 connectors available',
    'Auditoría del Sistema y Cambios Globales': 'System Audit and Global Changes',
    'Usuario': 'User',
    'Acción': 'Action',
    'Entidad': 'Entity',
    'Fecha': 'Date',
    'Buscar...': 'Search...',
    'Mi perfil': 'My Profile',
    'Seguridad y 2FA': 'Security & 2FA',
    'Preferencias': 'Preferences',
    'Centro de ayuda': 'Help Center',
    'Cerrar sesión': 'Sign Out',
    'Workspace activo': 'Active Workspace',
    'Tema': 'Theme',
    'Claro': 'Light',
    'Oscuro': 'Dark',
    'Auto': 'Auto',
    'Marcar todas como leídas': 'Mark all as read',
    'Exportar historial en PDF': 'Export history to PDF',
    'Exportar': 'Export',
    'Filtrar': 'Filter',
    'Estado': 'Status',
    'Acciones': 'Actions',
    'Ingresos': 'Income',
    'Egresos': 'Expenses',
    'Flujo de caja': 'Cash Flow',
    'Balance General': 'Balance Sheet',
    'Estado de Resultados': 'Income Statement',
    'Aprobado por IA': 'AI Approved',
    'Pendiente': 'Pending',
    'Aprobado': 'Approved',
    'Rechazado': 'Rejected',
    'Ver todas': 'View all',
    'No hay notificaciones para mostrar': 'No notifications to display',
    'Ver todas las alertas': 'View all alerts',
    'Andina Cargo SAS': 'Andina Cargo SAS',
    'Daniel Castro': 'Daniel Castro',
    'Administrador': 'Administrator'
  },
  pt: {
    'Visión general': 'Visão geral',
    'Dashboard': 'Painel',
    'Facturación DIAN': 'Faturamento DIAN',
    'Facturación': 'Faturamento',
    'Cotizaciones': 'Cotações',
    'Compras & OCR': 'Compras e OCR',
    'Compras': 'Compras',
    'Inventario': 'Estoque',
    'Tesorería': 'Tesouraria',
    'Contabilidad': 'Contabilidade',
    'Terceros': 'Terceiros',
    'Usuarios & RBAC': 'Usuários e RBAC',
    'Usuarios': 'Usuários',
    'Configuración': 'Configurações',
    'Consola Admin': 'Console Admin',
    'Consola de Administración': 'Console de Administração',
    'Configuración global del sistema': 'Configuração global do sistema',
    'Configuración global del sistema y preferencias de inteligencia artificial.': 'Configuração global do sistema e preferências de inteligência artificial.',
    'Empresa': 'Empresa',
    'General': 'Geral',
    'Impuestos': 'Impostos',
    'Integraciones': 'Integrações',
    'Logs': 'Registros',
    'Descartar': 'Descartar',
    'Guardar': 'Salvar',
    'Identidad Corporativa': 'Identidade Corporativa',
    'Razón Social': 'Razão Social',
    'NIT': 'CNPJ (NIT)',
    'ContexAI Global': 'ContexAI Global',
    'OCR Automático': 'OCR Automático',
    'Procesar facturas con IA': 'Processar faturas com IA',
    'Preferencias regionales': 'Preferências Regionais',
    'Idioma': 'Idioma',
    'Zona horaria': 'Fuso Horário',
    'Moneda': 'Moeda',
    'Formato de fecha': 'Formato de Data',
    'Impuestos configurados': 'Impostos Configurados',
    'Nuevo impuesto': 'Novo Imposto',
    'Nombre': 'Nome',
    'Código DIAN': 'Código DIAN',
    'Tipo': 'Tipo',
    'Tasa': 'Taxa',
    'Activo': 'Ativo',
    'Suma': 'Somar',
    'Resta': 'Subtrair',
    'Conectado': 'Conectado',
    'Facturación electrónica directa': 'Faturamento eletrônico direto',
    'Configurar Parámetros DIAN': 'Configurar Parâmetros DIAN',
    'Conciliación bancaria en tiempo real': 'Conciliação bancária em tempo real',
    'Configurar Cuentas Bancarias': 'Configurar Contas Bancárias',
    'Explorar integraciones': 'Explorar Integrações',
    '+24 conectores disponibles': '+24 conectores disponíveis',
    'Auditoría del Sistema y Cambios Globales': 'Auditoria do Sistema e Mudanças Globais',
    'Usuario': 'Usuário',
    'Acción': 'Ação',
    'Entidad': 'Entidade',
    'Fecha': 'Data',
    'Buscar...': 'Buscar...',
    'Mi perfil': 'Meu Perfil',
    'Seguridad y 2FA': 'Segurança e 2FA',
    'Preferencias': 'Preferências',
    'Centro de ayuda': 'Central de Ajuda',
    'Cerrar sesión': 'Sair',
    'Workspace activo': 'Espaço Ativo',
    'Tema': 'Tema',
    'Claro': 'Claro',
    'Oscuro': 'Escuro',
    'Auto': 'Auto',
    'Marcar todas como leídas': 'Marcar todas como lidas',
    'Exportar historial en PDF': 'Exportar histórico em PDF',
    'Exportar': 'Exportar',
    'Filtrar': 'Filtrar',
    'Estado': 'Status',
    'Acciones': 'Ações',
    'Ingresos': 'Receitas',
    'Egresos': 'Despesas',
    'Flujo de caja': 'Fluxo de Caixa',
    'Balance General': 'Balanço Patrimonial',
    'Estado de Resultados': 'Demonstração de Resultados',
    'Aprobado por IA': 'Aprovado por IA',
    'Pendiente': 'Pendente',
    'Aprobado': 'Aprovado',
    'Rechazado': 'Rejeitado',
    'Ver todas': 'Ver todas',
    'No hay notificaciones para mostrar': 'Nenhuma notificação para exibir',
    'Ver todas las alertas': 'Ver todas as alertas',
    'Andina Cargo SAS': 'Andina Cargo SAS',
    'Daniel Castro': 'Daniel Castro',
    'Administrador': 'Administrador'
  }
}

// Global text node original content registry
const textRegistry = new WeakMap<Text, string>()
let observer: MutationObserver | null = null

function walkAndTranslate(node: Node, lang: string) {
  if (node.nodeType === Node.TEXT_NODE) {
    const textNode = node as Text
    let orig = textRegistry.get(textNode)
    if (orig === undefined) {
      orig = textNode.nodeValue || ''
      if (orig.trim()) {
        textRegistry.set(textNode, orig)
      }
    }
    const trimmed = orig.trim()
    if (trimmed) {
      if (lang === 'es') {
        if (textNode.nodeValue !== orig) {
          textNode.nodeValue = orig
        }
      } else {
        const dict = dictionaries[lang] || {}
        if (dict[trimmed]) {
          const trans = orig.replace(trimmed, dict[trimmed])
          if (textNode.nodeValue !== trans) {
            textNode.nodeValue = trans
          }
        }
      }
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      if (!el.dataset.origPlaceholder && el.placeholder) {
        el.dataset.origPlaceholder = el.placeholder
      }
      const origP = el.dataset.origPlaceholder
      if (origP) {
        if (lang === 'es') {
          el.placeholder = origP
        } else {
          const dict = dictionaries[lang] || {}
          if (dict[origP]) el.placeholder = dict[origP]
        }
      }
    }
    const childNodes = Array.from(el.childNodes)
    for (let i = 0; i < childNodes.length; i++) {
      walkAndTranslate(childNodes[i], lang)
    }
  }
}

export const useTranslationStore = defineStore('translation', {
  state: () => ({
    currentLanguage: 'es',
    translations: {} as Record<string, string>,
    isTranslating: false,
    availableLanguages: [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' },
      { code: 'pt', name: 'Português' }
    ]
  }),

  actions: {
    setLanguage(langCode: string) {
      const code = langCode.toLowerCase()
      this.currentLanguage = code
      localStorage.setItem('contex_app_language', code)

      if (typeof document !== 'undefined') {
        walkAndTranslate(document.body, code)

        if (!observer) {
          observer = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; i++) {
              const addedNodes = Array.from(mutations[i].addedNodes)
              for (let j = 0; j < addedNodes.length; j++) {
                walkAndTranslate(addedNodes[j], this.currentLanguage)
              }
            }
          })
          observer.observe(document.body, { childList: true, subtree: true, characterData: true })
        }
      }
    },

    initLanguage() {
      const saved = localStorage.getItem('contex_app_language') || 'es'
      this.setLanguage(saved)
    },

    t(key: string, defaultValue: string) {
      if (this.currentLanguage === 'es') return defaultValue
      const dict = dictionaries[this.currentLanguage] || {}
      return dict[key] || defaultValue
    }
  }
})
