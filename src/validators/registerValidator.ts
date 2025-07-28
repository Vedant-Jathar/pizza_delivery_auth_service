import { Response, NextFunction } from 'express'
import { AnyZodObject } from 'zod'
import z from 'zod'
import { RegisterUserRequest } from '../types'
import createHttpError from 'http-errors'

export const registerSchema = z.object({
  firstName: z.string().nonempty('First name is required'),
  lastName: z.string().nonempty('Last name is required'),
  email: z
    .string()
    .trim()
    .min(1, 'Email field is required')
    .email('Invalid email format'),
  password: z
    .string()
    .nonempty('Password cannot be empty')
    .min(6, 'Min 6 characters required'),
})

export const loginSchema = z.object({
  email: z.string().nonempty('Email is required').email(),
  password: z.string().nonempty('Password is required'),
})

export const validate =
  (schema: AnyZodObject) =>
  (req: RegisterUserRequest, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
      const firstError = `${Object.entries(parsed.error.flatten().fieldErrors)[0][0]}->${Object.entries(parsed.error.flatten().fieldErrors)[0][1]![0]}`

      next(createHttpError(400, firstError))
      return
    }
    // req.validatedData = parsed.data
    next()
  }

export const validateRegisterData =
  (schema: AnyZodObject) => (req: RegisterUserRequest, res: Response) => {
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        errors: parsed.error.flatten().fieldErrors,
      })
      return
    }
    return parsed.data
    // req.validatedData = parsed.data
    // next()
  }
