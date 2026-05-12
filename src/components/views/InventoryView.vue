<script setup>
import { computed, reactive, watch, ref } from 'vue'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useStateStore } from '../../stores/stateStore'
import { formatCurrency, formatDate } from '../../utils/ui'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['notify'])
const store = useInventoryStore()

const productForm = reactive({
  sku: '',
  name: '',
  price: 0,
  cost: 0,
  taxRate: 19,
  stock: 1,
  minStock: 1,
  maxStock: 0,
  location: '',
  category: 'General',
  barcode: '',
  isInventoriable: true,
  productType: 'standard',
  kitComponents: [],
  preferredSupplier: '',
})

const rootStore = useStateStore()
const newComponent = reactive({ productId: '', quantity: 1 })

function addKitComponent() {
  if (!newComponent.productId || newComponent.quantity <= 0) return
  productForm.kitComponents.push({ ...newComponent })
  newComponent.productId = ''
  newComponent.quantity = 1
}

function removeKitComponent(index) {
  productForm.kitComponents.splice(index, 1)
}

function viewReceipt(invoiceId) {
  /* c8 ignore next 3 */
  rootStore.setActiveView('billing')
  rootStore.selections.invoiceId = invoiceId
}

function resetForm() {
  productForm.sku = ''
  productForm.name = ''
  productForm.price = 0
  productForm.cost = 0
  productForm.taxRate = 19
  productForm.stock = 1
  productForm.minStock = 1
  productForm.maxStock = 0
  productForm.location = ''
  productForm.category = 'General'
  productForm.barcode = ''
  productForm.isInventoriable = true
  productForm.productType = 'standard'
  productForm.kitComponents = []
  productForm.preferredSupplier = ''
}

const activeTab = ref('general')

// --- Audit Logic ---
const auditMode = ref(false)
const auditData = reactive({}) // Data mapping for inventory products: { productId: { count, reason } }

function toggleAuditMode() {
  if (auditMode.value) {
    auditMode.value = false
    return
  }
  auditMode.value = true
  store.tenantProducts.forEach(p => {
    if (p.isInventoriable && p.productType !== 'kit') {
      const locId = store.tenantLocations?.[0]?.id || 'default'
      auditData[p.id] = { count: p.stockByLocation[locId] || 0, reason: '', locationId: locId, photoBase64: '' }
    }
  })
}

function handlePhotoUpload(event, productId) {
  const file = event.target.files[0]
  /* c8 ignore next */
  if (!file) return
  const reader = new FileReader()
  /* c8 ignore next 3 */
  reader.onload = (e) => {
    auditData[productId].photoBase64 = e.target.result
  }
  /* c8 ignore next */
  reader.readAsDataURL(file)
}

function saveAudit() {
  const adjustments = Object.keys(auditData).map(productId => ({
    productId,
    locationId: auditData[productId].locationId,
    physicalCount: auditData[productId].count,
    reason: auditData[productId].reason,
    photoBase64: auditData[productId].photoBase64
  })).filter(adj => {
    const product = store.tenantProducts.find(p => p.id === adj.productId)
    return product && (product.stockByLocation[adj.locationId] || 0) !== adj.physicalCount
  })

  if (adjustments.length === 0) {
    emit('notify', { message: 'No hay diferencias para ajustar.' })
    auditMode.value = false
    return
  }

  const result = store.auditInventory({ adjustments })
  emit('notify', { message: result.message })
  if (result.ok) auditMode.value = false
}

// --- Transfer Logic ---
const transferForm = reactive({ productId: '', fromLocId: '', toLocId: '', quantity: 1 })
const lastTransfer = ref(null)

function handleTransfer() {
  if (transferForm.fromLocId === transferForm.toLocId) {
    emit('notify', { message: 'La bodega de origen y destino deben ser diferentes.' })
    return
  }
  const result = store.transferStock(transferForm)
  emit('notify', { message: result.message })
  if (result.ok) {
    const prod = store.tenantProducts.find(p => p.id === transferForm.productId)
    const fromLoc = store.tenantLocations.find(l => l.id === transferForm.fromLocId)?.name
    const toLoc = store.tenantLocations.find(l => l.id === transferForm.toLocId)?.name
    lastTransfer.value = { ...transferForm, productName: prod?.name, fromLoc, toLoc, date: new Date() }
    transferForm.productId = ''
    transferForm.quantity = 1
  }
}

