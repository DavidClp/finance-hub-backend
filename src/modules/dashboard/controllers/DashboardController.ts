import { Request, Response } from 'express'
import { GetDashboardSummaryUseCase } from '../use-cases/get-dashboard-summary.use-case'

export class DashboardController {
  async summary(request: Request, response: Response) {
    const useCase = new GetDashboardSummaryUseCase()
    const query = request.query as unknown as { month: number; year: number }
    const data = await useCase.execute(request.user!.id, query.month, query.year)
    return response.status(200).json({ data })
  }
}
