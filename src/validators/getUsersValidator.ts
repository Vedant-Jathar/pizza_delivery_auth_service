import z from 'zod'

export const getUsersSchema = z.object({
  q: z
    .string()
    .transform((val) => val || '')
    .optional(),
  role: z
    .string()
    .transform((val) => val.trim() || '')
    .optional(),
  currentPage: z
    .string()
    .transform((value) => (Number(value) ? Number(value) : 1)),
  perPage: z.string().transform((value) => (Number(value) ? Number(value) : 6)),
})
