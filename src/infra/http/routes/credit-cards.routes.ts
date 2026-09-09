import { Router } from 'express'
import { asyncHandler } from '../../../infra/http/middlewares/async-handler'
import { ensureAuthenticated } from '../../../infra/http/middlewares/auth'
import { validate } from '../../../infra/http/middlewares/validate'
import { CreditCardsController } from '../../../modules/credit-cards/controllers/CreditCardsController'
import {
  createCreditCardSchema,
  updateCreditCardSchema,
} from '../../../modules/credit-cards/schemas/credit-card.schemas'

const controller = new CreditCardsController()
export const creditCardsRoutes = Router()

creditCardsRoutes.use(ensureAuthenticated)

creditCardsRoutes.get('/', asyncHandler((req, res) => controller.list(req, res)))
creditCardsRoutes.post(
  '/',
  validate(createCreditCardSchema),
  asyncHandler((req, res) => controller.create(req, res)),
)
creditCardsRoutes.get('/:id', asyncHandler((req, res) => controller.show(req, res)))
creditCardsRoutes.patch(
  '/:id',
  validate(updateCreditCardSchema),
  asyncHandler((req, res) => controller.update(req, res)),
)
creditCardsRoutes.delete('/:id', asyncHandler((req, res) => controller.delete(req, res)))
