import { NextFunction, Response } from 'express'
import { Auth, LoginUserRequest, RegisterUserRequest } from '../types'
import { UserService } from '../services/userService'
import { Logger } from 'winston'
import { Role } from '../constants'
import { JwtPayload } from 'jsonwebtoken'
import { TokenService } from '../services/tokenService'
import createHttpError from 'http-errors'
import bcrypt from 'bcryptjs'
import { Config } from '../config'
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
        firstName,
        lastName,
        email,
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
        domain: Config.MAIN_DOMAIN,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60,
      })

      res.cookie('refreshToken', refreshToken, {
        domain: Config.MAIN_DOMAIN,
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

  async login(req: LoginUserRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body

      this.logger.info('New request to login a user', {
        email,
        password: '*************',
      })

      // Checking whether user exists:
      const user = await this.userService.findUserByEmailWithPassword(email)
      if (!user) {
        const err = createHttpError(400, 'Invalid credentials')
        next(err)
      }

      // Checking whether the password is correct:
      const hashedPassword = user?.password
      const hasPasswordMatched = await bcrypt.compare(password, hashedPassword!)

      if (!hasPasswordMatched) {
        const err = createHttpError(400, 'Invalid credentials')
        throw err
      }

      const payload: JwtPayload = {
        sub: String(user?.id),
        role: String(user?.role),
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        tenantId: String(user?.tenant?.id),
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      const RefreshTokenInDatabase =
        await this.tokenService.persistRefreshToken(user!)

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: RefreshTokenInDatabase.id,
      })

      res.cookie('accessToken', accessToken, {
        sameSite: 'strict',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        domain: Config.MAIN_DOMAIN,
      })

      res.cookie('refreshToken', refreshToken, {
        sameSite: 'strict',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
        domain: Config.MAIN_DOMAIN,
      })

      this.logger.info('user logged in successfully', {
        id: user?.id,
      })

      res.status(200).json({
        id: user?.id,
        message: 'Login successful',
      })
    } catch (error) {
      next(error)
    }
  }

  async self(req: Auth, res: Response, next: NextFunction) {
    try {
      console.log('req.auth', req.auth)

      const user = await this.userService.findUserById(Number(req.auth.sub))

      if (!user) {
        const err = createHttpError(404, 'user not found')
        next(err)
        return
      }
      res.json({ ...user, password: undefined })
    } catch (error) {
      next(error)
    }
  }

  async refresh(req: Auth, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findUserById(Number(req.auth.sub))
      const payload: JwtPayload = {
        sub: String(user?.id),
        role: String(user?.role),
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        tenantId: String(user?.tenant?.id),
      }

      const accessToken = this.tokenService.generateAccessToken(payload)

      const newRefreshToken = await this.tokenService.persistRefreshToken(user!)

      await this.tokenService.deleteOldRefreshTokenFromDatabase(
        Number(req.auth.id),
      )

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshToken.id,
      })

      res.cookie('accessToken', accessToken, {
        sameSite: 'strict',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        domain: Config.MAIN_DOMAIN,
      })

      res.cookie('refreshToken', refreshToken, {
        sameSite: 'strict',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
        domain: Config.MAIN_DOMAIN,
      })

      res.json({})
    } catch (error) {
      next(error)
    }
  }

  async logout(req: Auth, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteOldRefreshTokenFromDatabase(
        Number(req.auth.id),
      )
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      res.json({})
    } catch (error) {
      next(error)
    }
  }
}
