import { CardBrand, CreditCard } from '@prisma/client'

export type CreditCardRecord = CreditCard

export interface CreateCreditCardData {
  userId: string
  name: string
  bank: string
  brand: CardBrand
  lastFourDigits: string
  limitAmount: number
  closingDay: number
  dueDay: number
  color: string
}

export interface UpdateCreditCardData {
  name?: string
  bank?: string
  brand?: CardBrand
  lastFourDigits?: string
  limitAmount?: number
  closingDay?: number
  dueDay?: number
  color?: string
}

export interface ICreditCardsRepository {
  create(data: CreateCreditCardData): Promise<CreditCardRecord>
  findManyByUser(userId: string): Promise<CreditCardRecord[]>
  findById(id: string, userId: string): Promise<CreditCardRecord | null>
  update(id: string, userId: string, data: UpdateCreditCardData): Promise<CreditCardRecord>
  delete(id: string, userId: string): Promise<void>
  countTransactions(creditCardId: string, userId: string): Promise<number>
  sumExpensesByCard(creditCardId: string, userId: string): Promise<number>
}
