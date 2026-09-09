import { Router } from 'express'
import { asyncHandler } from '../../../infra/http/middlewares/async-handler'
import { ensureAuthenticated } from '../../../infra/http/middlewares/auth'
import { validate } from '../../../infra/http/middlewares/validate'
import { PlanningsController } from '../../../modules/plannings/controllers/PlanningsController'
import {
  createPlanningSchema,
  updatePlanningItemSchema,
  updatePlanningSchema,
} from '../../../modules/plannings/schemas/planning.schemas'

const controller = new PlanningsController()
export const planningsRoutes = Router()

planningsRoutes.use(ensureAuthenticated)

planningsRoutes.get('/', asyncHandler((req, res) => controller.list(req, res)))
planningsRoutes.post(
  '/',
  validate(createPlanningSchema),
  asyncHandler((req, res) => controller.create(req, res)),
)
planningsRoutes.get('/:id', asyncHandler((req, res) => controller.show(req, res)))
planningsRoutes.patch(
  '/:id',
  validate(updatePlanningSchema),
  asyncHandler((req, res) => controller.update(req, res)),
)
planningsRoutes.delete('/:id', asyncHandler((req, res) => controller.delete(req, res)))
planningsRoutes.patch(
  '/:planningId/items/:itemId',
  validate(updatePlanningItemSchema),
  asyncHandler((req, res) => controller.updateItem(req, res)),
)
