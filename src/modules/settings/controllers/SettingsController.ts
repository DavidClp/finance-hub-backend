import { Request, Response } from 'express'
import { PrismaUsersRepository } from '../../auth/repositories/PrismaUsersRepository'
import { GetSettingsUseCase, UpdateSettingsUseCase } from '../use-cases/settings.use-cases'

const usersRepository = new PrismaUsersRepository()

export class SettingsController {
  async show(request: Request, response: Response) {
    const useCase = new GetSettingsUseCase(usersRepository)
    const data = await useCase.execute(request.user!.id)
    return response.status(200).json({ data })
  }

  async update(request: Request, response: Response) {
    const useCase = new UpdateSettingsUseCase(usersRepository)
    const data = await useCase.execute(request.user!.id, request.body)
    return response.status(200).json({ data })
  }
}
