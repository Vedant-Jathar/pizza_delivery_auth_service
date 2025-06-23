import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { TenantController } from '../controllers/tenantControllers'
import logger from '../config/logger'
import { TenantService } from '../services/tenantService'
import AppDataSource from '../config/data-source'
import { Tenant } from '../entity/Tenant'

const router = Router()

const tenantController = new TenantController(
  logger,
  new TenantService(AppDataSource.getRepository(Tenant)),
)

router.post('/', (req: Request, res: Response, next: NextFunction) =>
  tenantController.create(req, res, next),
)

export default router
