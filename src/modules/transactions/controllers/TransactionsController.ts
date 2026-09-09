import { Request, Response } from 'express'
import { PrismaTransactionsRepository } from '../repositories/PrismaTransactionsRepository'
import {
  CreateTransactionUseCase,
  DeleteTransactionUseCase,
  GetTransactionUseCase,
  ListTransactionsUseCase,
  UpdateTransactionUseCase,
} from '../use-cases/transaction.use-cases'

const transactionsRepository = new PrismaTransactionsRepository()

export class TransactionsController {
  async create(request: Request, response: Response) {
    const useCase = new CreateTransactionUseCase(transactionsRepository)
    const data = await useCase.execute(request.user!.id, request.body)
    return response.status(201).json({ data })
  }

  async list(request: Request, response: Response) {
    const useCase = new ListTransactionsUseCase(transactionsRepository)
    const result = await useCase.execute(
      request.user!.id,
      request.query as unknown as {
        month?: number
        year?: number
        type?: 'income' | 'expense'
        categoryId?: string
        creditCardId?: string
        search?: string
        page: number
        pageSize: number
        sort: 'date' | 'amount' | 'description'
        order: 'asc' | 'desc'
      },
    )
    return response.status(200).json(result)
  }

  async show(request: Request, response: Response) {
    const useCase = new GetTransactionUseCase(transactionsRepository)
    const data = await useCase.execute(request.user!.id, request.params.id)
    return response.status(200).json({ data })
  }

  async update(request: Request, response: Response) {
    const useCase = new UpdateTransactionUseCase(transactionsRepository)
    const data = await useCase.execute(request.user!.id, request.params.id, request.body)
    return response.status(200).json({ data })
  }

  async delete(request: Request, response: Response) {
    const useCase = new DeleteTransactionUseCase(transactionsRepository)
    await useCase.execute(request.user!.id, request.params.id)
    return response.status(204).send()
  }
}
