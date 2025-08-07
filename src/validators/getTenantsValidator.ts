import { z } from 'zod'

export const getTenantsSchema = z.object({
  currentPage: z
    .string()
    .transform((value) => (Number(value) ? Number(value) : 1)),
  perPage: z.string().transform((value) => (Number(value) ? Number(value) : 6)),
  q: z.string().optional(),
})
