import { Router, Request, Response, NextFunction } from 'express'
import { AuthControllers } from '../controllers/authControllers'
import { UserService } from '../services/userService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import {
  loginSchema,
  registerSchema,
  validate,
} from '../validators/registerValidator'
import { TokenService } from '../services/tokenService'
import { RefreshToken } from '../entity/RefreshToken'
// import { registerSchema, validate } from '../validators/registerValidator'

const authRouter = Router()

const authController = new AuthControllers(
  new UserService(AppDataSource.getRepository(User)),
  logger,
  new TokenService(AppDataSource.getRepository(RefreshToken)),
)

authRouter.post(
  '/register',
  validate(registerSchema),
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
)

authRouter.post(
  '/login',
  validate(loginSchema),
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next),
)

export default authRouter
