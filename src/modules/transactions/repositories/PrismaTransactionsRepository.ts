import { Prisma } from '@prisma/client'
import { prisma } from '../../../infra/database/prisma'
import { getSkipTake } from '../../../shared/utils/pagination'
import {
  CreateTransactionData,
  ITransactionsRepository,
  ListTransactionsFilters,
  TransactionRecord,
  UpdateTransactionData,
} from './ITransactionsRepository'

export class PrismaTransactionsRepository implements ITransactionsRepository {
  async create(data: CreateTransactionData): Promise<TransactionRecord> {
    return prisma.transaction.create({ data })
  }

  async createMany(data: CreateTransactionData[]): Promise<TransactionRecord[]> {
    return prisma.$transaction(data.map((item) => prisma.transaction.create({ data: item })))
  }

  async findMany(
    filters: ListTransactionsFilters,
  ): Promise<{ items: TransactionRecord[]; total: number }> {
    const where: Prisma.TransactionWhereInput = {
      userId: filters.userId,
    }

    if (filters.type) where.type = filters.type
    if (filters.categoryId) where.categoryId = filters.categoryId
    if (filters.creditCardId) where.creditCardId = filters.creditCardId

    const dateField = filters.periodBy === 'purchase' ? 'date' : 'paymentDate'

    if (filters.month !== undefined && filters.year !== undefined) {
      const start = new Date(Date.UTC(filters.year, filters.month - 1, 1))
      const end = new Date(Date.UTC(filters.year, filters.month, 1))
      where[dateField] = { gte: start, lt: end }
    } else if (filters.year !== undefined) {
      const start = new Date(Date.UTC(filters.year, 0, 1))
      const end = new Date(Date.UTC(filters.year + 1, 0, 1))
      where[dateField] = { gte: start, lt: end }
    }

    if (filters.search) {
      where.description = {
        contains: filters.search,
        mode: 'insensitive',
      }
    }

    const { skip, take } = getSkipTake(filters.page, filters.pageSize)

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { [filters.sort]: filters.order },
        skip,
        take,
      }),
      prisma.transaction.count({ where }),
    ])

    return { items, total }
  }

  async findById(id: string, userId: string): Promise<TransactionRecord | null> {
    return prisma.transaction.findFirst({ where: { id, userId } })
  }

  async update(id: string, data: UpdateTransactionData): Promise<TransactionRecord> {
    return prisma.transaction.update({ where: { id }, data })
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.transaction.deleteMany({ where: { id, userId } })
  }

  async categoryBelongsToUser(categoryId: string, userId: string): Promise<boolean> {
    const count = await prisma.category.count({ where: { id: categoryId, userId } })
    return count > 0
  }

  async creditCardBelongsToUser(creditCardId: string, userId: string): Promise<boolean> {
    const count = await prisma.creditCard.count({ where: { id: creditCardId, userId } })
    return count > 0
  }
}
