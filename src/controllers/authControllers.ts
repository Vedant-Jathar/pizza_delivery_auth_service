import { Request, Response } from 'express'

export class AuthControllers {
  register(req: Request, res: Response) {
    res.status(201).json()
  }
}
