import { Router } from 'express'
import { asyncHandler } from '../../../infra/http/middlewares/async-handler'
import { ensureAuthenticated } from '../../../infra/http/middlewares/auth'
import { validate } from '../../../infra/http/middlewares/validate'
import { TransactionsController } from '../../../modules/transactions/controllers/TransactionsController'
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  updateTransactionSchema,
} from '../../../modules/transactions/schemas/transaction.schemas'

const controller = new TransactionsController()
export const transactionsRoutes = Router()

transactionsRoutes.use(ensureAuthenticated)

transactionsRoutes.get(
  '/',
  validate(listTransactionsQuerySchema, 'query'),
  asyncHandler((req, res) => controller.list(req, res)),
)
transactionsRoutes.post(
  '/',
  validate(createTransactionSchema),
  asyncHandler((req, res) => controller.create(req, res)),
)
transactionsRoutes.get('/:id', asyncHandler((req, res) => controller.show(req, res)))
transactionsRoutes.patch(
  '/:id',
  validate(updateTransactionSchema),
  asyncHandler((req, res) => controller.update(req, res)),
)
transactionsRoutes.delete('/:id', asyncHandler((req, res) => controller.delete(req, res)))
