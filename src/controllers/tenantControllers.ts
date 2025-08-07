import { Logger } from 'winston'
import { TenantService } from '../services/tenantService'
import { Request, Response, NextFunction } from 'express'
import { epxressResponseTenant, TenantData } from '../types'
import { getTenantsSchema } from '../validators/getTenantsValidator'

export class TenantController {
  constructor(
    private logger: Logger,
    private tenantService: TenantService,
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, address } = req.body as TenantData
      this.logger.debug('Request for creating tenant', req.body)
      const tenant = await this.tenantService.create({ name, address })
      this.logger.info('Tenant has been created', { id: tenant.id })
      res.status(201).json({ id: tenant.id })
    } catch (error) {
      next(error)
    }
  }

  async getTenantById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const tenant = await this.tenantService.getTenantByid(Number(id))
      res.json(tenant)
    } catch (error) {
      next(error)
    }
  }

  async getAllTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const sanitizedQuery = getTenantsSchema.safeParse(req.query)
      if (!sanitizedQuery.success) {
        res.status(400).json({
          errors: sanitizedQuery.error,
        })
        return
      }
      const [allTenants, total] = await this.tenantService.getAllTenant(
        sanitizedQuery.data,
      )
      res.json({
        currentPage: sanitizedQuery.data?.currentPage,
        perPage: sanitizedQuery.data?.perPage,
        data: allTenants,
        total,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAllTenantsWithoutPagination(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const allTenants =
        await this.tenantService.getAllTenantsWithoutPagination()
      res.json(allTenants)
      return
    } catch (error) {
      next(error)
    }
  }

  async updateTenantById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { name, address } = req.body as epxressResponseTenant
      await this.tenantService.updateById(Number(id), {
        name,
        address,
        id: Number(id),
      })
      const updatedTenant = await this.tenantService.getTenantByid(Number(id))

      res.json(updatedTenant)
    } catch (error) {
      next(error)
    }
  }

  async deleteTenantById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      await this.tenantService.deleteTenantById(Number(id))
      res.json({})
    } catch (error) {
      next(error)
    }
  }
}
