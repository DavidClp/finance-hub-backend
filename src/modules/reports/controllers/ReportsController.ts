import { Request, Response } from 'express'
import { GetExpensesReportUseCase } from '../use-cases/get-expenses-report.use-case'

export class ReportsController {
  async expenses(request: Request, response: Response) {
    const useCase = new GetExpensesReportUseCase()
    const query = request.query as unknown as {
      from: Date
      to: Date
      groupBy: 'day' | 'month' | 'category' | 'card'
      type?: 'income' | 'expense'
      categoryId?: string
      creditCardId?: string
    }

    const data = await useCase.execute(request.user!.id, query)
    return response.status(200).json({ data })
  }
}
