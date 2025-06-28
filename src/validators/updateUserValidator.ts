import z from 'zod'

export const updateUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  role: z.string(),
  tenantId: z.number(),
})
