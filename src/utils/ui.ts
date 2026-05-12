export const viewLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  billing: 'Facturación',
  inventory: 'Inventario',
  accounting: 'Contabilidad',
  'third-parties': 'Terceros',
  users: 'Usuarios',
  ai: 'IA / OCR',
  'admin-console': 'Consola Admin',
}

export const moduleRows = [
  ['Login y usuarios', 'Operativo', 'Sesion local, roles y membresias por empresa'],
  ['Facturacion DIAN', 'Operativo', 'Factura, timeline y estados'],
  ['Inventarios', 'Operativo', 'Stock, kardex y alertas'],
  ['Contabilidad', 'Operativo', 'Asientos automaticos'],
  ['IA/OCR', 'Operativo', 'Extraccion y sugerencias'],
  ['Nomina', 'Siguiente fase', 'Pendiente de backend y reglas laborales'],
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
