import { Prisma } from '@prisma/client'
import { prisma } from '../../../infra/database/prisma'
import { fromCents } from '../../../shared/utils/money'

type GroupBy = 'day' | 'month' | 'category' | 'card'

interface ReportInput {
  from: Date
  to: Date
  groupBy: GroupBy
  type?: 'income' | 'expense'
  categoryId?: string
  creditCardId?: string
}

export class GetExpensesReportUseCase {
  async execute(userId: string, input: ReportInput) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      date: {
        gte: input.from,
        lte: input.to,
      },
      type: input.type ?? 'expense',
    }

    if (input.categoryId) where.categoryId = input.categoryId
    if (input.creditCardId) where.creditCardId = input.creditCardId

    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        amount: true,
        date: true,
        categoryId: true,
        creditCardId: true,
        type: true,
      },
      orderBy: { date: 'asc' },
    })

    const buckets = new Map<string, number>()

    for (const tx of transactions) {
      let key: string

      switch (input.groupBy) {
        case 'day':
          key = tx.date.toISOString().slice(0, 10)
          break
        case 'month':
          key = `${tx.date.getUTCFullYear()}-${String(tx.date.getUTCMonth() + 1).padStart(2, '0')}`
          break
        case 'category':
          key = tx.categoryId
          break
        case 'card':
          key = tx.creditCardId ?? 'no-card'
          break
        default:
          key = 'unknown'
      }

      buckets.set(key, (buckets.get(key) ?? 0) + tx.amount)
    }

    let labels = new Map<string, string>()

    if (input.groupBy === 'category') {
      const categories = await prisma.category.findMany({ where: { userId } })
      labels = new Map(categories.map((c) => [c.id, c.name]))
    }

    if (input.groupBy === 'card') {
      const cards = await prisma.creditCard.findMany({ where: { userId } })
      labels = new Map(cards.map((c) => [c.id, c.name]))
      labels.set('no-card', 'Sem cartão')
    }

    const groups = Array.from(buckets.entries()).map(([key, amountCents]) => ({
      key,
      label:
        input.groupBy === 'category' || input.groupBy === 'card'
          ? labels.get(key) ?? key
          : key,
      amount: fromCents(amountCents),
    }))

    const total = fromCents(transactions.reduce((sum, tx) => sum + tx.amount, 0))

    return {
      from: input.from.toISOString(),
      to: input.to.toISOString(),
      groupBy: input.groupBy,
      total,
      groups,
    }
  }
}
