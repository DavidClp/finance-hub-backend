import { Router } from 'express'
import { asyncHandler } from '../../../infra/http/middlewares/async-handler'
import { ensureAuthenticated } from '../../../infra/http/middlewares/auth'
import { validate } from '../../../infra/http/middlewares/validate'
import { ReportsController } from '../../../modules/reports/controllers/ReportsController'
import { expensesReportQuerySchema } from '../../../modules/reports/schemas/report.schemas'

const controller = new ReportsController()
export const reportsRoutes = Router()

reportsRoutes.use(ensureAuthenticated)
reportsRoutes.get(
  '/expenses',
  validate(expensesReportQuerySchema, 'query'),
  asyncHandler((req, res) => controller.expenses(req, res)),
)
