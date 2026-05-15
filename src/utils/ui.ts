export const viewLabels: Record<string, string> = {
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

export const moduleRows: Array<[string, string, string]> = [
  ['Facturación', 'Operativo', 'Emisión, DIAN y cartera listos'],
  ['Inventario', 'Operativo', 'Stock, movimientos y alertas activas'],
  ['Contabilidad', 'Operativo', 'Libro diario y balance rápido'],
  ['IA / OCR', 'Operativo', 'Lectura documental y sugerencias'],
]

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
})

export function formatCurrency(value: number | string) {
  return currencyFormatter.format(Number(value) || 0)
}

export function formatDate(value: string | number | Date) {
  return dateTimeFormatter.format(new Date(value))
}

export function formatDateOnly(value: string | number | Date) {
  return dateFormatter.format(new Date(value))
}

export function mapKindLabel(kind: string) {
  const labels: Record<string, string> = {
    client: 'Cliente',
    provider: 'Proveedor',
    employee: 'Empleado',
  }

  return labels[kind] || kind
}
