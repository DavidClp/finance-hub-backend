import { createApp } from './app'
import { env } from './shared/config/env'

const app = createApp()

app.listen(env.port, () => {
  console.log(`FinanceHub API rodando em http://localhost:${env.port}`)
})
