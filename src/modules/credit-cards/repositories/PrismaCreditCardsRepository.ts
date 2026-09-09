import { prisma } from '../../../infra/database/prisma'
import {
  CreateCreditCardData,
  CreditCardRecord,
  ICreditCardsRepository,
  UpdateCreditCardData,
} from './ICreditCardsRepository'

export class PrismaCreditCardsRepository implements ICreditCardsRepository {
  async create(data: CreateCreditCardData): Promise<CreditCardRecord> {
    return prisma.creditCard.create({ data })
  }

  async findManyByUser(userId: string): Promise<CreditCardRecord[]> {
    return prisma.creditCard.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: string, userId: string): Promise<CreditCardRecord | null> {
    return prisma.creditCard.findFirst({ where: { id, userId } })
  }

  async update(id: string, _userId: string, data: UpdateCreditCardData): Promise<CreditCardRecord> {
    return prisma.creditCard.update({ where: { id }, data })
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.creditCard.deleteMany({ where: { id, userId } })
  }

  async countTransactions(creditCardId: string, userId: string): Promise<number> {
    return prisma.transaction.count({ where: { creditCardId, userId } })
  }

  async sumExpensesByCard(creditCardId: string, userId: string): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: {
        creditCardId,
        userId,
        type: 'expense',
      },
      _sum: { amount: true },
    })

    return result._sum.amount ?? 0
  }
}
