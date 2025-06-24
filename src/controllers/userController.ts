import { NextFunction, Response } from 'express'
import { UserService } from '../services/userService'
import { RegisterUserRequest } from '../types'

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: RegisterUserRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, role, tenantId } = req.body
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
      })
      res.status(201).json({ id: user.id })
    } catch (error) {
      next(error)
    }
  }
}