function confirmReceiveTransfer(transferId) {
  const result = store.receiveTransfer(transferId)
  emit('notify', { message: result.message })
}

function printRemision() {
  if (!lastTransfer.value) return
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${lastTransfer.value.id || 'remision'}`
  const html = `
    <html><head><title>Remision de Traslado</title>
    <style>body { font-family: sans-serif; padding: 20px; } .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; display:flex; justify-content: space-between;} .row { margin-bottom: 10px; } .signature { margin-top: 50px; border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }</style>
    </head><body>
      <div class="header">
        <div><h2>Documento de Remision Interna</h2><p>Fecha: ${formatDate(lastTransfer.value.date)}</p></div>
        <div><img src="${qrUrl}" alt="QR Code" width="100" height="100"/></div>
      </div>
      <div class="row"><strong>Producto:</strong> ${lastTransfer.value.productName}</div>
      <div class="row"><strong>Cantidad:</strong> ${lastTransfer.value.quantity}</div>
      <div class="row"><strong>Origen:</strong> ${lastTransfer.value.fromLoc}</div>
      <div class="row"><strong>Destino:</strong> ${lastTransfer.value.toLoc}</div>
      <div style="display:flex; justify-content: space-around; margin-top: 80px;">
        <div class="signature">Firma Entrega</div>
        <div class="signature">Firma Recibe</div>
      </div>
    </body></html>
  `
  /* c8 ignore next 6 */
  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close(); }, 500)
}

watch(
  () => store.activeTenantId,
  () => {
    resetForm()
  },
  { immediate: true },
)

const canInventory = computed(() => store.canManageInventory)

const permissionNote = computed(() =>
  canInventory.value
    ? 'Tu rol puede crear y ajustar productos en este tenant.'
    : 'Modo solo lectura. Tu rol activo no puede modificar inventario.',
)

const sortedProducts = computed(() =>
  [...store.tenantProducts].sort((left, right) => left.name.localeCompare(right.name, 'es')),
)

function handleSubmit() {
  const result = store.createProduct(productForm)

  emit('notify', {
    message: result.message,
    detail: result.detail || '',
  })

  if (result.ok) {
    resetForm()
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  /* c8 ignore next 10 */
  file.text().then(content => {
    const result = store.importProductsCSV(content)
    emit('notify', {
      message: result.message,
      detail: result.detail || '',
    })
    event.target.value = ''
  })
}

function exportCSV() {
  const headers = ['sku', 'name', 'price', 'cost', 'taxRate', 'stock', 'minStock', 'maxStock', 'location', 'category', 'barcode', 'isInventoriable']
  const rows = store.tenantProducts.map(p => 
    headers.map(h => p[h]).join(',')
  )
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n")
  const encodedUri = encodeURI(csvContent)
  /* c8 ignore next 5 */
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `inventario_${store.activeTenantId}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
</script>

