import { Response, NextFunction } from 'express'
import { AnyZodObject } from 'zod'
import z from 'zod'
import { RegisterUserRequest } from '../types'

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .min(1, 'Email field is required')
    .email('Invalid email format'),
  password: z.string().min(6, 'Min 6 characters required'),
})

export const validate =
  (schema: AnyZodObject) =>
  (req: RegisterUserRequest, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({
        errors: parsed.error.flatten().fieldErrors,
      })
      return
    }
    next()
  }
