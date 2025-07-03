import z from 'zod'

export const getUsersSchema = z.object({
  currentPage: z
    .string()
    .transform((value) => (Number(value) ? Number(value) : 1)),
  perPage: z.string().transform((value) => (Number(value) ? Number(value) : 6)),
})
