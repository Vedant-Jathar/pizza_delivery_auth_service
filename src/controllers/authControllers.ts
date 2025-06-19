import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/userService'
import { Logger } from 'winston'
import { Role } from '../constants'
import { JwtPayload } from 'jsonwebtoken'
import { TokenService } from '../services/tokenService'
// import { registerSchema } from '../validators/registerValidator'

export class AuthControllers {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
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

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      }

      // Generating access token:
      const accessToken = this.tokenService.generateAccessToken(payload)

      // Saving a refresh token record to the database:(ie persisting the refresh token)
      const newRefreshToken = await this.tokenService.persistRefreshToken(user)

      // Generating a refresh token:(It has the id of the refresh token record stored to the database)
      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshToken.id,
      })

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60,
      })

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365,
      })

      res.status(201).json({
        id: user.id,
      })
    } catch (error) {
      next(error)
    }
  }
}
