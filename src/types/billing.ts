export type InvoiceStatus = 'draft' | 'emitted' | 'sent' | 'accepted' | 'cancelled'

export interface InvoiceItem {
  id?: string
  invoiceId?: string
  lineNumber?: number
  productId: string | null
  productName: string
  quantity: number
  unitPrice: number
  unitCost: number
  taxRate: number
  subtotal: number
  taxAmount: number
  total: number
  createdAt?: string
  updatedAt?: string
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
  clientId: string | null
  ownerUserId?: string | null
  status: InvoiceStatus
  subtotal: number
  taxTotal: number
  total: number
  paymentTermDays: number
  notes?: string | null
  issuedAt: string
  dueAt?: string | null
  timeline?: InvoiceTimelineEvent[] | null
  items: InvoiceItem[]
  createdAt: string
  updatedAt?: string
  files?: {
    xml?: boolean
    pdf?: boolean
  }
  [key: string]: unknown
}

export interface LedgerLine {
  id?: string
  ledgerEntryId?: string
  account: string
  label: string
  debit: number
  credit: number
  createdAt?: string
  updatedAt?: string
}

export interface LedgerEntry {
  id: string
  tenantId: string
  referenceType: string
  referenceId?: string | null
  description: string
  amount: number
  entryAt: string
  createdAt: string
  updatedAt?: string
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
