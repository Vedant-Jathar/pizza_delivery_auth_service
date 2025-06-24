import { z } from 'zod'

export const tenantDataSchema = z.object({
  name: z.string().nonempty(),
  address: z.string().nonempty(),
})
