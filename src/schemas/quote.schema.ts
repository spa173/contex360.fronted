import { z } from 'zod'

// ── Ítem de cotización ────────────────────────────────────────────────────────
export const quoteItemSchema = z.object({
  productId:   z.string().nullable().optional(),
  productName: z.string().min(1, 'El nombre del producto es obligatorio').trim(),
  quantity:    z.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice:   z.number().nonnegative('El precio no puede ser negativo'),
  taxRate:     z.number().min(0).max(100),
  subtotal:    z.number().nonnegative(),
  taxAmount:   z.number().nonnegative(),
})

// ── Cotización (cabecera) ─────────────────────────────────────────────────────
export const quoteSchema = z.object({
  clientId:   z.string().nullable().optional(),
  validUntil: z.string().min(1, 'La fecha de vigencia es obligatoria'),
  notes:      z.string().trim().max(500).nullable().optional(),
  items:      z.array(quoteItemSchema).min(1, 'La cotización debe tener al menos un ítem'),
})

export type QuoteSchema     = z.infer<typeof quoteSchema>
export type QuoteItemSchema = z.infer<typeof quoteItemSchema>
