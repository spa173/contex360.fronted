import { z } from 'zod'

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string().optional(),
  lineNumber: z.number().int().optional(),
  productId: z.string().nullable().optional(),
  productName: z.string().min(1, 'El nombre del producto es obligatorio'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().nonnegative('El precio no puede ser negativo'),
  unitCost: z.number().nonnegative().optional().default(0),
  taxRate: z.number().min(0).max(100),
  subtotal: z.number().nonnegative(),
  taxAmount: z.number().nonnegative(),
  total: z.number().nonnegative()
})

export const invoiceSchema = z.object({
  clientId: z.string().nullable().optional(),
  ownerUserId: z.string().nullable().optional(),
  paymentTermDays: z.number().int().nonnegative().default(30),
  notes: z.string().nullable().optional(),
  items: z.array(invoiceItemSchema).min(1, 'La factura debe tener al menos un ítem'),
})

export type InvoiceSchema = z.infer<typeof invoiceSchema>
export type InvoiceItemSchema = z.infer<typeof invoiceItemSchema>
