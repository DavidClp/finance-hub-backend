import { Request, Response } from 'express'
import { PrismaPlanningsRepository } from '../repositories/PrismaPlanningsRepository'
import {
  CreatePlanningUseCase,
  DeletePlanningUseCase,
  GetPlanningUseCase,
  ListPlanningsUseCase,
  UpdatePlanningItemUseCase,
  UpdatePlanningUseCase,
} from '../use-cases/planning.use-cases'

const planningsRepository = new PrismaPlanningsRepository()

export class PlanningsController {
  async create(request: Request, response: Response) {
    const useCase = new CreatePlanningUseCase(planningsRepository)
    const data = await useCase.execute(request.user!.id, request.body)
    return response.status(201).json({ data })
  }

  async list(request: Request, response: Response) {
    const useCase = new ListPlanningsUseCase(planningsRepository)
    const data = await useCase.execute(request.user!.id)
    return response.status(200).json({ data })
  }

  async show(request: Request, response: Response) {
    const useCase = new GetPlanningUseCase(planningsRepository)
    const data = await useCase.execute(request.user!.id, request.params.id)
    return response.status(200).json({ data })
  }

  async update(request: Request, response: Response) {
    const useCase = new UpdatePlanningUseCase(planningsRepository)
    const data = await useCase.execute(request.user!.id, request.params.id, request.body)
    return response.status(200).json({ data })
  }

  async delete(request: Request, response: Response) {
    const useCase = new DeletePlanningUseCase(planningsRepository)
    await useCase.execute(request.user!.id, request.params.id)
    return response.status(204).send()
  }

  async updateItem(request: Request, response: Response) {
    const useCase = new UpdatePlanningItemUseCase(planningsRepository)
    const data = await useCase.execute(
      request.user!.id,
      request.params.planningId,
      request.params.itemId,
      request.body,
    )
    return response.status(200).json({ data })
  }
}
