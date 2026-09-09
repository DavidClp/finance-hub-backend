import { Router } from 'express'
import { asyncHandler } from '../../../infra/http/middlewares/async-handler'
import { ensureAuthenticated } from '../../../infra/http/middlewares/auth'
import { validate } from '../../../infra/http/middlewares/validate'
import { CategoriesController } from '../../../modules/categories/controllers/CategoriesController'
import {
  createCategorySchema,
  updateCategorySchema,
} from '../../../modules/categories/schemas/category.schemas'

const controller = new CategoriesController()
export const categoriesRoutes = Router()

categoriesRoutes.use(ensureAuthenticated)

categoriesRoutes.get('/', asyncHandler((req, res) => controller.list(req, res)))
categoriesRoutes.post(
  '/',
  validate(createCategorySchema),
  asyncHandler((req, res) => controller.create(req, res)),
)
categoriesRoutes.get('/:id', asyncHandler((req, res) => controller.show(req, res)))
categoriesRoutes.patch(
  '/:id',
  validate(updateCategorySchema),
  asyncHandler((req, res) => controller.update(req, res)),
)
categoriesRoutes.delete('/:id', asyncHandler((req, res) => controller.delete(req, res)))
