import { prisma } from '../../../infra/database/prisma'
import { fromCents } from '../../../shared/utils/money'
import { serializeTransaction } from '../../transactions/serializers/transaction.serializer'

export class GetDashboardSummaryUseCase {
  async execute(userId: string, month: number, year: number) {
    const start = new Date(Date.UTC(year, month - 1, 1))
    const end = new Date(Date.UTC(year, month, 1))

    const monthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lt: end },
      },
      orderBy: { date: 'desc' },
    })

    const incomeCents = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expensesCents = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const accounts = await prisma.account.findMany({ where: { userId } })
    const balanceFromAccounts = accounts.reduce((sum, a) => sum + a.balance, 0)

    const allAgg = await prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    })

    const totalIncome =
      allAgg.find((row) => row.type === 'income')?._sum.amount ?? 0
    const totalExpense =
      allAgg.find((row) => row.type === 'expense')?._sum.amount ?? 0

    const monthBalanceCents = incomeCents - expensesCents

    const accumulatedBalanceCents =
      accounts.length > 0 ? balanceFromAccounts : totalIncome - totalExpense

    const plannings = await prisma.planning.findMany({
      where: { userId },
      include: { items: true },
    })

    const committedCents = plannings.reduce((sum, planning) => {
      const remaining = planning.items
        .filter((item) => !item.completed)
        .reduce((itemSum, item) => itemSum + item.amount, 0)
      return sum + remaining
    }, 0)

    const evolutionStart = new Date(Date.UTC(year, month - 6, 1))
    const evolutionTx = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: evolutionStart, lt: end },
      },
      select: { date: true, amount: true, type: true },
    })

    const evolutionMap = new Map<string, { income: number; expenses: number }>()

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(year, month - 1 - i, 1))
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
      evolutionMap.set(key, { income: 0, expenses: 0 })
    }

    for (const tx of evolutionTx) {
      const key = `${tx.date.getUTCFullYear()}-${String(tx.date.getUTCMonth() + 1).padStart(2, '0')}`
      const bucket = evolutionMap.get(key)
      if (!bucket) continue
      if (tx.type === 'income') bucket.income += tx.amount
      else bucket.expenses += tx.amount
    }

    const evolution = Array.from(evolutionMap.entries()).map(([period, values]) => ({
      period,
      income: fromCents(values.income),
      expenses: fromCents(values.expenses),
    }))

    const categories = await prisma.category.findMany({ where: { userId } })
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))

    const expensesByCategoryMap = new Map<string, number>()
    for (const tx of monthTransactions.filter((t) => t.type === 'expense')) {
      expensesByCategoryMap.set(
        tx.categoryId,
        (expensesByCategoryMap.get(tx.categoryId) ?? 0) + tx.amount,
      )
    }

    const expensesByCategory = Array.from(expensesByCategoryMap.entries()).map(
      ([categoryId, amount]) => ({
        categoryId,
        category: categoryNameById.get(categoryId) ?? 'Desconhecida',
        amount: fromCents(amount),
      }),
    )

    const cards = await prisma.creditCard.findMany({ where: { userId } })
    const cardNameById = new Map(cards.map((c) => [c.id, c.name]))

    const expensesByCardMap = new Map<string, number>()
    for (const tx of monthTransactions.filter((t) => t.type === 'expense' && t.creditCardId)) {
      const cardId = tx.creditCardId!
      expensesByCardMap.set(cardId, (expensesByCardMap.get(cardId) ?? 0) + tx.amount)
    }

    const expensesByCard = Array.from(expensesByCardMap.entries()).map(([creditCardId, amount]) => ({
      creditCardId,
      card: cardNameById.get(creditCardId) ?? 'Desconhecido',
      amount: fromCents(amount),
    }))

    const recentTransactions = monthTransactions.slice(0, 8).map(serializeTransaction)

    return {
      monthBalance: fromCents(monthBalanceCents),
      accumulatedBalance: fromCents(accumulatedBalanceCents),
      income: fromCents(incomeCents),
      expenses: fromCents(expensesCents),
      committed: fromCents(committedCents),
      evolution,
      expensesByCategory,
      expensesByCard,
      recentTransactions,
    }
  }
}
