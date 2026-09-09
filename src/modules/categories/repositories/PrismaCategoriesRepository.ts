import { prisma } from '../../../infra/database/prisma'
import {
  CategoryRecord,
  CreateCategoryData,
  ICategoriesRepository,
  UpdateCategoryData,
} from './ICategoriesRepository'

export class PrismaCategoriesRepository implements ICategoriesRepository {
  async create(data: CreateCategoryData): Promise<CategoryRecord> {
    return prisma.category.create({ data })
  }

  async findManyByUser(userId: string): Promise<CategoryRecord[]> {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: string, userId: string): Promise<CategoryRecord | null> {
    return prisma.category.findFirst({ where: { id, userId } })
  }

  async update(id: string, userId: string, data: UpdateCategoryData): Promise<CategoryRecord> {
    return prisma.category.update({
      where: { id },
      data,
    })
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.category.deleteMany({ where: { id, userId } })
  }

  async countTransactions(categoryId: string, userId: string): Promise<number> {
    return prisma.transaction.count({ where: { categoryId, userId } })
  }
}