<template>
  <section :class="['view', { active: isActive }]">
    <div class="tabs-header" style="display:flex; gap:16px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding: 0 20px;">
      <button :class="['tab-button', { active: activeTab === 'general' }]" @click="activeTab = 'general'" style="background:none; border:none; padding:12px 16px; border-bottom:2px solid transparent; cursor:pointer; color:var(--text-color); font-weight:600; font-size:14px;">General</button>
      <button :class="['tab-button', { active: activeTab === 'operaciones' }]" @click="activeTab = 'operaciones'" style="background:none; border:none; padding:12px 16px; border-bottom:2px solid transparent; cursor:pointer; color:var(--text-color); font-weight:600; font-size:14px;">Operaciones (Auditorias & Traslados)</button>
      <button :class="['tab-button', { active: activeTab === 'inteligencia' }]" @click="activeTab = 'inteligencia'" style="background:none; border:none; padding:12px 16px; border-bottom:2px solid transparent; cursor:pointer; color:var(--text-color); font-weight:600; font-size:14px;">Inteligencia de Negocio</button>
    </div>

    <div v-if="activeTab === 'general'" class="two-column">
      <article class="panel-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">Maestro</p>
            <h3>Crear producto</h3>
          </div>
        </div>

        <p class="permission-note">{{ permissionNote }}</p>

        <form class="form-layout" @submit.prevent="handleSubmit">
          <fieldset class="form-fieldset" :disabled="!canInventory">
            <div class="field-grid two">
              <label class="field">
                <span>SKU</span>
                <input v-model="productForm.sku" placeholder="SKU-001" required type="text" />
              </label>

              <label class="field">
                <span>Nombre</span>
                <input v-model="productForm.name" placeholder="Servicio de consultoria" required type="text" />
              </label>
            </div>

            <div class="field-grid three">
              <label class="field">
                <span>Precio venta</span>
                <input v-model.number="productForm.price" min="0" required step="0.01" type="number" />
              </label>

              <label class="field">
                <span>Costo</span>
                <input v-model.number="productForm.cost" min="0" required step="0.01" type="number" />
              </label>

              <label class="field">
                <span>IVA %</span>
                <input v-model.number="productForm.taxRate" min="0" required step="1" type="number" />
              </label>
            </div>

            <div class="field-grid three">
              <label class="field">
                <span>Stock inicial</span>
                <input v-model.number="productForm.stock" min="0" required step="1" type="number" />
              </label>

              <label class="field">
                <span>Stock minimo</span>
                <input v-model.number="productForm.minStock" min="0" required step="1" type="number" />
              </label>

              <label class="field">
                <span>Stock maximo</span>
                <input v-model.number="productForm.maxStock" min="0" required step="1" type="number" />
              </label>
            </div>

            <div class="field-grid three">
              <label class="field">
                <span>Categoria</span>
                <input v-model="productForm.category" placeholder="Hardware, Insumos..." required type="text" />
              </label>

              <label class="field">
                <span>Ubicacion fisica</span>
                <input v-model="productForm.location" placeholder="Bodega A, Estante 3" type="text" />
              </label>

              <label class="field">
                <span>Proveedor Preferido</span>
                <input v-model="productForm.preferredSupplier" placeholder="Proveedor SAS" type="text" />
              </label>
            </div>

            <div class="field-grid two">
              <label class="field">
                <span>Tipo de Producto</span>
                <select v-model="productForm.productType">
                  <option value="standard">Estandar</option>
                  <option value="kit">Kit / Combo</option>
                </select>
              </label>

              <label class="field-checkbox" style="align-self: center; margin-top: 1.5rem;">
                <input v-model="productForm.isInventoriable" type="checkbox" />
                <span>Es un producto fisico (desmarcar para intangibles)</span>
              </label>
            </div>

            <div v-if="productForm.productType === 'kit'" class="kit-builder" style="background: var(--surface-2); padding: 16px; border-radius: 8px;">
              <h4>Componentes del Kit</h4>
              <div style="display: flex; gap: 8px; margin-bottom: 12px; align-items: flex-end;">
                <label class="field" style="flex: 1;">
                  <span>Producto</span>
                  <select v-model="newComponent.productId">
                    <option disabled value="">Seleccionar componente</option>
                    <option v-for="p in sortedProducts.filter(p => p.productType === 'standard' && p.isInventoriable)" :key="p.id" :value="p.id">
                      {{ p.name }} (Stock: {{ p.stock }})
                    </option>
                  </select>
                </label>
                <label class="field" style="width: 100px;">
                  <span>Cant.</span>
                  <input v-model.number="newComponent.quantity" min="1" type="number" />
                </label>
                <button type="button" class="secondary-button" @click="addKitComponent">Añadir</button>
              </div>
              <ul v-if="productForm.kitComponents.length" style="list-style: none; padding: 0; margin: 0;">
                <li v-for="(comp, idx) in productForm.kitComponents" :key="idx" style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid var(--border-color);">
                  <span>{{ comp.quantity }}x {{ sortedProducts.find(p => p.id === comp.productId)?.name }}</span>
                  <button type="button" style="color: var(--danger-color); background: none; border: none; cursor: pointer;" @click="removeKitComponent(idx)">Remover</button>
                </li>
              </ul>
            </div>

            <div class="form-actions">
              <button class="primary-button" type="submit">Guardar producto</button>
            </div>
          </fieldset>
        </form>
      </article>

      <div class="stack-column">
        <article class="panel-card">
          <div class="card-head">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p class="eyebrow">Stock y valorizacion</p>
                <h3>Inventario del tenant</h3>
              </div>
              <div class="header-actions" style="display: flex; gap: 8px;">
                <button type="button" :class="auditMode ? 'primary-button' : 'secondary-button'" style="font-size: 14px; padding: 6px 12px;" @click="toggleAuditMode">
                  {{ auditMode ? 'Cancelar Auditoria' : 'Modo Auditoria' }}
                </button>
                <label class="secondary-button" style="cursor: pointer; font-size: 14px; padding: 6px 12px; margin: 0;">
                  Importar CSV
                  <input type="file" accept=".csv" style="display: none" @change="handleFileUpload" />
                </label>
                <button class="secondary-button" style="font-size: 14px; padding: 6px 12px;" @click="exportCSV">
                  Exportar
                </button>
              </div>
            </div>
          </div>

          <div v-if="sortedProducts.length" class="table-card">
            <div class="table-header" :style="{ gridTemplateColumns: auditMode ? '2fr 1fr 2fr' : '2fr 1fr 1fr 1fr' }">
              <span>Producto</span>
              <span>{{ auditMode ? 'Stock Fisico' : 'Stock / Min / Max' }}</span>
              <span v-if="auditMode">Justificacion de Ajuste</span>
              <span v-if="!auditMode">Valor venta</span>
              <span v-if="!auditMode">Costo</span>
            </div>
            <div v-for="product in sortedProducts" :key="product.id" class="table-row" :style="{ gridTemplateColumns: auditMode ? '2fr 1fr 2fr' : '2fr 1fr 1fr 1fr' }">
              <div>
                <p>
                  <span v-if="store.abcAnalysis[product.id]" :class="'small-pill abc-' + store.abcAnalysis[product.id]" style="margin-right:6px; font-weight:bold;">
                    Cat {{ store.abcAnalysis[product.id] }}
                  </span>
                  {{ product.name }} 
                  <span class="small-pill" style="margin-left: 6px">{{ product.category }}</span>
                </p>
                <p class="label-soft">
                  SKU {{ product.sku }}
                  <span v-if="product.preferredSupplier" style="margin-left: 8px">🏢 {{ product.preferredSupplier }}</span>
                </p>
              </div>
              <div v-if="auditMode && product.isInventoriable && product.productType !== 'kit'">
                <div style="display: flex; gap: 4px; align-items: center;">
                  <input type="number" v-model.number="auditData[product.id].count" style="width: 80px; padding: 4px;" min="0" />
                  <select v-model="auditData[product.id].locationId" style="padding: 4px; font-size: 12px;">
                    <option v-for="loc in store.tenantLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                  </select>
                </div>
              </div>
              <div v-else-if="auditMode">
                <span class="small-pill">No auditable</span>
              </div>
              <div v-if="auditMode && product.isInventoriable && product.productType !== 'kit'">
                <input type="text" v-model="auditData[product.id].reason" placeholder="Motivo del cambio..." style="width: 100%; padding: 4px; margin-bottom:4px;" />
                <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
                  <span style="background:var(--surface-2); padding:2px 6px; border-radius:4px;">📸 Adjuntar foto</span>
                  <input type="file" accept="image/*" style="display:none;" @change="(e) => handlePhotoUpload(e, product.id)" />
                  <span v-if="auditData[product.id].photoBase64" style="color:var(--success-color);">✔️ OK</span>
                </label>
              </div>
              <div v-else-if="auditMode"></div>

              <div v-if="!auditMode && product.isInventoriable">
                <span :class="product.stock <= product.minStock ? 'status-badge status-danger' : 'small-pill'"
                      :title="Object.entries(product.stockByLocation || {}).map(([locId, qty]) => `${store.tenantLocations.find(l=>l.id===locId)?.name || locId}: ${qty}`).join(' | ')">
                  {{ product.stock }} / min {{ product.minStock }} / max {{ product.maxStock }}
                </span>
              </div>
              <div v-else-if="!auditMode">
                <span class="small-pill">No inventariable</span>
              </div>
              
              <strong v-if="!auditMode">{{ formatCurrency(product.price) }}</strong>
              <strong v-if="!auditMode">{{ formatCurrency(product.cost) }}</strong>
            </div>
            
            <div v-if="auditMode" class="form-actions" style="padding: 16px; border-top: 1px solid var(--border-color);">
              <button class="primary-button" type="button" @click="saveAudit">Guardar Ajustes de Auditoria</button>
            </div>
          </div>
          <p v-else class="empty-state">No hay productos cargados en este tenant.</p>
        </article>

        <article v-if="store.deadInventory.length" class="panel-card" style="border: 1px solid var(--danger-color);">
          <div class="card-head">
            <div>
              <p class="eyebrow" style="color: var(--danger-color);">Alerta Financiera</p>
              <h3>Inventario Muerto (Sin salidas > 90 dias)</h3>
            </div>
          </div>
          <div class="movement-list">
            <article v-for="product in store.deadInventory" :key="product.id" class="movement-item">
              <div class="movement-header">
                <strong>{{ product.name }}</strong>
                <span class="status-badge status-danger">Inmovilizado</span>
              </div>
              <p>Stock: {{ product.stock }} - Capital Estancado: {{ formatCurrency(product.stock * product.cost) }}</p>
            </article>
          </div>
        </article>

        <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Kardex</p>
              <h3>Movimientos recientes</h3>
            </div>
          </div>

          <div v-if="store.tenantInventoryMovements.length" class="movement-list">
            <article v-for="movement in store.tenantInventoryMovements.slice(0, 6)" :key="movement.id" class="movement-item">
              <div class="movement-header">
                <strong>{{ movement.productName }}</strong>
                <span :class="movement.type === 'salida' ? 'status-badge status-danger' : 'status-badge status-acceptada'">
                  {{ movement.type }}
                </span>
              </div>
              <p>Cantidad {{ movement.quantity }} - {{ movement.note }} <span v-if="movement.reason">({{ movement.reason }})</span></p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <p class="label-soft" style="margin: 0;">{{ formatDate(movement.at) }} - Usuario: {{ movement.userId || 'Sistema' }}</p>
                <button v-if="movement.referenceId && movement.reason === 'venta'" type="button" class="secondary-button" style="padding: 2px 8px; font-size: 12px;" @click="viewReceipt(movement.referenceId)">
                  Ver comprobante
                </button>
              </div>
            </article>
          </div>
          <p v-else class="empty-state">Aun no hay movimientos de inventario en esta empresa.</p>
        </article>
      </div>
    </div>

    <div v-if="activeTab === 'operaciones'" class="two-column">
      <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Stock y Valorizacion</p>
              <h3>Operaciones Logisticas</h3>
            </div>
          </div>
          <div style="padding: 0 20px 20px;">
            <p style="font-size: 14px; color: var(--text-color); margin-bottom: 12px;">Traslado de Mercancia</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: flex-end;">
              <label class="field" style="flex: 2; min-width: 200px;">
                <span>Producto</span>
                <select v-model="transferForm.productId">
                  <option disabled value="">Seleccionar...</option>
                  <option v-for="p in sortedProducts.filter(p => p.isInventoriable)" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </label>
              <label class="field" style="flex: 1; min-width: 120px;">
                <span>Origen</span>
                <select v-model="transferForm.fromLocId">
                  <option v-for="loc in store.tenantLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                </select>
              </label>
              <label class="field" style="flex: 1; min-width: 120px;">
                <span>Destino</span>
                <select v-model="transferForm.toLocId">
                  <option v-for="loc in store.tenantLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                </select>
              </label>
              <label class="field" style="width: 80px;">
                <span>Cant.</span>
                <input type="number" v-model.number="transferForm.quantity" min="1" />
              </label>
              <button class="primary-button" type="button" @click="handleTransfer">Trasladar</button>
            </div>
            <div v-if="lastTransfer" style="margin-top: 16px; padding: 12px; background: var(--surface-2); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="margin: 0; font-size: 14px;"><strong>Ultimo traslado:</strong> {{ lastTransfer.quantity }}x {{ lastTransfer.productName }}</p>
                <p class="label-soft" style="margin: 0;">{{ lastTransfer.fromLoc }} &rarr; {{ lastTransfer.toLoc }}</p>
              </div>
              <button type="button" class="secondary-button" @click="printRemision">Imprimir Remision</button>
            </div>

            <div style="margin-top: 32px;">
              <h4 style="margin-bottom: 12px;">Traslados en Transito</h4>
              <div v-if="store.inventoryTransfers.filter(t => t.status === 'en_transito').length === 0" class="empty-state" style="padding:16px;">
                No hay traslados pendientes.
              </div>
              <div v-for="t in store.inventoryTransfers.filter(t => t.status === 'en_transito')" :key="t.id" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--border-color);">
                <div>
                  <strong>{{ t.quantity }}x {{ t.productName }}</strong>
                  <p class="label-soft" style="margin:0;">Hacia: {{ store.tenantLocations.find(l => l.id === t.toLocId)?.name }} | Emitido: {{ formatDate(t.date) }}</p>
                </div>
                <button type="button" class="primary-button" style="font-size:12px; padding:4px 8px;" @click="confirmReceiveTransfer(t.id)">Recibir (Simular QR)</button>
              </div>
            </div>
          </div>
        </article>
    </div>

    <div v-if="activeTab === 'inteligencia'" class="two-column">
      <div class="stack-column" style="grid-column: span 2;">
        
        <article class="panel-card" style="margin-bottom: 24px;">
          <div class="card-head">
            <div>
              <p class="eyebrow">Finanzas</p>
              <h3>Analisis ABC de Ingresos</h3>
            </div>
          </div>
          <div style="padding: 0 20px 20px;">
             <p class="label-soft">Clasificacion de productos segun su contribucion a los ingresos totales.</p>
             <div style="display: flex; gap: 20px; margin-top: 16px;">
               <div style="flex: 1; padding: 12px; background: rgba(var(--success-color-rgb), 0.1); border-radius: 8px; border: 1px solid var(--success-color);">
                 <strong>Categoria A (80%)</strong>
                 <p style="font-size: 24px; margin: 8px 0;">{{ Object.values(store.abcAnalysis).filter(v => v === 'A').length }}</p>
                 <span class="label-soft">Productos Criticos</span>
               </div>
               <div style="flex: 1; padding: 12px; background: rgba(var(--accent-color-rgb), 0.1); border-radius: 8px; border: 1px solid var(--accent-color);">
                 <strong>Categoria B (15%)</strong>
                 <p style="font-size: 24px; margin: 8px 0;">{{ Object.values(store.abcAnalysis).filter(v => v === 'B').length }}</p>
                 <span class="label-soft">Rotacion Media</span>
               </div>
               <div style="flex: 1; padding: 12px; background: rgba(var(--warning-color-rgb), 0.1); border-radius: 8px; border: 1px solid var(--warning-color);">
                 <strong>Categoria C (5%)</strong>
                 <p style="font-size: 24px; margin: 8px 0;">{{ Object.values(store.abcAnalysis).filter(v => v === 'C').length }}</p>
                 <span class="label-soft">Baja Rotacion</span>
               </div>
             </div>
          </div>
        </article>

        <div class="card-head">
          <div>
            <p class="eyebrow">Analisis</p>
            <h3>Inteligencia de Inventario</h3>
          </div>
        </div>
        
        <article v-if="store.deadInventory.length" class="panel-card" style="border: 1px solid var(--danger-color);">
          <div class="card-head">
            <div>
              <p class="eyebrow" style="color: var(--danger-color);">Alerta Financiera</p>
              <h3>Inventario Muerto (Sin salidas > 90 dias)</h3>
            </div>
          </div>
          <div class="movement-list">
            <article v-for="product in store.deadInventory" :key="product.id" class="movement-item">
              <div class="movement-header">
                <strong>{{ product.name }}</strong>
                <span class="status-badge status-danger">Inmovilizado</span>
              </div>
              <p>Stock: {{ product.stock }} - Capital Estancado: {{ formatCurrency(product.stock * product.cost) }}</p>
            </article>
          </div>
        </article>

        <article v-if="Object.keys(store.reorderSuggestions).length" class="panel-card" style="border: 1px solid var(--accent-color);">
          <div class="card-head">
            <div>
              <p class="eyebrow" style="color: var(--accent-color);">Abastecimiento Automatizado</p>
              <h3>Sugerencias de Compra</h3>
            </div>
          </div>
          <div style="padding: 0 20px 20px;">
            <div v-for="(items, supplier) in store.reorderSuggestions" :key="supplier" style="margin-bottom: 16px;">
              <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">Proveedor: {{ supplier }}</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li v-for="item in items" :key="item.productId" style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
                  <span>{{ item.name }} (Stock: {{ item.stock }})</span>
                  <strong>Pedir: {{ item.quantityToOrder }}</strong>
                </li>
              </ul>
            </div>
          </div>
        </article>

      </div>
    </div>
  </section>
</template>

<style scoped>
.tab-button.active {
  border-bottom-color: var(--accent-color) !important;
  color: var(--accent-color) !important;
}
</style>

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
