import z from 'zod'

export const updateUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email('Email is not valid'),
  role: z.string(),
  tenantId: z.number().optional(),
})
