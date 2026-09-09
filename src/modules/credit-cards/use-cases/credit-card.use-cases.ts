import { toCents } from '../../../shared/utils/money'
import { ConflictError, NotFoundError } from '../../../shared/errors/AppError'
import { ICreditCardsRepository } from '../repositories/ICreditCardsRepository'
import {
  serializeCreditCard,
  serializeCreditCardUsage,
} from '../serializers/credit-card.serializer'

type CardInput = {
  name: string
  bank: string
  brand: 'visa' | 'mastercard' | 'elo' | 'amex'
  lastFourDigits: string
  limit: number
  closingDay: number
  dueDay: number
  color: string
}

export class CreateCreditCardUseCase {
  constructor(private creditCardsRepository: ICreditCardsRepository) {}

  async execute(userId: string, input: CardInput) {
    const card = await this.creditCardsRepository.create({
      userId,
      name: input.name,
      bank: input.bank,
      brand: input.brand,
      lastFourDigits: input.lastFourDigits,
      limitAmount: toCents(input.limit),
      closingDay: input.closingDay,
      dueDay: input.dueDay,
      color: input.color,
    })

    return serializeCreditCard(card)
  }
}

export class ListCreditCardsUseCase {
  constructor(private creditCardsRepository: ICreditCardsRepository) {}

  async execute(userId: string) {
    const cards = await this.creditCardsRepository.findManyByUser(userId)
    return cards.map(serializeCreditCard)
  }
}

export class GetCreditCardUseCase {
  constructor(private creditCardsRepository: ICreditCardsRepository) {}

  async execute(userId: string, id: string) {
    const card = await this.creditCardsRepository.findById(id, userId)
    if (!card) throw new NotFoundError('Cartão não encontrado.')

    const usedCents = await this.creditCardsRepository.sumExpensesByCard(id, userId)
    return serializeCreditCardUsage(card, usedCents)
  }
}

export class UpdateCreditCardUseCase {
  constructor(private creditCardsRepository: ICreditCardsRepository) {}

  async execute(userId: string, id: string, input: Partial<CardInput>) {
    const existing = await this.creditCardsRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Cartão não encontrado.')

    const card = await this.creditCardsRepository.update(id, userId, {
      name: input.name,
      bank: input.bank,
      brand: input.brand,
      lastFourDigits: input.lastFourDigits,
      limitAmount: input.limit !== undefined ? toCents(input.limit) : undefined,
      closingDay: input.closingDay,
      dueDay: input.dueDay,
      color: input.color,
    })

    return serializeCreditCard(card)
  }
}

export class DeleteCreditCardUseCase {
  constructor(private creditCardsRepository: ICreditCardsRepository) {}

  async execute(userId: string, id: string) {
    const existing = await this.creditCardsRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Cartão não encontrado.')

    const count = await this.creditCardsRepository.countTransactions(id, userId)
    if (count > 0) {
      throw new ConflictError(
        'Cartão possui movimentações vinculadas. Remova-as ou arquive o cartão.',
      )
    }

    await this.creditCardsRepository.delete(id, userId)
  }
}
