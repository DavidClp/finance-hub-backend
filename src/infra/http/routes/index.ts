import { Router } from 'express'
import { authRoutes } from './auth.routes'
import { categoriesRoutes } from './categories.routes'
import { creditCardsRoutes } from './credit-cards.routes'
import { dashboardRoutes } from './dashboard.routes'
import { planningsRoutes } from './plannings.routes'
import { reportsRoutes } from './reports.routes'
import { transactionsRoutes } from './transactions.routes'

export const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/categories', categoriesRoutes)
routes.use('/credit-cards', creditCardsRoutes)
routes.use('/transactions', transactionsRoutes)
routes.use('/plannings', planningsRoutes)
routes.use('/dashboard', dashboardRoutes)
routes.use('/reports', reportsRoutes)
