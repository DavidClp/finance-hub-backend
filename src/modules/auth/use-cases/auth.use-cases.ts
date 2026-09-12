import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { env } from '../../../shared/config/env'
import { ConflictError, UnauthorizedError } from '../../../shared/errors/AppError'
import { IUsersRepository } from '../repositories/IUsersRepository'

interface RegisterInput {
  name: string
  email: string
  password: string
}

export class RegisterUserUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(input: RegisterInput) {
    const existing = await this.usersRepository.findByEmail(input.email)

    if (existing) {
      throw new ConflictError('E-mail já cadastrado.')
    }

    const passwordHash = await bcrypt.hash(input.password, 10)
    const user = await this.usersRepository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
    })

    const token = this.signToken(user.id, user.email)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    }
  }

  private signToken(userId: string, email: string) {
    const options: SignOptions = {
      expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
    }

    return jwt.sign({ sub: userId, email }, env.jwtSecret, options)
  }
}

export class LoginUserUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(input: { email: string; password: string }) {
    const user = await this.usersRepository.findByEmail(input.email.toLowerCase())

    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas.')
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash)

    if (!valid) {
      throw new UnauthorizedError('Credenciais inválidas.')
    }

    const options: SignOptions = {
      expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, options)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    }
  }
}

export class GetMeUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(userId: string) {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado.')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      preferences: {
        creditCardNextMonth: user.creditCardNextMonth,
      },
    }
  }
}
