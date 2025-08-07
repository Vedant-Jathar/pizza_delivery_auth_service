import { z } from 'zod'

export const tenantDataSchema = z.object({
  name: z.string().nonempty('Name cannot be empty'),
  address: z.string().nonempty('Address cannot be empty'),
})
