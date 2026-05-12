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
