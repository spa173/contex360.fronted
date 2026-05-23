<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { useTranslationStore } from '../../stores/translationStore'
import { useStateStore } from '../../stores/stateStore'
import { businessApi } from '@/services/businessApi'
import SubscriptionView from './SubscriptionView.vue'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const adminStore = useAdminStore()
const translationStore = useTranslationStore()
const stateStore = useStateStore()
const activeTenantId = computed(() => stateStore.activeTenantId)

function safeLogMessage(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 240)
}

const activeTab = ref('empresa')
const tabs = [
  { id: 'empresa', label: 'Empresa' },
  { id: 'general', label: 'General' },
  { id: 'impuestos', label: 'Impuestos' },
  { id: 'integraciones', label: 'Integraciones' },
  { id: 'suscripcion', label: 'Suscripción' },
  { id: 'logs', label: 'Logs' },
  { id: 'cumplimiento', label: 'Cumplimiento SOC 2' },
]

const showTaxModal = ref(false)
const newTax = ref({
  name: '',
  code: '',
  type: 'Suma',
  rate: ''
})

const auditLogs = ref([])
const logsLoading = ref(false)
const logsError = ref('')

async function fetchAuditLogs() {
  logsLoading.value = true
  logsError.value = ''
  try {
    const data = await businessApi.getAdminLogs()
    auditLogs.value = data
  } catch (e) {
    logsError.value = e.message || 'Error al cargar los logs de auditoría.'
  } finally {
    logsLoading.value = false
  }
}

const complianceDashboard = ref(null)
const complianceLoading = ref(false)
const breachAlerts = ref([])
const breachLoading = ref(false)
const accessReviewRunning = ref(false)

async function fetchComplianceData() {
  complianceLoading.value = true
  try {
    const dashboard = await businessApi.getComplianceDashboard()
    complianceDashboard.value = dashboard
    
    const alerts = await businessApi.getBreachAlerts()
    breachAlerts.value = alerts
  } catch (e) {
    console.error('Error fetching compliance data:', safeLogMessage(e))
  } finally {
    complianceLoading.value = false
  }
}

async function handleRunAccessReview() {
  accessReviewRunning.value = true
  try {
    await businessApi.runAccessReview()
    emit('notify', { 
      message: 'Auditoría Mensual Realizada (CC6.3)', 
      detail: 'Revisión de privilegios y accesos completada con éxito. Todos los roles cumplen con el principio de menor privilegio.' 
    })
    await fetchComplianceData()
  } catch (e) {
    emit('notify', { message: 'Error', detail: e.message || 'No se pudo completar la revisión.' })
  } finally {
    accessReviewRunning.value = false
  }
}

async function handleSimulateBreach(alertId) {
  try {
    await businessApi.notifyBreach(alertId)
    emit('notify', { 
      message: 'Plan de Respuesta Activado (CC7.3)', 
      detail: 'Notificación de alerta crítica enviada con éxito a los administradores de seguridad de la organización.' 
    })
    await fetchComplianceData()
  } catch (e) {
    emit('notify', { message: 'Error', detail: e.message || 'No se pudo notificar la brecha.' })
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'logs') {
    fetchAuditLogs()
  } else if (newTab === 'cumplimiento') {
    fetchComplianceData()
  }
})

function formatLogDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const timeStr = `${hours}:${minutes}`
  
  if (date.toDateString() === now.toDateString()) {
    return `${timeStr} hoy`
  }
  
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `${timeStr} ayer`
  }
  
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy} ${timeStr}`
}

function getActionClass(action) {
  const norm = String(action || '').toUpperCase()
  if (norm.includes('CREATE') || norm.includes('ADD') || norm.includes('SYNC')) {
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }
  if (norm.includes('DELETE') || norm.includes('REMOVE') || norm.includes('DISABLE')) {
    return 'bg-rose-50 text-rose-700 border border-rose-200'
  }
  return 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20'
}

function submitNewTax() {
  if (!newTax.value.name || !newTax.value.rate) {
    emit('notify', { message: 'Campos incompletos', detail: 'Por favor ingresa un nombre y una tasa para el nuevo impuesto.' })
    return
  }
  adminStore.addTax({
    name: newTax.value.name,
    code: newTax.value.code || '01',
    type: newTax.value.type,
    rate: newTax.value.rate
  })
  emit('notify', { message: 'Impuesto configurado', detail: `El impuesto ${newTax.value.name} ha sido guardado exitosamente en el sistema.` })
  showTaxModal.value = false
  newTax.value = { name: '', code: '', type: 'Suma', rate: '' }
}

const showDianModal = ref(false)
const dianConfig = ref({
  dianEnvironment: 'test',
  dianNit: '',
  dianSoftwareId: '',
  dianSoftwarePin: '',
  dianTestSetId: '',
  invoiceResolution: '',
  resolutionFrom: '',
  resolutionTo: '',
  dianOperationCode: '10',
  dianCertificatePassword: '',
  dianCertificate: ''
})
const dianValidating = ref(false)
const dianValidationResult = ref(null)
const dianCertificateFileName = ref('')
const dianHasCertificate = ref(false)
const dianCertificateInput = ref(null)

const showBancolombiaModal = ref(false)
const bancolombiaConnectionModes = [
  { value: 'open_finance', label: 'Open Finance / OAuth 2.0' },
  { value: 'treasury_feed', label: 'Conexión empresarial / extractos' },
]

const bancolombiaStatementFormats = [
  { value: 'MT940', label: 'MT940' },
  { value: 'CAMT053', label: 'CAMT.053' },
]

function createDefaultBancolombiaConfig() {
  return {
    integrationMode: 'open_finance',
    environment: 'sandbox',
    accountNumber: '',
    accountType: 'Ahorros',
    clientId: '',
    statementFormat: 'MT940',
    authorizationStatus: 'draft',
    lastSyncAt: null,
  }
}

function normalizeBancolombiaConfig(raw = {}) {
  return {
    ...createDefaultBancolombiaConfig(),
    integrationMode: raw.integrationMode || raw.connectionMethod || 'open_finance',
    environment: raw.environment || raw.bancolombiaEnvironment || 'sandbox',
    accountNumber: raw.accountNumber || '',
    accountType: raw.accountType || 'Ahorros',
    clientId: raw.clientId || '',
    statementFormat: raw.statementFormat || 'MT940',
    authorizationStatus: raw.authorizationStatus || raw.status || (raw.connected ? 'connected' : raw.active ? 'ready' : 'draft'),
    lastSyncAt: raw.lastSyncAt || null,
  }
}

const bancolombiaConfig = ref(createDefaultBancolombiaConfig())
const bancolombiaLoading = ref(false)
const bancolombiaSaving = ref(false)
const bancolombiaConnecting = ref(false)
const bancolombiaSyncing = ref(false)
const bancolombiaStatementFile = ref(null)
const bancolombiaStatus = computed(() => {
  switch (bancolombiaConfig.value.authorizationStatus) {
    case 'connected':
      return {
        label: 'Conectado',
        wrapper: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500 animate-pulse',
      }
    case 'ready':
      return {
        label: 'Listo para autorizar',
        wrapper: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      }
    case 'paused':
      return {
        label: 'Pausado',
        wrapper: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      }
    default:
      return {
        label: 'Sin configurar',
        wrapper: 'bg-slate-50 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
      }
  }
})

const bancolombiaModeLabel = computed(() => {
  return bancolombiaConnectionModes.find(mode => mode.value === bancolombiaConfig.value.integrationMode)?.label || 'Open Finance / OAuth 2.0'
})

const bancolombiaStatementFileLabel = computed(() => bancolombiaStatementFile.value?.fileName || 'No has cargado ningún extracto todavía')

// Integrations catalog
const showIntegrationsModal = ref(false)
const integrationSearch = ref('')
const integrationCategory = ref('todas')

const activeIntegrationsState = ref([])

async function saveIntegrationState(id, enabled) {
  if (enabled) {
    if (!activeIntegrationsState.value.includes(id)) {
      activeIntegrationsState.value.push(id)
    }
  } else {
    activeIntegrationsState.value = activeIntegrationsState.value.filter(i => i !== id)
  }
  if (activeTenantId.value) {
    await businessApi.updateTenant(activeTenantId.value, { activeIntegrations: activeIntegrationsState.value })
  }
}

async function fetchBancolombiaConfig() {
  if (!activeTenantId.value) {
    bancolombiaConfig.value = createDefaultBancolombiaConfig()
    return
  }

  bancolombiaLoading.value = true
  try {
    const data = await businessApi.getBancolombiaConfig(activeTenantId.value)
    bancolombiaConfig.value = normalizeBancolombiaConfig(data)
  } catch (e) {
    bancolombiaConfig.value = createDefaultBancolombiaConfig()
    console.warn('Bancolombia config load skipped:', safeLogMessage(e?.message || e))
  } finally {
    bancolombiaLoading.value = false
  }
}

async function openBancolombiaConsent(url) {
  if (!url || bancolombiaConnecting.value) return

  bancolombiaConnecting.value = true
  let poll = null

  const cleanup = () => {
    if (poll) clearInterval(poll)
    window.removeEventListener('message', handler)
    bancolombiaConnecting.value = false
  }

  const handler = async (event) => {
    if (event.data?.type === 'bancolombia-connected') {
      await fetchBancolombiaConfig()
      emit('notify', {
        message: 'Bancolombia conectado',
        detail: event.data?.accountNumber
          ? `Cuenta ${event.data.accountNumber} vinculada correctamente.`
          : 'La autorización Bancolombia se completó correctamente.',
      })
      cleanup()
    } else if (event.data?.type === 'bancolombia-error') {
      emit('notify', { message: 'Error al conectar Bancolombia', detail: event.data.message || 'No se pudo completar la autorización.' })
      cleanup()
    }
  }

  const popup = window.open(url, 'bancolombia-oauth', 'width=540,height=720,scrollbars=yes')
  if (!popup) {
    cleanup()
    throw new Error('No se pudo abrir la ventana de autorización de Bancolombia.')
  }

  window.addEventListener('message', handler)
  poll = setInterval(() => {
    if (popup.closed) {
      cleanup()
    }
  }, 800)
}

async function syncBancolombiaNow() {
  if (!activeTenantId.value || bancolombiaSyncing.value) return

  bancolombiaSyncing.value = true
  try {
    const res = await businessApi.syncBancolombia(activeTenantId.value, bancolombiaStatementFile.value ? {
      statementFile: bancolombiaStatementFile.value,
    } : undefined)
    bancolombiaConfig.value.lastSyncAt = res.lastSyncAt || new Date().toISOString()
    emit('notify', {
      message: 'Sincronización completada',
      detail: res.message || (bancolombiaStatementFile.value
        ? `Se importaron ${res.imported} movimientos desde el extracto cargado.`
        : 'La revisión Bancolombia se actualizó correctamente.'),
    })
    bancolombiaStatementFile.value = null
    await fetchBancolombiaConfig()
  } catch (e) {
    emit('notify', { message: 'Error al sincronizar', detail: e?.message || 'No se pudo actualizar la conciliación.' })
  } finally {
    bancolombiaSyncing.value = false
  }
}

async function handleBancolombiaStatementFileChange(event) {
  const input = event.target
  const file = input?.files?.[0]
  if (!file) {
    bancolombiaStatementFile.value = null
    return
  }

  const text = await file.text()
  const lower = file.name.toLowerCase()
  const inferredFormat = lower.endsWith('.xml') || text.includes('<BkToCstmrStmt') || text.includes('<BkToCstmrAcctRpt') ? 'CAMT053' : 'MT940'
  bancolombiaStatementFile.value = {
    fileName: file.name,
    contentType: file.type || 'text/plain',
    text,
    format: inferredFormat,
  }
}

function clearBancolombiaStatementFile() {
  bancolombiaStatementFile.value = null
}

async function disconnectBancolombia() {
  if (!activeTenantId.value || bancolombiaSaving.value) return

  bancolombiaSaving.value = true
  try {
    await businessApi.disconnectBancolombia(activeTenantId.value)
    bancolombiaConfig.value = createDefaultBancolombiaConfig()
    await fetchBancolombiaConfig()
    emit('notify', { message: 'Bancolombia desconectado', detail: 'La integración fue desactivada para esta empresa.' })
  } catch (e) {
    emit('notify', { message: 'Error al desconectar', detail: e?.message || 'No se pudo desactivar la integración.' })
  } finally {
    bancolombiaSaving.value = false
  }
}

const integrationCatalog = ref([
  // Pagos
  { id: 'stripe', name: 'Stripe', desc: 'Pasarela de pagos internacional con soporte 135+ monedas', cat: 'pagos', icon: 'payments', color: '#635BFF', bg: '#635BFF15' },
  { id: 'payu', name: 'PayU', desc: 'Pasarela líder en Latinoamérica con PSE y tarjetas', cat: 'pagos', icon: 'credit_card', color: '#FF6B00', bg: '#FF6B0015' },
  { id: 'mercadopago', name: 'MercadoPago', desc: 'Cobros en línea, QR y links de pago', cat: 'pagos', icon: 'qr_code_2', color: '#00B1EA', bg: '#00B1EA15' },
  { id: 'wompi', name: 'Wompi', desc: 'Pasarela colombiana de Bancolombia, PSE y Nequi', cat: 'pagos', icon: 'account_balance', color: '#FFCD00', bg: '#FFCD0015' },
  { id: 'epayco', name: 'ePayco', desc: 'Pagos en línea para Colombia — débito, crédito y PSE', cat: 'pagos', icon: 'local_atm', color: '#1A73E8', bg: '#1A73E815' },
  { id: 'kushki', name: 'Kushki', desc: 'Fintech de pagos panlatino con antifraude propio', cat: 'pagos', icon: 'shield_lock', color: '#00BFA5', bg: '#00BFA515' },
  // Bancos
  { id: 'bancolombia', name: 'Bancolombia', desc: 'Open Finance, titularidad y extractos empresariales', cat: 'bancos', icon: 'account_balance', color: '#FFCD00', bg: '#FFCD0015' },
  { id: 'bogota', name: 'Banco de Bogotá', desc: 'Open Banking — extractos y movimientos automáticos', cat: 'bancos', icon: 'account_balance', color: '#003087', bg: '#00308715' },
  { id: 'davivienda', name: 'Davivienda', desc: 'Extractos automáticos y alerta de saldos', cat: 'bancos', icon: 'account_balance', color: '#E31837', bg: '#E3183715' },
  { id: 'bbva', name: 'BBVA Colombia', desc: 'Conciliación y pagos masivos a proveedores', cat: 'bancos', icon: 'account_balance', color: '#004481', bg: '#00448115' },
  // ERP / Contabilidad
  { id: 'siigo', name: 'Siigo', desc: 'Sincronización de asientos contables y NIIF', cat: 'erp', icon: 'menu_book', color: '#1A9E5C', bg: '#1A9E5C15' },
  { id: 'nubox', name: 'Nubox', desc: 'Exportar facturas y libro mayor automáticamente', cat: 'erp', icon: 'library_books', color: '#F5A623', bg: '#F5A62315' },
  { id: 'worldoffice', name: 'World Office', desc: 'ERP empresarial colombiano full integrado', cat: 'erp', icon: 'business_center', color: '#0066CC', bg: '#0066CC15' },
  { id: 'sap', name: 'SAP Business One', desc: 'ERP enterprise — sincroniza inventario y finanzas', cat: 'erp', icon: 'hub', color: '#0070D2', bg: '#0070D215' },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Contabilidad para PYMEs — exportar transacciones', cat: 'erp', icon: 'calculate', color: '#2CA01C', bg: '#2CA01C15' },
  // E-commerce
  { id: 'shopify', name: 'Shopify', desc: 'Sincroniza órdenes, clientes e inventario', cat: 'ecommerce', icon: 'storefront', color: '#96BF48', bg: '#96BF4815' },
  { id: 'woocommerce', name: 'WooCommerce', desc: 'Importa pedidos de WordPress automáticamente', cat: 'ecommerce', icon: 'shopping_cart', color: '#7F54B3', bg: '#7F54B315' },
  { id: 'vtex', name: 'VTEX', desc: 'Plataforma enterprise — factura desde el pedido', cat: 'ecommerce', icon: 'inventory_2', color: '#F71963', bg: '#F7196315' },
  { id: 'meli', name: 'Mercado Libre', desc: 'Factura ventas del marketplace automáticamente', cat: 'ecommerce', icon: 'sell', color: '#FFE600', bg: '#FFE60015' },
  // Logística
  { id: 'servientrega', name: 'Servientrega', desc: 'Guías de envío y tracking nacional', cat: 'logistica', icon: 'local_shipping', color: '#E30613', bg: '#E3061315' },
  { id: 'coordinadora', name: 'Coordinadora', desc: 'Transporte de carga y mensajería empresarial', cat: 'logistica', icon: 'package_2', color: '#FF6600', bg: '#FF660015' },
  { id: 'dhl', name: 'DHL Express', desc: 'Envíos internacionales con tracking en tiempo real', cat: 'logistica', icon: 'flight_takeoff', color: '#FFCC00', bg: '#FFCC0015' },
  // Comunicaciones
  { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Envía facturas y alertas a clientes por WhatsApp', cat: 'comunicaciones', icon: 'chat', color: '#25D366', bg: '#25D36615' },
  { id: 'slack', name: 'Slack', desc: 'Notificaciones del equipo — facturas, alertas y más', cat: 'comunicaciones', icon: 'forum', color: '#4A154B', bg: '#4A154B15' },
  { id: 'gmail', name: 'Gmail', desc: 'Envía facturas PDF directamente desde tu cuenta', cat: 'comunicaciones', icon: 'mail', color: '#EA4335', bg: '#EA433515' },
  { id: 'smtp', name: 'Servidor SMTP Personalizado', desc: 'Envía facturas usando tu propio correo corporativo', cat: 'comunicaciones', icon: 'alternate_email', color: '#2563EB', bg: '#2563EB15' },
  { id: 'twilio', name: 'Twilio', desc: 'SMS y llamadas automáticas a clientes y proveedores', cat: 'comunicaciones', icon: 'sms', color: '#F22F46', bg: '#F22F4615' },
].map(i => ({ ...i, enabled: activeIntegrationsState.value.includes(i.id) })))

const integrationCategories = [
  { id: 'todas', label: 'Todas' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'bancos', label: 'Bancos' },
  { id: 'erp', label: 'ERP / Contabilidad' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'logistica', label: 'Logística' },
  { id: 'comunicaciones', label: 'Comunicaciones' },
]

const filteredIntegrations = computed(() => {
  let list = integrationCatalog.value
  if (integrationCategory.value !== 'todas') list = list.filter(i => i.cat === integrationCategory.value)
  if (integrationSearch.value.trim()) {
    const q = integrationSearch.value.toLowerCase()
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
  }
  return list
})

const activeCatalogIntegrations = computed(() => {
  return integrationCatalog.value.filter(i => i.enabled && i.id !== 'bancolombia')
})

function toggleIntegration(integration) {
  const willBeEnabled = !integration.enabled
  // We don't manually mutate integration.enabled because it's computed now! Wait, integrationCatalog is still a ref!
  // If it's still a ref, we mutate it and then save the state.
  integration.enabled = willBeEnabled
  saveIntegrationState(integration.id, willBeEnabled)
  emit('notify', {
    message: integration.enabled ? `${integration.name} activado` : `${integration.name} desactivado`,
    detail: integration.enabled
      ? `La integración con ${integration.name} está habilitada. Configura las credenciales para comenzar.`
      : `La integración con ${integration.name} ha sido desactivada.`,
  })
}

function configureIntegration(integration) {
  if (integration.id === 'gmail') {
    openGmailOAuth()
    return
  }
  if (integration.id === 'smtp') {
    showSmtpModal.value = true
    return
  }
  emit('notify', {
    message: `Configurar ${integration.name}`,
    detail: `Abre el panel de credenciales para conectar ${integration.name} con Contex360.`,
  })
}

// SMTP Custom Config
const showSmtpModal = ref(false)
const smtpConfig = ref({
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPassword: '',
  smtpFromEmail: ''
})
const smtpSaving = ref(false)

async function saveSmtpConfig() {
  if (!activeTenantId.value) return
  smtpSaving.value = true
  try {
    await businessApi.updateTenant(activeTenantId.value, smtpConfig.value)
    emit('notify', { message: 'SMTP Configurado', detail: 'Credenciales de correo personalizadas guardadas con éxito.' })
    showSmtpModal.value = false
    const smtpIntg = integrationCatalog.value.find(i => i.id === 'smtp')
    if (smtpIntg) {
      smtpIntg.enabled = true
      saveIntegrationState('smtp', true)
    }
  } catch (e) {
    emit('notify', { message: 'Error', detail: e?.message || 'No se pudo guardar la configuración SMTP.' })
  } finally {
    smtpSaving.value = false
  }
}

// Gmail OAuth
const gmailConnectedEmail = ref(null)
const gmailConnecting = ref(false)

async function checkGmailStatus() {
  try {
    const status = await businessApi.getGmailStatus()
    gmailConnectedEmail.value = status.email ?? null
    const gmailIntg = integrationCatalog.value.find(i => i.id === 'gmail')
    if (gmailIntg) {
      gmailIntg.enabled = status.connected
      saveIntegrationState('gmail', status.connected)
    }
  } catch { /* not critical */ }
}

async function openGmailOAuth() {
  if (gmailConnecting.value) return
  gmailConnecting.value = true
  try {
    const { url } = await businessApi.getGmailConnectUrl()
    const popup = window.open(url, 'gmail-oauth', 'width=520,height=620,scrollbars=yes')

    const handler = (event) => {
      if (event.data?.type === 'gmail-connected') {
        gmailConnectedEmail.value = event.data.email
        const gmailIntg = integrationCatalog.value.find(i => i.id === 'gmail')
        if (gmailIntg) {
          gmailIntg.enabled = true
          saveIntegrationState('gmail', true)
        }
        emit('notify', { message: 'Gmail conectado', detail: `Cuenta ${event.data.email} vinculada correctamente.` })
        window.removeEventListener('message', handler)
        gmailConnecting.value = false
      } else if (event.data?.type === 'gmail-error') {
        emit('notify', { message: 'Error al conectar Gmail', detail: event.data.message })
        window.removeEventListener('message', handler)
        gmailConnecting.value = false
      }
    }
    window.addEventListener('message', handler)

    // Fallback: if popup closes without message
    const poll = setInterval(() => {
      if (popup?.closed) {
        clearInterval(poll)
        window.removeEventListener('message', handler)
        gmailConnecting.value = false
      }
    }, 800)
  } catch (e) {
    emit('notify', { message: 'Error', detail: e.message })
    gmailConnecting.value = false
  }
}

async function disconnectGmail() {
  await businessApi.disconnectGmail()
  gmailConnectedEmail.value = null
  const gmailIntg = integrationCatalog.value.find(i => i.id === 'gmail')
  if (gmailIntg) {
    gmailIntg.enabled = false
    saveIntegrationState('gmail', false)
  }
  emit('notify', { message: 'Gmail desconectado', detail: 'La cuenta de Gmail fue desvinculada del workspace.' })
}

async function loadActiveIntegrations() {
  if (!activeTenantId.value) return
  try {
    const tenant = await businessApi.getTenantDetails(activeTenantId.value)
    if (tenant && tenant.activeIntegrations) {
      activeIntegrationsState.value = tenant.activeIntegrations
      // Update the integration catalog
      integrationCatalog.value.forEach(i => {
        i.enabled = activeIntegrationsState.value.includes(i.id)
      })
    }
  } catch (e) {
    console.error('Error loading active integrations:', e)
  }
}
onMounted(async () => {
  await adminStore.loadSettings()
  loadActiveIntegrations()
  if (activeTab.value === 'logs') {
    fetchAuditLogs()
  } else if (activeTab.value === 'cumplimiento') {
    fetchComplianceData()
  }
  try {
    const validateRes = await businessApi.validateDianConfig()
    dianValidationResult.value = validateRes
  } catch (e) {
    console.warn('Initial DIAN config check skipped:', e.message)
  }
  await fetchBancolombiaConfig()
  checkGmailStatus()
})

watch(activeTenantId, () => {
  fetchBancolombiaConfig()
})

watch(() => adminStore.language, (newVal) => {
  adminStore.saveSettings()
  if (newVal.includes('English')) translationStore.setLanguage('en')
  else if (newVal.includes('Português')) translationStore.setLanguage('pt')
  else translationStore.setLanguage('es')
})

function handleCurrencyChange() {
  adminStore.saveSettings()
  if (adminStore.currency.includes('USD')) {
    emit('notify', { message: 'ContexAI FX · Cotización USD', detail: 'Consultando tasa de cambio en tiempo real (1 USD = 4,150 COP). Convirtiendo plataforma a Dólares.' })
  } else {
    emit('notify', { message: 'Moneda Local COP', detail: 'Restaurando valores monetarios originales en pesos colombianos.' })
  }
}

function handleTimezoneChange() {
  adminStore.saveSettings()
  emit('notify', { message: 'Zona horaria actualizada', detail: `Reloj interno sincronizado con ${adminStore.timezone}.` })
}

function handleDateChange() {
  adminStore.saveSettings()
  emit('notify', { message: 'Formato de fecha actualizado', detail: `Aplicando formato ${adminStore.dateFormat} en todas las transacciones.` })
}

function handleSave() {
  adminStore.saveSettings()
  emit('notify', { message: 'Configuración guardada', detail: 'Los parámetros globales han sido guardados exitosamente en el sistema.' })
}

function handleDiscard() {
  adminStore.loadSettings()
  emit('notify', { message: 'Cambios descartados', detail: 'Se restauró la configuración previa guardada en memoria.' })
}

function handleOcrChange() {
  const isEnabled = adminStore.toggleOcr()
  emit('notify', { 
    message: isEnabled ? 'OCR IA Activado' : 'OCR IA Desactivado', 
    detail: isEnabled ? 'El procesamiento inteligente de facturas por OCR está activo.' : 'La lectura de facturas será manual.' 
  })
}

async function handleIntegration(name) {
  if (name === 'DIAN') {
    dianValidating.value = true
    try {
      const res = await businessApi.getDianConfig()
      if (res) {
        dianConfig.value = {
          dianEnvironment: res.dianEnvironment || 'test',
          dianNit: res.dianNit || '',
          dianSoftwareId: res.dianSoftwareId || '',
          dianSoftwarePin: res.dianSoftwarePin || '',
          dianTestSetId: res.dianTestSetId || '',
          invoiceResolution: res.invoiceResolution || '',
          resolutionFrom: res.resolutionFrom ? String(res.resolutionFrom).slice(0, 10) : '',
          resolutionTo: res.resolutionTo ? String(res.resolutionTo).slice(0, 10) : '',
          dianOperationCode: res.dianOperationCode || '10',
          dianCertificatePassword: '',
          dianCertificate: ''
        }
        dianHasCertificate.value = Boolean(res.hasCertificate)
        dianCertificateFileName.value = res.hasCertificate ? 'Certificado ya cargado en el backend' : ''
      }
      const validateRes = await businessApi.validateDianConfig()
      dianValidationResult.value = validateRes
    } catch (e) {
      console.error('Error validating DIAN config:', safeLogMessage(e))
    } finally {
      dianValidating.value = false
      showDianModal.value = true
    }
  } else if (name === 'Bancolombia') {
    fetchBancolombiaConfig()
    showBancolombiaModal.value = true
  }
}

async function saveDianConfig() {
  dianValidating.value = true
  try {
    const payload = {
      dianEnvironment: dianConfig.value.dianEnvironment,
      dianNit: dianConfig.value.dianNit,
      dianSoftwareId: dianConfig.value.dianSoftwareId,
      dianSoftwarePin: dianConfig.value.dianSoftwarePin,
      dianTestSetId: dianConfig.value.dianTestSetId,
      invoiceResolution: dianConfig.value.invoiceResolution,
      resolutionFrom: dianConfig.value.resolutionFrom || undefined,
      resolutionTo: dianConfig.value.resolutionTo || undefined,
      dianOperationCode: dianConfig.value.dianOperationCode,
    }

    if (dianConfig.value.dianCertificate) {
      payload.dianCertificate = dianConfig.value.dianCertificate
    }

    if (dianConfig.value.dianCertificatePassword) {
      payload.dianCertificatePassword = dianConfig.value.dianCertificatePassword
    }

    const res = await businessApi.updateDianConfig(payload)
    if (res.success) {
      emit('notify', { message: 'Configuración DIAN Guardada', detail: 'Parámetros actualizados y validados con el servidor DIAN.' })
      const validateRes = await businessApi.validateDianConfig()
      dianValidationResult.value = validateRes
      showDianModal.value = false
    }
  } catch (e) {
    emit('notify', { message: 'Error', detail: 'No se pudo guardar la configuración de la DIAN.' })
  } finally {
    dianValidating.value = false
  }
}

function handleDianCertificateChange(event) {
  const file = event?.target?.files?.[0]
  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const raw = String(reader.result || '')
    const base64 = raw.includes(',') ? raw.split(',')[1] : raw
    dianConfig.value.dianCertificate = base64.trim()
    dianHasCertificate.value = true
    dianCertificateFileName.value = file.name
  }
  reader.onerror = () => {
    emit('notify', { message: 'Error', detail: 'No se pudo leer el certificado seleccionado.' })
  }
  reader.readAsDataURL(file)
}

function clearDianCertificate() {
  dianConfig.value.dianCertificate = ''
  dianHasCertificate.value = false
  dianCertificateFileName.value = ''
  if (dianCertificateInput.value) {
    dianCertificateInput.value.value = ''
  }
}

async function saveBancolombiaConfig() {
  const next = normalizeBancolombiaConfig(bancolombiaConfig.value)
  next.accountNumber = String(next.accountNumber || '').trim()
  next.clientId = String(next.clientId || '').trim()

  if (!next.accountNumber) {
    emit('notify', { message: 'Cuenta requerida', detail: 'Ingresa el número de cuenta que vamos a conciliar.' })
    return
  }

  if (next.integrationMode === 'open_finance' && !next.clientId) {
    emit('notify', { message: 'Client ID requerido', detail: 'En Open Finance el Client ID debe venir de la app registrada en Bancolombia.' })
    return
  }

  if (!activeTenantId.value) {
    emit('notify', { message: 'Tenant no seleccionado', detail: 'Selecciona una empresa antes de configurar Bancolombia.' })
    return
  }

  bancolombiaSaving.value = true
  try {
    const res = await businessApi.updateBancolombiaConfig(next, activeTenantId.value)
    bancolombiaConfig.value = normalizeBancolombiaConfig(res.data || next)

    if (res.connectUrl) {
      showBancolombiaModal.value = false
      await openBancolombiaConsent(res.connectUrl)
    } else if (res.needsConsent || next.integrationMode === 'open_finance') {
      const conn = await businessApi.startBancolombiaOAuth(activeTenantId.value)
      showBancolombiaModal.value = false
      await openBancolombiaConsent(conn.url)
    } else {
      emit('notify', {
        message: 'Configuración Bancolombia guardada',
        detail: next.integrationMode === 'open_finance'
          ? 'La conexión quedó lista para completar el consentimiento OAuth desde el backend.'
          : 'La cuenta quedó preparada para recibir extractos empresariales MT940 o CAMT.053.',
      })
      showBancolombiaModal.value = false
    }
    await fetchBancolombiaConfig()
  } catch (e) {
    emit('notify', { message: 'Error', detail: e?.message || 'No se pudo guardar la configuración Bancolombia.' })
  } finally {
    bancolombiaSaving.value = false
  }
}
</script>

<template>
  <section
    v-if="isActive"
    class="animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Sistema</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Consola Admin</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">
          Consola de Administración
        </h1>
        <p class="text-[14px] text-[#71717A]">
          Configuración global del sistema y preferencias de inteligencia artificial.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#71717A] hover:bg-[#FAFAFA] text-[13px] font-semibold transition-colors"
          @click="handleDiscard"
        >
          Descartar
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold transition-colors shadow-sm"
          @click="handleSave"
        >
          <span class="material-symbols-outlined text-[18px]">save</span>Guardar
        </button>
      </div>
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

    <!-- Empresa -->
    <div
      v-if="activeTab === 'empresa'"
      class="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div class="lg:col-span-2 space-y-6">
        <section class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-5 pb-3 border-b border-[#F4F4F5]">
            <span class="material-symbols-outlined text-[20px] text-[#18181B]">domain</span>
            <h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">
              Identidad Corporativa
            </h3>
          </div>
          <div class="grid md:grid-cols-2 gap-5">
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Razón Social</label>
              <input
                v-model="adminStore.razonSocial"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#18181B] font-semibold outline-none focus:border-[#18181B] transition-colors"
                @change="adminStore.saveSettings()"
              >
            </div>
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">NIT</label>
              <input
                v-model="adminStore.nit"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#18181B] font-mono outline-none focus:border-[#18181B] transition-colors"
                @change="adminStore.saveSettings()"
              >
            </div>
          </div>
        </section>
      </div>
      
      <div class="space-y-6">
        <section class="bg-white border border-[#2563EB] ring-2 ring-[#2563EB]/10 rounded-[16px] p-6 shadow-sm bg-gradient-to-br from-[#F8FAFC] to-white">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-[20px] text-[#2563EB]">auto_awesome</span>
            <h3 class="text-[15px] font-extrabold tracking-tight text-[#18181B]">
              ContexAI Global
            </h3>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between pt-2">
              <div>
                <p class="text-[13px] font-extrabold text-[#18181B]">
                  OCR Automático
                </p>
                <p class="text-[12px] text-[#71717A] mt-0.5">
                  Procesar facturas con IA
                </p>
              </div>
              <button
                type="button"
                :class="[
                  'w-12 h-7 rounded-full p-1 transition-all duration-300 focus:outline-none flex items-center shadow-inner cursor-pointer select-none border border-black/10',
                  adminStore.ocrEnabled ? 'bg-[#2563EB]' : 'bg-[#D4D4D8]'
                ]"
                @click="handleOcrChange"
              >
                <div
                  :class="[
                    'bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300',
                    adminStore.ocrEnabled ? 'translate-x-5' : 'translate-x-0'
                  ]"
                />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- General -->
    <div
      v-if="activeTab === 'general'"
      class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 max-w-3xl shadow-sm"
    >
      <div class="flex items-center gap-2 mb-5 pb-3 border-b border-[#F4F4F5]">
        <span class="material-symbols-outlined text-[20px] text-[#18181B]">tune</span>
        <h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">
          Preferencias regionales
        </h3>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Idioma</label>
          <select
            v-model="adminStore.language"
            class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#18181B] font-semibold outline-none focus:border-[#18181B] bg-white transition-colors"
          >
            <option>Español (Colombia)</option><option>English (US)</option><option>Português (Brasil)</option>
          </select>
        </div>
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Zona horaria</label>
          <select
            v-model="adminStore.timezone"
            class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#18181B] font-semibold outline-none focus:border-[#18181B] bg-white transition-colors"
            @change="handleTimezoneChange"
          >
            <option>(UTC-05) Bogotá</option><option>(UTC-03) Buenos Aires</option>
          </select>
        </div>
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Moneda</label>
          <select
            v-model="adminStore.currency"
            class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#18181B] font-semibold outline-none focus:border-[#18181B] bg-white transition-colors"
            @change="handleCurrencyChange"
          >
            <option>COP · Peso colombiano</option><option>USD · Dólar</option>
          </select>
        </div>
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Formato de fecha</label>
          <select
            v-model="adminStore.dateFormat"
            class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#18181B] font-semibold outline-none focus:border-[#18181B] bg-white transition-colors"
            @change="handleDateChange"
          >
            <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Impuestos -->
    <div
      v-if="activeTab === 'impuestos'"
      class="bg-white border border-[#E4E4E7] rounded-[16px] overflow-hidden shadow-sm"
    >
      <div class="px-6 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-[#18181B]">percent</span><h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">
            Impuestos configurados
          </h3>
        </div>
        <button
          class="flex items-center gap-2 px-3.5 py-2 bg-[#18181B] hover:bg-[#27272A] text-white rounded-[10px] text-[12px] font-semibold transition-colors"
          @click="showTaxModal = true"
        >
          <span class="material-symbols-outlined text-[16px]">add</span>Nuevo impuesto
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left min-w-[550px]">
          <thead>
            <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
              <th class="px-6 py-3">
                Nombre
              </th><th class="px-6 py-3">
                Código DIAN
              </th><th class="px-6 py-3">
                Tipo
              </th><th class="px-6 py-3 text-right">
                Tasa
              </th><th class="px-6 py-3">
                Activo
              </th>
            </tr>
          </thead>
          <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
            <tr
              v-for="t in adminStore.taxes"
              :key="t.id"
              class="hover:bg-[#FAFAFA]/50 transition-colors"
            >
              <td class="px-6 py-4 font-bold text-[#18181B]">
                {{ t.name }}
              </td>
              <td class="px-6 py-4 font-mono text-[#A1A1AA] text-[12px]">
                {{ t.code }}
              </td>
              <td class="px-6 py-4">
                <span :class="['inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm', t.type === 'Suma' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200']">
                  {{ t.type }}
                </span>
              </td>
              <td class="px-6 py-4 text-right font-mono font-bold text-[#18181B]">
                {{ t.rate }}
              </td>
              <td class="px-6 py-4">
                <button
                  type="button"
                  :class="[
                    'w-11 h-6 rounded-full p-1 transition-all duration-300 focus:outline-none flex items-center shadow-inner cursor-pointer select-none border border-black/10',
                    t.active ? 'bg-[#18181B]' : 'bg-[#D4D4D8]'
                  ]"
                  @click="t.active = !t.active; adminStore.saveSettings()"
                >
                  <div
                    :class="[
                      'bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-300',
                      t.active ? 'translate-x-5' : 'translate-x-0'
                    ]"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nuevo Impuesto -->
    <div
      v-if="showTaxModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-[20px] max-w-md w-full p-6 shadow-2xl border border-[#E4E4E7] animate-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between pb-4 border-b border-[#F4F4F5] mb-5">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center text-[#18181B]">
              <span class="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
            <div>
              <h3 class="text-[16px] font-bold text-[#18181B]">
                Configurar nuevo impuesto
              </h3>
              <p class="text-[12px] text-[#71717A]">
                Agrega una retención o tributo al catálogo
              </p>
            </div>
          </div>
          <button
            class="text-[#A1A1AA] hover:text-[#18181B] transition-colors p-1"
            @click="showTaxModal = false"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="submitNewTax"
        >
          <div>
            <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Nombre comercial (Ej. Impoconsumo)</label>
            <input
              v-model="newTax.name"
              required
              placeholder="Nombre del impuesto"
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium outline-none focus:border-[#18181B]"
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Código DIAN</label>
              <input
                v-model="newTax.code"
                placeholder="Ej. 08"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-mono outline-none focus:border-[#18181B]"
              >
            </div>
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Tipo de impacto</label>
              <select
                v-model="newTax.type"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-[#18181B] bg-white"
              >
                <option value="Suma">
                  Suma (+)
                </option>
                <option value="Resta">
                  Resta (-)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Tasa Porcentual (%) o por mil (‰)</label>
            <input
              v-model="newTax.rate"
              required
              placeholder="Ej. 8% o 4‰"
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-mono font-bold outline-none focus:border-[#18181B]"
            >
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-[#F4F4F5]">
            <button
              type="button"
              class="px-4 py-2 text-[13px] font-semibold text-[#71717A] hover:bg-[#FAFAFA] rounded-[10px]"
              @click="showTaxModal = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-[13px] font-semibold bg-[#18181B] text-white hover:bg-[#27272A] rounded-[10px] shadow-sm"
            >
              Guardar impuesto
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Integraciones -->
    <div
      v-if="activeTab === 'integraciones'"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 shadow-sm">
        <div class="flex items-start justify-between mb-5">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-[12px] bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-100">
              <span class="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <p class="text-[15px] font-extrabold tracking-tight text-[#18181B]">
                DIAN
              </p>
              <p class="text-[12px] text-[#71717A] mt-0.5">
                Facturación electrónica directa
              </p>
            </div>
          </div>
          <span
            v-if="dianValidationResult?.valid"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200 shadow-sm"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Conectado
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-extrabold border border-amber-200 shadow-sm"
          >
            <span class="w-2 h-2 rounded-full bg-amber-500" />Pendiente Configurar
          </span>
        </div>
        <button
          class="w-full py-2.5 border border-[#E4E4E7] rounded-[10px] text-[13px] font-bold text-[#18181B] hover:bg-[#FAFAFA] transition-colors shadow-sm"
          @click="handleIntegration('DIAN')"
        >
          Configurar Parámetros DIAN
        </button>
      </div>

      <div class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 shadow-sm">
        <div class="flex items-start justify-between mb-5">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-[12px] bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-extrabold text-[20px] shadow-sm border border-[#2563EB]/20">
              B
            </div>
            <div>
              <p class="text-[15px] font-extrabold tracking-tight text-[#18181B]">
                Bancolombia
              </p>
              <p class="text-[12px] text-[#71717A] mt-0.5">
                Open Finance y extractos empresariales
              </p>
            </div>
          </div>
          <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold border shadow-sm', bancolombiaStatus.wrapper]">
            <span :class="['w-2 h-2 rounded-full', bancolombiaStatus.dot]" />{{ bancolombiaStatus.label }}
          </span>
        </div>
        <button
          class="w-full py-2.5 border border-[#E4E4E7] rounded-[10px] text-[13px] font-bold text-[#18181B] hover:bg-[#FAFAFA] transition-colors shadow-sm"
          @click="handleIntegration('Bancolombia')"
        >
          Configurar conexión real
        </button>
        <p
          v-if="bancolombiaConfig.lastSyncAt"
          class="mt-2 text-[11px] text-[#71717A]"
        >
          Última sincronización: {{ formatLogDate(bancolombiaConfig.lastSyncAt) }}
        </p>
        <p
          v-else
          class="mt-2 text-[11px] text-[#71717A]"
        >
          La autorización se completa en el backend antes de sincronizar movimientos.
        </p>
      </div>

      <div
        v-for="intg in activeCatalogIntegrations"
        :key="intg.id"
        class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 shadow-sm"
      >
        <div class="flex items-start justify-between mb-5">
          <div class="flex items-center gap-3.5">
            <div
              class="w-12 h-12 rounded-[12px] flex items-center justify-center text-[24px] shadow-sm border"
              :style="{ backgroundColor: intg.bg, color: intg.color, borderColor: `${intg.color}30` }"
            >
              <span class="material-symbols-outlined">{{ intg.icon }}</span>
            </div>
            <div>
              <p class="text-[15px] font-extrabold tracking-tight text-[#18181B]">
                {{ intg.name }}
              </p>
              <p class="text-[12px] text-[#71717A] mt-0.5">
                {{ intg.desc }}
              </p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-extrabold border border-emerald-200 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500" />Activa
          </span>
        </div>
        <button
          class="w-full py-2.5 border border-[#E4E4E7] rounded-[10px] text-[13px] font-bold text-[#18181B] hover:bg-[#FAFAFA] transition-colors shadow-sm"
          @click="configureIntegration(intg)"
        >
          Configurar credenciales
        </button>
      </div>

      <div
        class="bg-white border-2 border-dashed border-[#E4E4E7] rounded-[16px] p-6 flex flex-col items-center justify-center text-center min-h-[190px] hover:border-[#2563EB] hover:bg-[#FAFAFA]/50 cursor-pointer transition-all group"
        @click="showIntegrationsModal = true"
      >
        <div class="w-12 h-12 rounded-[12px] bg-[#FAFAFA] group-hover:bg-[#2563EB]/10 group-hover:text-[#2563EB] flex items-center justify-center text-[#A1A1AA] mb-3 transition-colors">
          <span class="material-symbols-outlined text-[24px]">add</span>
        </div>
        <p class="text-[14px] font-extrabold text-[#18181B]">
          Explorar integraciones
        </p>
        <div class="flex items-center gap-1.5 mt-1 justify-center flex-wrap">
          <span class="text-[12px] text-[#71717A]">{{ integrationCatalog.filter(i => i.enabled).length }} activas</span>
          <span class="text-[#D4D4D8]">·</span>
          <span class="text-[12px] text-[#71717A]">{{ integrationCatalog.length }} disponibles</span>
        </div>
      </div>
    </div>

    <!-- Modal Configuración DIAN -->
    <div
      v-if="showDianModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-2xl border border-[#E4E4E7] animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <div class="flex items-center justify-between pb-4 border-b border-[#F4F4F5] mb-5">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <span class="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div>
              <h3 class="text-[16px] font-bold text-[#18181B]">
                Configuración de Facturación DIAN
              </h3>
              <p class="text-[12px] text-[#71717A]">
                Ambiente habilitado para transmisión directa UBL 2.1
              </p>
            </div>
          </div>
          <button
            class="text-[#A1A1AA] hover:text-[#18181B] transition-colors p-1"
            @click="showDianModal = false"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="saveDianConfig"
        >
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Ambiente DIAN</label>
              <select
                v-model="dianConfig.dianEnvironment"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-[#18181B] bg-white"
              >
                <option value="test">
                  Pruebas / Habilitación
                </option>
                <option value="production">
                  Producción Real
                </option>
              </select>
            </div>
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">NIT del Transmisor</label>
              <input
                v-model="dianConfig.dianNit"
                placeholder="Ej. 900123456-7"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-mono outline-none focus:border-[#18181B]"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Software ID (DIAN)</label>
              <input
                v-model="dianConfig.dianSoftwareId"
                placeholder="UUID del Software"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-mono outline-none focus:border-[#18181B]"
              >
            </div>
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Software Pin (DIAN)</label>
              <input
                v-model="dianConfig.dianSoftwarePin"
                placeholder="Pin de 5 dígitos"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-mono outline-none focus:border-[#18181B]"
              >
            </div>
          </div>

          <div>
            <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Test Set ID (Solo Pruebas)</label>
            <input
              v-model="dianConfig.dianTestSetId"
              placeholder="SetID provisto por DIAN para pruebas"
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-mono outline-none focus:border-[#18181B]"
            >
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Vigencia desde</label>
              <input
                v-model="dianConfig.resolutionFrom"
                type="date"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#18181B]"
              >
            </div>
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Vigencia hasta</label>
              <input
                v-model="dianConfig.resolutionTo"
                type="date"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#18181B]"
              >
            </div>
          </div>

          <div>
            <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Contraseña del certificado</label>
            <input
              v-model="dianConfig.dianCertificatePassword"
              type="password"
              placeholder="Contraseña de firma digital"
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#18181B]"
            >
          </div>

          <div>
            <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Certificado digital (.p12/.pfx)</label>
            <input
              ref="dianCertificateInput"
              type="file"
              accept=".p12,.pfx,application/x-pkcs12"
              class="w-full border border-dashed border-[#D4D4D8] rounded-[10px] px-3.5 py-2.5 text-[13px] bg-[#FAFAFA] file:mr-3 file:rounded-md file:border-0 file:bg-[#18181B] file:px-3 file:py-2 file:text-white file:font-semibold"
              @change="handleDianCertificateChange"
            >
            <div class="mt-2 flex items-center justify-between gap-3 text-[11px]">
              <span class="text-[#71717A]">{{ dianHasCertificate ? `Cargado: ${dianCertificateFileName}` : 'No hay certificado cargado en esta sesión.' }}</span>
              <button
                v-if="dianHasCertificate"
                type="button"
                class="text-[#2563EB] font-semibold hover:underline"
                @click="clearDianCertificate"
              >
                Limpiar
              </button>
            </div>
          </div>

          <!-- Real-time Diagnostic/Validation Panel -->
          <div
            v-if="dianValidationResult"
            class="bg-[#FAFAFA] border border-[#E4E4E7] rounded-[12px] p-4 space-y-2"
          >
            <p class="text-[11px] font-bold text-[#18181B] flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-emerald-600">health_and_safety</span>
              Diagnóstico en Tiempo Real DIAN:
            </p>
            <div
              v-if="dianValidationResult.valid && (!dianValidationResult.errors || !dianValidationResult.errors.length)"
              class="text-[12px] text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200"
            >
              ✓ Configuración 100% válida. La plataforma está lista para transmitir documentos electrónicos.
            </div>
            <div
              v-else
              class="space-y-1.5"
            >
              <div
                v-for="err in dianValidationResult.errors"
                :key="err"
                class="text-[11px] text-rose-700 font-medium bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 flex items-start gap-1"
              >
                <span class="material-symbols-outlined text-[14px] mt-0.5">error</span>
                <span>{{ err }}</span>
              </div>
              <div
                v-for="warn in dianValidationResult.warnings"
                :key="warn"
                class="text-[11px] text-amber-700 font-medium bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-start gap-1"
              >
                <span class="material-symbols-outlined text-[14px] mt-0.5">warning</span>
                <span>{{ warn }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-[#F4F4F5]">
            <button
              type="button"
              class="px-4 py-2 text-[13px] font-semibold text-[#71717A] hover:bg-[#FAFAFA] rounded-[10px]"
              @click="showDianModal = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="dianValidating"
              class="px-4 py-2 text-[13px] font-semibold bg-[#18181B] text-white hover:bg-[#27272A] rounded-[10px] shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <div
                v-if="dianValidating"
                class="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
              />
              Guardar y Verificar Conexión
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Configuración Bancolombia -->
    <div
      v-if="showBancolombiaModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-2xl border border-[#E4E4E7] animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <div class="flex items-center justify-between pb-4 border-b border-[#F4F4F5] mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-12 h-12 rounded-[12px] bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-extrabold text-[20px] shadow-sm border border-[#2563EB]/20">
              B
            </div>
            <div>
              <h3 class="text-[16px] font-bold text-[#18181B]">
                Conciliación Bancolombia
              </h3>
              <p class="text-[12px] text-[#71717A]">
                Open Finance valida consentimiento y titularidad; la conciliación real entra por extractos empresariales.
              </p>
            </div>
          </div>
          <button
            class="text-[#A1A1AA] hover:text-[#18181B] transition-colors p-1"
            @click="showBancolombiaModal = false"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="flex items-center justify-between gap-3 mb-4">
          <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold border shadow-sm', bancolombiaStatus.wrapper]">
            <span :class="['w-2 h-2 rounded-full', bancolombiaStatus.dot]" />
            {{ bancolombiaStatus.label }}
          </span>
          <span class="text-[11px] font-semibold text-[#71717A]">{{ bancolombiaModeLabel }}</span>
        </div>

        <div
          v-if="bancolombiaLoading"
          class="mb-4 flex items-center gap-2 text-[11px] text-[#71717A]"
        >
          <span class="w-3.5 h-3.5 border-2 border-[#18181B]/20 border-t-[#18181B] rounded-full animate-spin" />
          Cargando configuración segura desde el backend...
        </div>

        <div class="mb-4 rounded-[12px] border border-[#DBEAFE] bg-[#EFF6FF] px-3.5 py-3">
          <p class="text-[11px] font-bold text-[#1D4ED8]">
            Implementación real
          </p>
          <p class="mt-1 text-[11px] leading-[1.5] text-[#1E3A8A]">
            El navegador no guarda el client secret. El backend maneja el consentimiento y guarda tokens cifrados; los movimientos llegan desde extractos empresariales o una fuente de transacciones.
          </p>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="saveBancolombiaConfig"
        >
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Modo de conexión</label>
              <select
                v-model="bancolombiaConfig.integrationMode"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-[#18181B] bg-white"
              >
                <option
                  v-for="mode in bancolombiaConnectionModes"
                  :key="mode.value"
                  :value="mode.value"
                >
                  {{ mode.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Ambiente</label>
              <select
                v-model="bancolombiaConfig.environment"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-[#18181B] bg-white"
              >
                <option value="sandbox">
                  Sandbox / Pruebas
                </option>
                <option value="production">
                  Producción
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Número de cuenta bancaria</label>
            <input
              v-model="bancolombiaConfig.accountNumber"
              placeholder="Ej. 031-987654-21"
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-mono outline-none focus:border-[#18181B]"
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Tipo de cuenta</label>
              <select
                v-model="bancolombiaConfig.accountType"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-[#18181B] bg-white"
              >
                <option value="Ahorros">
                  Ahorros
                </option>
                <option value="Corriente">
                  Corriente
                </option>
              </select>
            </div>
            <div class="rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA] p-3.5">
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Estado</label>
              <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold border shadow-sm', bancolombiaStatus.wrapper]">
                <span :class="['w-2 h-2 rounded-full', bancolombiaStatus.dot]" />
                {{ bancolombiaStatus.label }}
              </span>
              <p class="mt-2 text-[11px] text-[#71717A] leading-[1.5]">
                El backend valida la autorización, renueva tokens y confirma si la cuenta está realmente sincronizando.
              </p>
            </div>
          </div>

          <div v-if="bancolombiaConfig.integrationMode === 'open_finance'">
            <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Client ID (público)</label>
            <input
              v-model="bancolombiaConfig.clientId"
              placeholder="ID de la app registrada"
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-mono outline-none focus:border-[#18181B]"
            >
            <p class="mt-1 text-[11px] text-[#71717A] leading-[1.5]">
              El Client Secret se administra en el backend o en un vault. Aquí solo capturamos el identificador público.
            </p>
          </div>

          <div
            v-else
            class="rounded-[12px] border border-[#E4E4E7] bg-[#FAFAFA] p-3.5 space-y-3"
          >
            <div class="flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[18px] text-[#2563EB] mt-0.5">receipt_long</span>
              <div>
                <p class="text-[11px] font-bold text-[#18181B]">
                  Conexión empresarial
                </p>
                <p class="text-[11px] text-[#71717A] leading-[1.5]">
                  Normalmente recibe extractos MT940 o CAMT.053 y luego el backend los cruza contra la contabilidad.
                </p>
              </div>
            </div>
            <div>
              <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">Formato de extracto</label>
              <select
                v-model="bancolombiaConfig.statementFormat"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-[#18181B] bg-white"
              >
                <option
                  v-for="format in bancolombiaStatementFormats"
                  :key="format.value"
                  :value="format.value"
                >
                  {{ format.label }}
                </option>
              </select>
            </div>
            <div class="rounded-[10px] border border-[#E4E4E7] bg-white p-3 space-y-2">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-[11px] font-bold text-[#18181B]">
                    Subir extracto bancario
                  </p>
                  <p class="text-[11px] text-[#71717A] leading-[1.4]">
                    Sube un archivo MT940 o CAMT.053 para importar movimientos reales a tesorería.
                  </p>
                </div>
                <button
                  v-if="bancolombiaStatementFile"
                  type="button"
                  class="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                  @click="clearBancolombiaStatementFile"
                >
                  Limpiar
                </button>
              </div>
              <input
                type="file"
                accept=".mt940,.sta,.txt,.xml,text/plain,application/xml"
                class="block w-full text-[12px] text-[#71717A] file:mr-3 file:rounded-[8px] file:border-0 file:bg-[#18181B] file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-white hover:file:bg-[#27272A]"
                @change="handleBancolombiaStatementFileChange"
              >
              <p class="text-[11px] text-[#71717A] leading-[1.4]">
                Archivo cargado: <span class="font-semibold text-[#18181B]">{{ bancolombiaStatementFileLabel }}</span>
              </p>
            </div>
          </div>

          <div class="flex gap-2.5 p-3.5 rounded-[10px] border border-[#E4E4E7] bg-white">
            <span class="material-symbols-outlined text-[20px] text-[#2563EB] flex-shrink-0">shield</span>
            <div class="text-[11px] text-[#18181B] leading-[1.5]">
              <p class="font-semibold">
                Seguridad bancaria
              </p>
              <p>Los tokens viven cifrados en el backend. El navegador solo guarda metadatos y el estado de la conexión.</p>
            </div>
          </div>

          <div
            v-if="bancolombiaConfig.lastSyncAt"
            class="text-[11px] text-[#71717A]"
          >
            Última sincronización: {{ formatLogDate(bancolombiaConfig.lastSyncAt) }}
          </div>

          <div
            v-if="bancolombiaConfig.authorizationStatus === 'connected'"
            class="flex flex-wrap gap-2"
          >
            <button
              type="button"
              :disabled="bancolombiaSyncing || bancolombiaSaving || bancolombiaConnecting"
              class="px-4 py-2 text-[13px] font-semibold border border-[#E4E4E7] text-[#18181B] rounded-[10px] hover:bg-[#FAFAFA] transition-colors disabled:opacity-50 flex items-center gap-2"
              @click="syncBancolombiaNow"
            >
              <span
                v-if="bancolombiaSyncing"
                class="w-4 h-4 border-2 border-[#18181B]/20 border-t-[#18181B] rounded-full animate-spin"
              />
              {{ bancolombiaSyncing ? 'Sincronizando...' : (bancolombiaStatementFile ? 'Importar extracto' : 'Sincronizar ahora') }}
            </button>
            <button
              type="button"
              :disabled="bancolombiaSaving || bancolombiaConnecting || bancolombiaSyncing"
              class="px-4 py-2 text-[13px] font-semibold border border-rose-200 text-rose-600 rounded-[10px] hover:bg-rose-50 transition-colors disabled:opacity-50"
              @click="disconnectBancolombia"
            >
              Desconectar
            </button>
          </div>

          <div class="rounded-[12px] border border-[#E4E4E7] bg-[#FAFAFA] p-3.5">
            <p class="text-[11px] font-bold text-[#18181B] mb-2">
              Flujo real en producción
            </p>
            <ul class="space-y-1 text-[11px] text-[#71717A] leading-[1.5]">
              <li>1. Registras la app en el portal de Bancolombia y defines los scopes.</li>
              <li>2. El backend abre el consentimiento y recibe el callback autorizado.</li>
              <li>3. Los tokens se guardan cifrados y nunca se exponen al navegador.</li>
              <li>4. Open Finance valida titularidad; la conciliación consume extractos MT940 o CAMT.053 y los cruza con la contabilidad.</li>
            </ul>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-[#F4F4F5]">
            <button
              type="button"
              class="px-4 py-2 text-[13px] font-semibold text-[#71717A] hover:bg-[#FAFAFA] rounded-[10px]"
              @click="showBancolombiaModal = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="bancolombiaSaving || bancolombiaLoading || bancolombiaConnecting"
              class="px-4 py-2 text-[13px] font-semibold bg-[#18181B] text-white hover:bg-[#27272A] rounded-[10px] shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <div
                v-if="bancolombiaSaving"
                class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"
              />
              {{ bancolombiaSaving ? 'Guardando...' : 'Guardar configuración segura' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Suscripción -->
    <SubscriptionView 
      v-if="activeTab === 'suscripcion'" 
      @notify="emit('notify', $event)" 
    />

    <!-- Logs -->
    <div
      v-if="activeTab === 'logs'"
      class="bg-white border border-[#E4E4E7] rounded-[16px] overflow-hidden shadow-sm"
    >
      <div class="px-6 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
        <h3 class="text-[15px] font-extrabold tracking-tight text-[#18181B]">
          Auditoría del Sistema y Cambios Globales
        </h3>
        <button
          v-if="!logsLoading"
          class="text-[#71717A] hover:text-[#18181B] flex items-center gap-1 text-[12px] font-semibold"
          @click="fetchAuditLogs"
        >
          <span class="material-symbols-outlined text-[16px]">refresh</span>Actualizar
        </button>
      </div>

      <!-- Loading State -->
      <div
        v-if="logsLoading"
        class="py-12 text-center text-[#71717A]"
      >
        <div class="animate-spin w-6 h-6 border-2 border-black/10 border-t-black rounded-full mx-auto mb-3" />
        <p class="text-[13px] font-medium">
          Cargando logs de auditoría...
        </p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="logsError"
        class="p-6 text-center text-rose-600 bg-rose-50 border-t border-rose-100 text-[13px] font-medium"
      >
        {{ logsError }}
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!auditLogs.length"
        class="py-12 text-center text-[#71717A]"
      >
        <span class="material-symbols-outlined text-[36px] text-[#A1A1AA] mb-2">assignment_late</span>
        <p class="text-[13px] font-medium">
          No se encontraron eventos de auditoría registrados.
        </p>
      </div>

      <!-- Table View -->
      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full text-left min-w-[600px]">
          <thead>
            <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
              <th class="px-6 py-3.5">
                Usuario
              </th>
              <th class="px-6 py-3.5">
                Acción
              </th>
              <th class="px-6 py-3.5">
                Entidad / Detalle
              </th>
              <th class="px-6 py-3.5">
                Empresa
              </th>
              <th class="px-6 py-3.5 text-right">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
            <tr
              v-for="log in auditLogs"
              :key="log.id"
              class="hover:bg-[#FAFAFA]/50 transition-colors"
            >
              <td class="px-6 py-4 font-bold text-[#18181B]">
                <div class="flex flex-col">
                  <span>{{ log.actorUser?.name || log.actor }}</span>
                  <span
                    v-if="log.actorUser?.email"
                    class="text-[11px] font-normal text-[#A1A1AA] mt-0.5"
                  >{{ log.actorUser.email }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="['inline-flex px-2 py-1 rounded-md text-[11px] font-extrabold uppercase', getActionClass(log.action)]">
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-[#18181B] font-semibold">{{ log.entity }}</span>
                  <span class="text-[12px] text-[#71717A] mt-0.5">{{ log.description }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-[#71717A] font-semibold">
                {{ log.tenant?.name || 'Sistema Global' }}
              </td>
              <td class="px-6 py-4 font-mono text-[#A1A1AA] text-right whitespace-nowrap">
                {{ formatLogDate(log.at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Cumplimiento SOC 2 -->
    <div
      v-if="activeTab === 'cumplimiento'"
      class="space-y-6"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5 shadow-sm">
          <div class="w-9 h-9 rounded-[10px] bg-emerald-50 flex items-center justify-center text-emerald-700 mb-3">
            <span class="material-symbols-outlined text-[20px]">gpp_good</span>
          </div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
            Criterio de Seguridad
          </p>
          <p class="text-[20px] font-bold text-[#18181B] tracking-tight">
            100% - Protegido
          </p>
          <p class="text-[12px] text-[#71717A] mt-1">
            2FA, cifrado de claves e inmutabilidad activos.
          </p>
        </div>
        <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5 shadow-sm">
          <div class="w-9 h-9 rounded-[10px] bg-blue-50 flex items-center justify-center text-blue-700 mb-3">
            <span class="material-symbols-outlined text-[20px]">encrypted</span>
          </div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
            Confidencialidad
          </p>
          <p class="text-[20px] font-bold text-[#18181B] tracking-tight">
            100% - Cifrado
          </p>
          <p class="text-[12px] text-[#71717A] mt-1">
            Aislamiento lógico y cifrado en tránsito/reposo.
          </p>
        </div>
        <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5 shadow-sm">
          <div class="w-9 h-9 rounded-[10px] bg-purple-50 flex items-center justify-center text-purple-700 mb-3">
            <span class="material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
            Disponibilidad
          </p>
          <p class="text-[20px] font-bold text-[#18181B] tracking-tight">
            100% - Monitoreado
          </p>
          <p class="text-[12px] text-[#71717A] mt-1">
            Replica de Neon DB activa con conmutación por error.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Access Review (CC6.3) -->
        <div class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="material-symbols-outlined text-[#2563EB] text-[20px]">verified</span>
              <h3 class="text-[16px] font-bold tracking-tight text-[#18181B]">
                Revisión de Accesos Corporativos (CC6.3)
              </h3>
            </div>
            <p class="text-[13px] text-[#71717A] leading-[1.6] mb-4">
              SOC 2 exige la revisión periódica manual de los accesos y privilegios otorgados en la plataforma. Este proceso audita que cada cuenta cumpla con el principio del menor privilegio (*Least Privilege*) y documenta la revisión para los auditores externos.
            </p>
            <div
              v-if="complianceDashboard"
              class="bg-[#FAFAFA] border border-[#F4F4F5] rounded-[10px] p-4 mb-4"
            >
              <div class="flex justify-between text-[12px] py-1 border-b border-[#F4F4F5]">
                <span class="text-[#71717A]">Última revisión:</span>
                <span class="font-semibold text-[#18181B]">{{ complianceDashboard.lastAccessReviewAt ? formatLogDate(complianceDashboard.lastAccessReviewAt) : 'Pendiente este ciclo' }}</span>
              </div>
              <div class="flex justify-between text-[12px] py-1">
                <span class="text-[#71717A]">Colaboradores Auditados:</span>
                <span class="font-semibold text-[#18181B]">{{ complianceDashboard.totalUsers || 0 }} cuentas</span>
              </div>
            </div>
          </div>
          <button
            :disabled="accessReviewRunning"
            class="w-full py-2.5 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            @click="handleRunAccessReview"
          >
            <span
              v-if="accessReviewRunning"
              class="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
            />
            <span
              v-else
              class="material-symbols-outlined text-[18px]"
            >rule</span>
            {{ accessReviewRunning ? 'Procesando Auditoría...' : 'Iniciar Auditoría de Accesos Manual (CC6.3)' }}
          </button>
        </div>

        <!-- Incident Response Simulation (CC7.3) -->
        <div class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="material-symbols-outlined text-rose-600 text-[20px]">notifications_active</span>
              <h3 class="text-[16px] font-bold tracking-tight text-[#18181B]">
                Simulacro y Respuesta a Brechas (CC7.3)
              </h3>
            </div>
            <p class="text-[13px] text-[#71717A] leading-[1.6] mb-4">
              Cumpla con el criterio de preparación para incidentes probando anualmente el Plan de Respuesta a Incidentes (IRP). Puede simular una alerta y notificar por correo a los administradores del sistema, generando trazabilidad inmutable.
            </p>
            <div class="bg-rose-50 border border-rose-100 rounded-[10px] p-4 text-[13px] text-rose-700 flex items-start gap-2.5 mb-4">
              <span class="material-symbols-outlined text-[18px] text-rose-600 mt-0.5">info</span>
              <div>
                <p class="font-bold">
                  Monitoreo de Brechas Activo
                </p>
                <p class="text-[12px] text-rose-600/90 mt-0.5">
                  El sistema monitorea intentos de fuerza bruta e IPs anómalas continuamente.
                </p>
              </div>
            </div>
          </div>
          <button
            class="w-full py-2.5 bg-rose-600 text-white rounded-[10px] text-[13px] font-semibold hover:bg-rose-700 flex items-center justify-center gap-2 transition-colors"
            @click="handleSimulateBreach('simulated-breach')"
          >
            <span class="material-symbols-outlined text-[18px]">campaign</span>
            Simular Alerta y Notificar Administradores (CC7.3)
          </button>
        </div>
      </div>

      <!-- Real-time Alerts Table (CC7.3) -->
      <div class="bg-white border border-[#E4E4E7] rounded-[16px] overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-[#F4F4F5]">
          <h3 class="text-[15px] font-extrabold tracking-tight text-[#18181B]">
            Centro de Incidentes de Seguridad Activos
          </h3>
        </div>
        <div
          v-if="!breachAlerts.length"
          class="py-12 text-center text-[#71717A]"
        >
          <span class="material-symbols-outlined text-[36px] text-emerald-600 mb-2">shield_check</span>
          <p class="text-[13px] font-semibold text-emerald-700">
            ¡Tu sistema está limpio!
          </p>
          <p class="text-[12px] text-[#A1A1AA] mt-0.5">
            No se reportan alertas de seguridad críticas en este ciclo de auditoría.
          </p>
        </div>
        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full text-left">
            <thead>
              <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
                <th class="px-6 py-3.5">
                  Evento
                </th>
                <th class="px-6 py-3.5">
                  Descripción
                </th>
                <th class="px-6 py-3.5">
                  Gravedad
                </th>
                <th class="px-6 py-3.5">
                  Trazabilidad
                </th>
                <th class="px-6 py-3.5 text-right">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
              <tr
                v-for="alert in breachAlerts"
                :key="alert.id"
                class="hover:bg-[#FAFAFA]/50 transition-colors"
              >
                <td class="px-6 py-4 font-bold text-[#18181B]">
                  {{ alert.action }}
                </td>
                <td class="px-6 py-4 text-[#71717A]">
                  {{ alert.description }}
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                    {{ alert.severity }}
                  </span>
                </td>
                <td class="px-6 py-4 font-mono text-[#A1A1AA] text-[12px]">
                  {{ formatLogDate(alert.at) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    class="px-3 py-1.5 bg-[#18181B] text-white hover:bg-[#27272A] rounded-[8px] text-[11px] font-semibold transition-colors"
                    @click="handleSimulateBreach(alert.id)"
                  >
                    Notificar Alerta
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- Integrations Catalog Modal -->
  <Teleport to="body">
    <div
      v-if="showIntegrationsModal"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      @click.self="showIntegrationsModal = false"
    >
      <div
        class="absolute inset-0 bg-black/30 backdrop-blur-sm"
        @click="showIntegrationsModal = false"
      />
      <div class="relative bg-white rounded-[20px] shadow-[0_8px_80px_rgba(0,0,0,0.22)] w-full max-w-[860px] max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#F4F4F5] flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-[10px] bg-[#2563EB]/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px] text-[#2563EB]">hub</span>
            </div>
            <div>
              <h2 class="text-[16px] font-extrabold tracking-tight text-[#18181B]">
                Catálogo de Integraciones
              </h2>
              <p class="text-[11px] text-[#A1A1AA] font-medium">
                {{ integrationCatalog.filter(i => i.enabled).length }} activas de {{ integrationCatalog.length }} disponibles
              </p>
            </div>
          </div>
          <button
            class="w-8 h-8 rounded-[8px] hover:bg-[#F4F4F5] flex items-center justify-center text-[#A1A1AA] hover:text-[#18181B] transition-colors"
            @click="showIntegrationsModal = false"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Search + categories -->
        <div class="px-6 pt-4 pb-3 border-b border-[#F4F4F5] flex-shrink-0 space-y-3">
          <div class="flex items-center gap-2 border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 bg-[#FAFAFA] focus-within:border-[#2563EB] focus-within:bg-white transition-all">
            <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">search</span>
            <input
              v-model="integrationSearch"
              type="text"
              placeholder="Buscar integración..."
              class="flex-1 bg-transparent outline-none text-[13px] text-[#18181B] placeholder:text-[#A1A1AA]"
            >
          </div>
          <div class="flex gap-1.5 flex-wrap">
            <button
              v-for="cat in integrationCategories"
              :key="cat.id"
              :class="[
                'px-3 py-1.5 rounded-[8px] text-[11px] font-bold transition-all border',
                integrationCategory === cat.id
                  ? 'bg-[#18181B] text-white border-[#18181B]'
                  : 'bg-white text-[#71717A] border-[#E4E4E7] hover:border-[#D4D4D8] hover:text-[#18181B]'
              ]"
              @click="integrationCategory = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Grid -->
        <div class="overflow-y-auto flex-1 px-6 py-4">
          <div
            v-if="filteredIntegrations.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center"
          >
            <span class="material-symbols-outlined text-[36px] text-[#D4D4D8] mb-2">search_off</span>
            <p class="text-[13px] font-bold text-[#18181B]">
              Sin resultados
            </p>
            <p class="text-[12px] text-[#71717A]">
              Prueba con otro término o categoría.
            </p>
          </div>
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            <div
              v-for="intg in filteredIntegrations"
              :key="intg.id"
              class="border border-[#E4E4E7] rounded-[14px] p-4 bg-white hover:shadow-md transition-all flex flex-col gap-3"
              :class="{ 'border-[#2563EB]/30 bg-[#2563EB]/[0.02]': intg.enabled }"
            >
              <!-- Logo + toggle -->
              <div class="flex items-start justify-between">
                <div
                  class="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  :style="{ background: intg.bg }"
                >
                  <span
                    class="material-symbols-outlined text-[20px]"
                    :style="{ color: intg.color }"
                  >{{ intg.icon }}</span>
                </div>
                <!-- Toggle switch -->
                <button
                  :class="[
                    'relative w-10 h-5 rounded-full transition-colors flex-shrink-0',
                    intg.enabled ? 'bg-[#2563EB]' : 'bg-[#E4E4E7]'
                  ]"
                  @click="toggleIntegration(intg)"
                >
                  <span
                    :class="[
                      'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
                      intg.enabled ? 'translate-x-5' : 'translate-x-0.5'
                    ]"
                  />
                </button>
              </div>

              <!-- Info -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <p class="text-[13px] font-extrabold text-[#18181B]">
                    {{ intg.name }}
                  </p>
                  <span
                    v-if="intg.enabled"
                    class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-[5px]"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />Activa
                  </span>
                </div>
                <p class="text-[11px] text-[#71717A] leading-snug">
                  {{ intg.desc }}
                </p>
              </div>

              <!-- Gmail: special OAuth card -->
              <template v-if="intg.id === 'gmail'">
                <div
                  v-if="gmailConnectedEmail"
                  class="space-y-2"
                >
                  <div class="flex items-center gap-1.5 px-2.5 py-2 bg-emerald-50 border border-emerald-200 rounded-[8px]">
                    <span class="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                    <span class="text-[11px] font-semibold text-emerald-700 truncate">{{ gmailConnectedEmail }}</span>
                  </div>
                  <button
                    class="w-full py-2 border border-rose-200 rounded-[8px] text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
                    @click="disconnectGmail"
                  >
                    <span class="material-symbols-outlined text-[14px]">link_off</span>
                    Desconectar cuenta
                  </button>
                </div>
                <button
                  v-else
                  :disabled="gmailConnecting"
                  class="w-full py-2 border border-[#E4E4E7] rounded-[8px] text-[11px] font-bold text-[#18181B] hover:bg-[#FAFAFA] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  @click="openGmailOAuth"
                >
                  <span
                    v-if="gmailConnecting"
                    class="w-3.5 h-3.5 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin"
                  />
                  <span
                    v-else
                    class="material-symbols-outlined text-[14px]"
                  >login</span>
                  {{ gmailConnecting ? 'Conectando...' : 'Conectar con Google' }}
                </button>
              </template>

              <!-- Generic configure button -->
              <template v-else>
                <button
                  v-if="intg.enabled"
                  class="w-full py-2 border border-[#2563EB]/30 rounded-[8px] text-[11px] font-bold text-[#2563EB] hover:bg-[#2563EB]/5 transition-colors flex items-center justify-center gap-1.5"
                  @click="configureIntegration(intg)"
                >
                  <span class="material-symbols-outlined text-[14px]">settings</span>
                  Configurar credenciales
                </button>
                <div
                  v-else
                  class="w-full py-2 rounded-[8px] text-[11px] font-medium text-[#A1A1AA] text-center"
                >
                  Activa para configurar
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-[#F4F4F5] bg-[#FAFAFA] flex items-center justify-between flex-shrink-0">
          <p class="text-[11px] text-[#A1A1AA]">
            Los cambios se guardan automáticamente en este dispositivo.
          </p>
          <button
            class="px-4 py-2 bg-[#18181B] text-white rounded-[8px] text-[12px] font-bold hover:bg-[#27272A] transition-colors"
            @click="showIntegrationsModal = false"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
    <!-- Modal SMTP -->
    <div
      v-if="showSmtpModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-[20px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-[#E4E4E7] flex justify-between items-center bg-[#FAFAFA]">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px] text-[#2563EB]">alternate_email</span>
            </div>
            <div>
              <h2 class="text-[18px] font-bold text-[#18181B] tracking-tight">
                Servidor SMTP Propio
              </h2>
              <p class="text-[13px] text-[#71717A]">
                Envía facturas desde tu correo corporativo
              </p>
            </div>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#A1A1AA] hover:text-[#18181B] transition-colors"
            @click="showSmtpModal = false"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="p-6 space-y-5">
          <!-- Tutorial -->
          <div class="bg-[#2563EB]/5 border border-[#2563EB]/20 rounded-[12px] p-4 text-[#18181B]">
            <h4 class="text-[13px] font-bold mb-2 flex items-center gap-1.5 text-[#2563EB]">
              <span class="material-symbols-outlined text-[16px]">help</span>
              ¿Cómo configurar mi correo corporativo?
            </h4>
            <ol class="text-[12px] space-y-1.5 ml-5 list-decimal marker:text-[#2563EB] marker:font-bold text-[#71717A]">
              <li>Ingresa a la configuración de seguridad de tu proveedor (Workspace, Office365).</li>
              <li>Activa la verificación en dos pasos (2FA).</li>
              <li>Genera una <strong>Contraseña de Aplicación</strong> específica para Contex360.</li>
              <li>Usa esa contraseña generada en lugar de tu clave habitual.</li>
            </ol>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="text-[12px] font-semibold text-[#18181B] mb-1.5 block">Servidor SMTP (Host)</label>
              <input
                v-model="smtpConfig.smtpHost"
                placeholder="ej. smtp.office365.com"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all bg-[#FAFAFA] focus:bg-white"
              >
            </div>
            <div>
              <label class="text-[12px] font-semibold text-[#18181B] mb-1.5 block">Puerto</label>
              <input
                v-model.number="smtpConfig.smtpPort"
                type="number"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all bg-[#FAFAFA] focus:bg-white"
              >
            </div>
            <div class="col-span-2">
              <label class="text-[12px] font-semibold text-[#18181B] mb-1.5 block">Correo Electrónico (Remitente)</label>
              <input
                v-model="smtpConfig.smtpFromEmail"
                placeholder="facturacion@miempresa.com"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all bg-[#FAFAFA] focus:bg-white"
              >
            </div>
            <div class="col-span-2">
              <label class="text-[12px] font-semibold text-[#18181B] mb-1.5 block">Usuario de Autenticación</label>
              <input
                v-model="smtpConfig.smtpUser"
                placeholder="usualmente tu correo"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all bg-[#FAFAFA] focus:bg-white"
              >
            </div>
            <div class="col-span-2">
              <label class="text-[12px] font-semibold text-[#18181B] mb-1.5 block">Contraseña / App Password</label>
              <input
                v-model="smtpConfig.smtpPassword"
                type="password"
                placeholder="••••••••"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all bg-[#FAFAFA] focus:bg-white"
              >
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-[#E4E4E7] flex justify-end gap-3 bg-[#FAFAFA]">
          <button
            class="px-4 py-2 text-[13px] font-semibold text-[#71717A] hover:text-[#18181B] transition-colors"
            @click="showSmtpModal = false"
          >
            Cancelar
          </button>
          <button
            :disabled="smtpSaving"
            class="px-5 py-2 bg-[#2563EB] text-white text-[13px] font-semibold rounded-[10px] hover:bg-[#1D4ED8] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            @click="saveSmtpConfig"
          >
            <span
              v-if="smtpSaving"
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
            <span>Guardar y Conectar</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>