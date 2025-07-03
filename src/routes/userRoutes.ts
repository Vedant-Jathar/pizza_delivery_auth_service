import express, { Request, Response, NextFunction } from 'express'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Role } from '../constants'
import { UserController } from '../controllers/userController'
import { UserService } from '../services/userService'
import AppDataSource from '../config/data-source'
import { User } from '../entity/User'
import { validate } from '../validators/registerValidator'
import { createUserSchema } from '../validators/createUserValidator'
import { updateUserSchema } from '../validators/updateUserValidator'
import { Tenant } from '../entity/Tenant'

const router = express.Router()

const userController = new UserController(
  new UserService(
    AppDataSource.getRepository(User),
    AppDataSource.getRepository(Tenant),
  ),
)

router.post(
  '/',
  authenticate,
  canAccess([Role.ADMIN]),
  validate(createUserSchema),
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next),
)

router.patch(
  '/:id',
  authenticate,
  canAccess([Role.ADMIN]),
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.update(req, res, next)
  },
)

router.get(
  '/:id',
  authenticate,
  canAccess([Role.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.getUserById(req, res, next)
  },
)

router.get(
  '/',
  authenticate,
  canAccess([Role.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.getAllUsers(req, res, next)
  },
)

router.delete(
  '/:id',
  authenticate,
  canAccess([Role.ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.deleteById(req, res, next)
  },
)
export default router
