import cors from 'cors'
import express from 'express'
import { env } from './shared/config/env'
import { errorHandler } from './infra/http/middlewares/error-handler'
import { routes } from './infra/http/routes'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  )
  app.use(express.json())

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' })
  })

  app.use('/api/v1', routes)

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Rota não encontrada.',
      },
    })
  })

  app.use(errorHandler)

  return app
}
