import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import { Auth } from '../types'

export const canAccess = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const _req = req as Auth
      const roleFromToken = _req.auth.role
      if (!roles.includes(roleFromToken)) {
        const err = createHttpError(403, 'No permission')
        next(err)
        return
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
