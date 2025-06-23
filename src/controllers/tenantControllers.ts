import { Logger } from 'winston'
import { TenantService } from '../services/tenantService'
import { Request, Response, NextFunction } from 'express'
import { TenantData } from '../types'

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
}
