import { Router, Request, Response, NextFunction } from 'express'
import { AuthControllers } from '../controllers/authControllers'
import { UserService } from '../services/userService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'

const authRouter = Router()

const authController = new AuthControllers(
  new UserService(AppDataSource.getRepository(User)),
  logger,
)

authRouter.post(
  '/register',
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
)

export default authRouter
