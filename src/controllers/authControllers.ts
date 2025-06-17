import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/userService'
import { Logger } from 'winston'
import { Role } from '../constants'
// import { registerSchema } from '../validators/registerValidator'

export class AuthControllers {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body

    this.logger.debug('Request to create a user', {
      firstName,
      lastName,
      email,
      password,
    })

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Role.CUSTOMER,
      })
      this.logger.info('User created successfully', { userDetails: user })

      res.status(201).json({
        id: user.id,
      })
    } catch (error) {
      next(error)
    }
  }
}
