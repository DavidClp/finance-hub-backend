import { Request, Response } from 'express'
import { PrismaUsersRepository } from '../repositories/PrismaUsersRepository'
import { GetMeUseCase, LoginUserUseCase, RegisterUserUseCase } from '../use-cases/auth.use-cases'

const usersRepository = new PrismaUsersRepository()

export class AuthController {
  async register(request: Request, response: Response) {
    const useCase = new RegisterUserUseCase(usersRepository)
    const data = await useCase.execute(request.body)
    return response.status(201).json({ data })
  }

  async login(request: Request, response: Response) {
    const useCase = new LoginUserUseCase(usersRepository)
    const data = await useCase.execute(request.body)
    return response.status(200).json({ data })
  }

  async me(request: Request, response: Response) {
    const useCase = new GetMeUseCase(usersRepository)
    const data = await useCase.execute(request.user!.id)
    return response.status(200).json({ data })
  }
}
