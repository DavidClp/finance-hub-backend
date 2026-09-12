import { fromCents } from '../../../shared/utils/money'
import { TransactionRecord } from '../repositories/ITransactionsRepository'

export function serializeTransaction(transaction: TransactionRecord) {
  return {
    id: transaction.id,
    description: transaction.description,
    amount: fromCents(transaction.amount),
    type: transaction.type,
    date: transaction.date.toISOString(),
    paymentDate: transaction.paymentDate.toISOString(),
    categoryId: transaction.categoryId,
    paymentMethod: transaction.paymentMethod,
    ...(transaction.creditCardId ? { creditCardId: transaction.creditCardId } : {}),
    ...(transaction.notes ? { notes: transaction.notes } : {}),
    ...(transaction.isInstallment
      ? {
          isInstallment: true,
          ...(transaction.installmentCount != null
            ? { installmentCount: transaction.installmentCount }
            : {}),
          ...(transaction.installmentNumber != null
            ? { installmentNumber: transaction.installmentNumber }
            : {}),
        }
      : { isInstallment: false }),
  }
}
