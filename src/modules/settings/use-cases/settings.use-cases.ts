import { UnauthorizedError } from '../../../shared/errors/AppError'
import { IUsersRepository } from '../../auth/repositories/IUsersRepository'

function serializePreferences(creditCardNextMonth: boolean) {
  return {
    preferences: {
      creditCardNextMonth,
    },
  }
}

export class GetSettingsUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(userId: string) {
    const user = await this.usersRepository.findById(userId)
    if (!user) throw new UnauthorizedError('Usuário não encontrado.')
    return serializePreferences(user.creditCardNextMonth)
  }
}

export class UpdateSettingsUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(userId: string, input: { creditCardNextMonth?: boolean }) {
    const user = await this.usersRepository.findById(userId)
    if (!user) throw new UnauthorizedError('Usuário não encontrado.')

    const updated = await this.usersRepository.updatePreferences(userId, {
      creditCardNextMonth: input.creditCardNextMonth ?? user.creditCardNextMonth,
    })

    return serializePreferences(updated.creditCardNextMonth)
  }
}
