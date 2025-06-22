import { Router, Request, Response, NextFunction } from 'express'
import { AuthControllers } from '../controllers/authControllers'
import { UserService } from '../services/userService'
import AppDataSource from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import authenticate from '../middlewares/authenticate'
import { Auth } from '../types'
import {
  loginSchema,
  registerSchema,
  validate,
} from '../validators/registerValidator'
import { TokenService } from '../services/tokenService'
import { RefreshToken } from '../entity/RefreshToken'
import validaterefreshToken from '../middlewares/validaterefreshToken'
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

authRouter.get(
  '/self',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.self(req as Auth, res, next)
  },
)

authRouter.post(
  '/refresh',
  validaterefreshToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.refresh(req as Auth, res, next)
  },
)

// authRouter.post("/logout", authenticate, (req: Request, res: Response, next: NextFunction) => {
//   authController.logout(req, res, next)
// })

export default authRouter
