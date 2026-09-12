import { Router } from 'express'
import { asyncHandler } from '../../../infra/http/middlewares/async-handler'
import { ensureAuthenticated } from '../../../infra/http/middlewares/auth'
import { validate } from '../../../infra/http/middlewares/validate'
import { SettingsController } from '../../../modules/settings/controllers/SettingsController'
import { updateSettingsSchema } from '../../../modules/settings/schemas/settings.schemas'

const controller = new SettingsController()
export const settingsRoutes = Router()

settingsRoutes.use(ensureAuthenticated)

settingsRoutes.get('/', asyncHandler((req, res) => controller.show(req, res)))
settingsRoutes.patch(
  '/',
  validate(updateSettingsSchema),
  asyncHandler((req, res) => controller.update(req, res)),
)
