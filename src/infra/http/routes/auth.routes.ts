import { Router } from 'express'
import { asyncHandler } from '../../../infra/http/middlewares/async-handler'
import { ensureAuthenticated } from '../../../infra/http/middlewares/auth'
import { validate } from '../../../infra/http/middlewares/validate'
import { AuthController } from '../../../modules/auth/controllers/AuthController'
import { loginSchema, registerSchema } from '../../../modules/auth/schemas/auth.schemas'

const authController = new AuthController()
export const authRoutes = Router()

authRoutes.post(
  '/register',
  validate(registerSchema),
  asyncHandler((req, res) => authController.register(req, res)),
)
authRoutes.post(
  '/login',
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res)),
)
authRoutes.get(
  '/me',
  ensureAuthenticated,
  asyncHandler((req, res) => authController.me(req, res)),
)
