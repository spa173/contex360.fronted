import { z } from 'zod'

export const transactionSchema = z.object({
  type:        z.enum(['INCOME', 'EXPENSE'], { errorMap: () => ({ message: 'El tipo debe ser INCOME o EXPENSE' }) }),
  amount:      z.number().positive('El monto debe ser mayor a 0'),
  description: z.string().min(1, 'La descripción es obligatoria').trim().max(300),
  date:        z.string().min(1, 'La fecha es obligatoria'),
  category:    z.string().trim().nullable().optional(),
  reference:   z.string().trim().nullable().optional(),
})

export type TransactionSchema = z.infer<typeof transactionSchema>
