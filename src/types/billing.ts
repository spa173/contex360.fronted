export interface InvoiceItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  unitCost: number
  taxRate: number
  subtotal: number
  taxAmount: number
  total: number
  [key: string]: unknown
}

export interface InvoiceTimelineEvent {
  id: string
  status: string
  note: string
  at: string
}

export interface Invoice {
  id: string
  tenantId: string
  number: string
  clientId: string
  status: string
  paymentTermDays: number
  subtotal: number
  taxTotal: number
  total: number
  notes?: string
  createdAt: string
  dueAt: string
  ownerUserId?: string | null
  items: InvoiceItem[]
  timeline: InvoiceTimelineEvent[]
  files?: {
    xml?: boolean
    pdf?: boolean
  }
  [key: string]: unknown
}

export interface LedgerLine {
  account: string
  label: string
  debit: number
  credit: number
}

export interface LedgerEntry {
  id: string
  tenantId: string
  reference: string
  description: string
  sourceInvoiceId?: string | null
  ownerUserId?: string | null
  createdAt: string
  lines: LedgerLine[]
  [key: string]: unknown
}

export interface TaxConfig {
  ivaRates: number[]
  withholdingRates: {
    label: string
    rate: number
    type: 'source' | 'ica' | 'iva'
  }[]
}
