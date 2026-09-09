import { Request, Response } from 'express'
import { PrismaCreditCardsRepository } from '../repositories/PrismaCreditCardsRepository'
import {
  CreateCreditCardUseCase,
  DeleteCreditCardUseCase,
  GetCreditCardUseCase,
  ListCreditCardsUseCase,
  UpdateCreditCardUseCase,
} from '../use-cases/credit-card.use-cases'

const creditCardsRepository = new PrismaCreditCardsRepository()

export class CreditCardsController {
  async create(request: Request, response: Response) {
    const useCase = new CreateCreditCardUseCase(creditCardsRepository)
    const data = await useCase.execute(request.user!.id, request.body)
    return response.status(201).json({ data })
  }

  async list(request: Request, response: Response) {
    const useCase = new ListCreditCardsUseCase(creditCardsRepository)
    const data = await useCase.execute(request.user!.id)
    return response.status(200).json({ data })
  }

  async show(request: Request, response: Response) {
    const useCase = new GetCreditCardUseCase(creditCardsRepository)
    const data = await useCase.execute(request.user!.id, request.params.id)
    return response.status(200).json({ data })
  }

  async update(request: Request, response: Response) {
    const useCase = new UpdateCreditCardUseCase(creditCardsRepository)
    const data = await useCase.execute(request.user!.id, request.params.id, request.body)
    return response.status(200).json({ data })
  }

  async delete(request: Request, response: Response) {
    const useCase = new DeleteCreditCardUseCase(creditCardsRepository)
    await useCase.execute(request.user!.id, request.params.id)
    return response.status(204).send()
  }
}
