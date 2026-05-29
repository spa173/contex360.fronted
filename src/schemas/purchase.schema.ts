import { z } from 'zod'

// ── Ítem de compra ────────────────────────────────────────────────────────────
export const purchaseItemSchema = z.object({
  productId:   z.string().nullable().optional(),
  productName: z.string().min(1, 'El nombre del producto es obligatorio').trim(),
  quantity:    z.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice:   z.number().nonnegative('El precio no puede ser negativo'),
  taxRate:     z.number().min(0).max(100),
})

// ── Compra (cabecera) ─────────────────────────────────────────────────────────
export const purchaseSchema = z.object({
  providerId:      z.string().nullable().optional(),
  providerName:    z.string().min(1, 'El proveedor es obligatorio').trim().optional(),
  issuedAt:        z.string().min(1, 'La fecha es obligatoria'),
  paymentTermDays: z.number().int().nonnegative().default(30),
  notes:           z.string().trim().max(500).nullable().optional(),
  items:           z.array(purchaseItemSchema).min(1, 'La compra debe tener al menos un ítem'),
})

export type PurchaseSchema     = z.infer<typeof purchaseSchema>
export type PurchaseItemSchema = z.infer<typeof purchaseItemSchema>
