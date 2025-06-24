import { NextFunction, Response } from 'express'
import { UserService } from '../services/userService'
import { RegisterUserRequest } from '../types'
import { Role } from '../constants'

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: RegisterUserRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password } = req.body
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Role.MANAGER,
      })
      res.status(201).json({ id: user.id })
    } catch (error) {
      next(error)
    }
  }
}
