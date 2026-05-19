export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired' | 'converted'

export interface QuoteItem {
  id?: string
  quoteId?: string
  lineNumber?: number
  productId: string | null
  productName: string
  quantity: number
  unitPrice: number
  taxRate: number
  subtotal: number
  taxAmount: number
  notes?: string | null
}

export interface Quote {
  id: string
  tenantId: string
  number: string
  clientId: string | null
  status: QuoteStatus
  subtotal: number
  taxTotal: number
  total: number
  validUntil: string | null
  notes?: string | null
  terms?: string | null
  convertedToInvoiceId?: string | null
  items: QuoteItem[]
  client?: { id: string; name: string } | null
  createdAt: string
  updatedAt?: string
}

export interface CreateQuotePayload {
  clientId: string
  validUntil?: string
  notes?: string
  terms?: string
  items: {
    productId: string
    quantity: number
    unitPrice: number
    taxRate: number
    notes?: string
  }[]
}
