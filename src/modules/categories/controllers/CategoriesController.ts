import { Request, Response } from 'express'
import { PrismaCategoriesRepository } from '../repositories/PrismaCategoriesRepository'
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoryUseCase,
  ListCategoriesUseCase,
  UpdateCategoryUseCase,
} from '../use-cases/category.use-cases'

const categoriesRepository = new PrismaCategoriesRepository()

export class CategoriesController {
  async create(request: Request, response: Response) {
    const useCase = new CreateCategoryUseCase(categoriesRepository)
    const data = await useCase.execute(request.user!.id, request.body)
    return response.status(201).json({ data })
  }

  async list(request: Request, response: Response) {
    const useCase = new ListCategoriesUseCase(categoriesRepository)
    const data = await useCase.execute(request.user!.id)
    return response.status(200).json({ data })
  }

  async show(request: Request, response: Response) {
    const useCase = new GetCategoryUseCase(categoriesRepository)
    const data = await useCase.execute(request.user!.id, request.params.id)
    return response.status(200).json({ data })
  }

  async update(request: Request, response: Response) {
    const useCase = new UpdateCategoryUseCase(categoriesRepository)
    const data = await useCase.execute(request.user!.id, request.params.id, request.body)
    return response.status(200).json({ data })
  }

  async delete(request: Request, response: Response) {
    const useCase = new DeleteCategoryUseCase(categoriesRepository)
    await useCase.execute(request.user!.id, request.params.id)
    return response.status(204).send()
  }
}
