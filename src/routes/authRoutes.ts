import { Router, Request, Response } from 'express'
import { AuthControllers } from '../controllers/authControllers'

const authRouter = Router()

const authController = new AuthControllers()

authRouter.post('/register', (req: Request, res: Response) =>
  authController.register(req, res),
)

export default authRouter
