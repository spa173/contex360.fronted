import { z } from 'zod'

export const invoiceItemSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().min(3, 'La descripción es muy corta'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().nonnegative('El precio no puede ser negativo'),
  taxRate: z.number().min(0).max(100),
  total: z.number().nonnegative()
})

export const invoiceSchema = z.object({
  id: z.string().uuid().optional(),
  number: z.string().min(1, 'El número de factura es obligatorio'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  clientId: z.string().min(1, 'Debes seleccionar un cliente'),
  clientName: z.string().min(1),
  items: z.array(invoiceItemSchema).min(1, 'La factura debe tener al menos un ítem'),
  subtotal: z.number().nonnegative(),
  taxTotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.enum(['draft', 'pending', 'paid', 'cancelled']),
  notes: z.string().optional()
})

export type InvoiceSchema = z.infer<typeof invoiceSchema>
export type InvoiceItemSchema = z.infer<typeof invoiceItemSchema>
