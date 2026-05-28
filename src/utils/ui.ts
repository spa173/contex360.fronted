const viewLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  billing: 'Facturación',
  purchases: 'Compras',
  quotes: 'Cotizaciones',
  treasury: 'Tesorería',
  inventory: 'Inventario',
  accounting: 'Contabilidad',
  'third-parties': 'Terceros',
  users: 'Usuarios',
  reports: 'Reportes',
  ai: 'IA / OCR',
  'admin-console': 'Consola Admin',
  profile: 'Perfil',
  about: 'Acerca de',
}

const moduleRows: Array<[string, string, string]> = [
  ['Facturación', 'Operativo', 'Emisión, DIAN y cartera listos'],
  ['Inventario', 'Operativo', 'Stock, movimientos y alertas activas'],
  ['Contabilidad', 'Operativo', 'Libro diario y balance rápido'],
  ['IA / OCR', 'Operativo', 'Lectura documental y sugerencias'],
]

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
})

const rateCache: Record<string, number> = { COP: 1 }

export function setCurrencyRates(rates: Record<string, number>) {
  Object.assign(rateCache, rates)
}

export function formatCurrency(value: number | string, currencyCode = 'COP') {
  const amount = Number(value) || 0
  const rate = rateCache[currencyCode] ?? 1
  const converted = amount / rate

  const localeMap: Record<string, string> = {
    COP: 'es-CO',
    USD: 'en-US',
    EUR: 'es-ES',
    MXN: 'es-MX',
  }
  const decimalsMap: Record<string, number> = {
    COP: 0,
    USD: 2,
    EUR: 2,
    MXN: 2,
  }

  return new Intl.NumberFormat(localeMap[currencyCode] || 'es-CO', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimalsMap[currencyCode] ?? 0,
    maximumFractionDigits: decimalsMap[currencyCode] ?? 0,
  }).format(converted)
}

export function formatDate(value: string | number | Date) {
  return dateTimeFormatter.format(new Date(value))
}

export function formatDateOnly(value: string | number | Date) {
  return dateFormatter.format(new Date(value))
}

function mapKindLabel(kind: string) {
  const labels: Record<string, string> = {
    client: 'Cliente',
    provider: 'Proveedor',
    employee: 'Empleado',
  }

  return labels[kind] || kind
}
