
export interface Product {
  id: string
  tenantId: string
  sku: string
  name: string
  price: number
  cost: number
  taxRate: number
  stock: number
  stockByLocation: Record<string, number>
  minStock: number
  maxStock: number
  location: string
  category: string
  barcode: string
  isInventoriable: boolean
  productType: 'standard' | 'kit' | 'service'
  kitComponents?: { productId: string; quantity: number }[]
  unit: string
  [key: string]: unknown
}

export interface InventoryMovement {
  id: string
  tenantId: string
  productId: string
  productName: string
  type: 'entrada' | 'salida'
  quantity: number
  reason: string
  userId: string
  batch: string
  expirationDate: string
  note: string
  at: string
  referenceId?: string
  attachmentUrl?: string | null
}

export interface InventoryTransfer {
  id: string
  tenantId: string
  fromLocId: string
  toLocId: string
  status: 'pendiente' | 'en_transito' | 'completado' | 'cancelado'
  quantity: number
  receivedAt?: string | null
  [key: string]: unknown
}
