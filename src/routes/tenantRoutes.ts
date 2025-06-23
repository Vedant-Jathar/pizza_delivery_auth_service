import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { TenantController } from '../controllers/tenantControllers'
import logger from '../config/logger'
import { TenantService } from '../services/tenantService'
import AppDataSource from '../config/data-source'
import { Tenant } from '../entity/Tenant'
import authenticate from '../middlewares/authenticate'

const router = Router()

const tenantController = new TenantController(
  logger,
  new TenantService(AppDataSource.getRepository(Tenant)),
)

router.post(
  '/',
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next),
)

export default router
