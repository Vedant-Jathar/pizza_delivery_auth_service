import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/userService'
import { Logger } from 'winston'
import { Role } from '../constants'
import jwt, { JwtPayload } from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { Config } from '../config'
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

      const privateKey = fs.readFileSync(
        path.join(__dirname, '../../certs/privateKey'),
      )

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      }

      const accessToken = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h',
        issuer: 'auth-service',
      })

      const refreshToken = jwt.sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: 'HS256',
        expiresIn: '1y',
        issuer: 'auth-service',
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
