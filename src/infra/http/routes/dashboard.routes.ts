import { Router } from 'express'
import { asyncHandler } from '../../../infra/http/middlewares/async-handler'
import { ensureAuthenticated } from '../../../infra/http/middlewares/auth'
import { validate } from '../../../infra/http/middlewares/validate'
import { DashboardController } from '../../../modules/dashboard/controllers/DashboardController'
import { dashboardSummaryQuerySchema } from '../../../modules/dashboard/schemas/dashboard.schemas'

const controller = new DashboardController()
export const dashboardRoutes = Router()

dashboardRoutes.use(ensureAuthenticated)
dashboardRoutes.get(
  '/summary',
  validate(dashboardSummaryQuerySchema, 'query'),
  asyncHandler((req, res) => controller.summary(req, res)),
)
