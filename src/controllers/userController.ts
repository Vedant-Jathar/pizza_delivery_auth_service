import { NextFunction, Response, Request } from 'express'
import { UserService } from '../services/userService'
import { createUserRequest, RegisterUserRequest } from '../types'
import createHttpError from 'http-errors'
import { getUsersSchema } from '../validators/getUsersValidator'

export class UserController {
  constructor(private userService: UserService) {}

  async create(req: RegisterUserRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, role, tenantId } = req.body
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
      })
      res.status(201).json({ id: user.id })
    } catch (error) {
      next(error)
    }
  }

  async update(req: createUserRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, role, tenantId } = req.body
      const { id } = req.params
      await this.userService.updateById(Number(id), {
        firstName,
        lastName,
        email,
        role,
        tenantId,
      })
      res.json({})
    } catch (error) {
      next(error)
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const user = await this.userService.findUserById(Number(id))
      if (!user) {
        next(createHttpError(404, 'User not found'))
      }
      res.json(user)
    } catch (error) {
      next(error)
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const sanitizedQuery = getUsersSchema.safeParse(req.query)
      //Eg: sanitizedQuery = { success: true, data: { currentPage: 2, perPage: 7 } }

      const [users, count] = await this.userService.getAllUsers(
        sanitizedQuery.data!,
      )
      res.json({
        currentPage: sanitizedQuery.data?.currentPage,
        perPage: sanitizedQuery.data?.perPage,
        data: users,
        total: count,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      await this.userService.deleteById(Number(id))
      res.json({})
    } catch (error) {
      next(error)
    }
  }
}
