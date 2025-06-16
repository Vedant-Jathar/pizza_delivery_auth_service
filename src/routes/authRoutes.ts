import { Router, Request, Response } from 'express'
import { AuthControllers } from '../controllers/authControllers'
import { UserService } from '../services/userService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'

const authRouter = Router()

const authController = new AuthControllers(
  new UserService(AppDataSource.getRepository(User)),
)

authRouter.post('/register', (req: Request, res: Response) =>
  authController.register(req, res),
)

export default authRouter
