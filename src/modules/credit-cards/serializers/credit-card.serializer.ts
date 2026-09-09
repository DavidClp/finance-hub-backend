import { fromCents } from '../../../shared/utils/money'
import { CreditCardRecord } from '../repositories/ICreditCardsRepository'

export function serializeCreditCard(card: CreditCardRecord) {
  return {
    id: card.id,
    name: card.name,
    bank: card.bank,
    brand: card.brand,
    lastFourDigits: card.lastFourDigits,
    limit: fromCents(card.limitAmount),
    closingDay: card.closingDay,
    dueDay: card.dueDay,
    color: card.color,
  }
}

export function serializeCreditCardUsage(card: CreditCardRecord, usedCents: number) {
  const limit = fromCents(card.limitAmount)
  const used = fromCents(usedCents)
  const available = fromCents(Math.max(card.limitAmount - usedCents, 0))
  const usagePercentage =
    card.limitAmount > 0 ? Number(((usedCents / card.limitAmount) * 100).toFixed(2)) : 0

  return {
    ...serializeCreditCard(card),
    used,
    available,
    usagePercentage,
  }
}
