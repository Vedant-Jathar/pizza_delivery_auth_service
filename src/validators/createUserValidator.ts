import z from 'zod'

export const createUserSchema = z.object({
  firstName: z.string().nonempty('FirstName cannot be empty'),
  lastName: z.string().nonempty('FirstName cannot be empty'),
  email: z
    .string()
    .nonempty('FirstName cannot be empty')
    .email('Its invalid email'),
  role: z.string().nonempty('Role cannot be empty'),
  password: z.string().min(6, 'Min 6 char required'),
  tenantId: z.number().optional(),
})
