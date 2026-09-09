import { prisma } from '../../../infra/database/prisma'
import { CreateUserData, IUsersRepository, UserRecord } from './IUsersRepository'

export class PrismaUsersRepository implements IUsersRepository {
  async create(data: CreateUserData): Promise<UserRecord> {
    return prisma.user.create({ data })
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { email } })
  }

  async findById(id: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { id } })
  }
}
