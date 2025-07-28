import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import { TenantController } from '../controllers/tenantControllers'
import logger from '../config/logger'
import { TenantService } from '../services/tenantService'
import AppDataSource from '../config/data-source'
import { Tenant } from '../entity/Tenant'
import authenticate from '../middlewares/authenticate'
import { canAccess } from '../middlewares/canAccess'
import { Role } from '../constants'
import { tenantDataSchema } from '../validators/tenantValidator'
import { validate } from '../validators/registerValidator'
const router = Router()

const tenantController = new TenantController(
  logger,
  new TenantService(AppDataSource.getRepository(Tenant)),
)

router.post(
  '/',
  authenticate,
  canAccess([Role.ADMIN]),
  validate(tenantDataSchema),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next),
)

router.get('/all', (req: Request, res: Response, next: NextFunction) =>
  tenantController.getAllTenantsWithoutPagination(req, res, next),
)

router.get(
  '/:id',
  authenticate,
  canAccess([Role.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getTenantById(req, res, next),
)

router.get(
  '/',
  authenticate,
  canAccess([Role.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getAllTenants(req, res, next),
)

router.patch(
  '/:id',
  authenticate,
  canAccess([Role.ADMIN]),
  validate(tenantDataSchema),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.updateTenantById(req, res, next),
)

router.delete(
  '/:id',
  authenticate,
  canAccess([Role.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.deleteTenantById(req, res, next),
)

export default router
