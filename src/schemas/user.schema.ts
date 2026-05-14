import { z } from 'zod'

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  status: z.enum(['active', 'inactive']),
  title: z.string().min(1, 'El cargo es obligatorio'),
  isSystemOwner: z.boolean().default(false),
  role: z.string().optional()
})

export type UserSchema = z.infer<typeof userSchema>
