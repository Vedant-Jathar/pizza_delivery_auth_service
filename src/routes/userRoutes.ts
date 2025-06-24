import express, { Request, Response, NextFunction } from 'express'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Role } from '../constants'
import { UserController } from '../controllers/userController'
import { UserService } from '../services/userService'
import AppDataSource from '../config/data-source'
import { User } from '../entity/User'

const router = express.Router()

const userController = new UserController(
  new UserService(AppDataSource.getRepository(User)),
)

router.post(
  '/',
  authenticate,
  canAccess([Role.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next),
)

export default router
