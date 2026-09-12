import { toCents } from '../../../shared/utils/money'
import { addMonths, resolvePaymentDate } from '../../../shared/utils/date'
import { buildPagination } from '../../../shared/utils/pagination'
import { NotFoundError, UnauthorizedError, ValidationError } from '../../../shared/errors/AppError'
import { IUsersRepository } from '../../auth/repositories/IUsersRepository'
import { ITransactionsRepository } from '../repositories/ITransactionsRepository'
import { serializeTransaction } from '../serializers/transaction.serializer'

type CreateInput = {
  description: string
  amount: number
  type: 'income' | 'expense'
  date: Date
  categoryId: string
  paymentMethod: 'cash' | 'pix' | 'debit' | 'credit' | 'boleto' | 'transfer' | 'other'
  creditCardId?: string
  accountId?: string
  notes?: string
  isInstallment: boolean
  installmentCount?: number
  installmentNumber?: number
}

type ListInput = {
  month?: number
  year?: number
  type?: 'income' | 'expense'
  categoryId?: string
  creditCardId?: string
  search?: string
  periodBy?: 'payment' | 'purchase'
  page: number
  pageSize: number
  sort: 'date' | 'paymentDate' | 'amount' | 'description'
  order: 'asc' | 'desc'
}

async function getCreditCardNextMonth(usersRepository: IUsersRepository, userId: string) {
  const user = await usersRepository.findById(userId)
  if (!user) throw new UnauthorizedError('Usuário não encontrado.')
  return user.creditCardNextMonth
}

async function assertReferences(
  repository: ITransactionsRepository,
  userId: string,
  categoryId?: string,
  creditCardId?: string | null,
) {
  if (categoryId) {
    const ok = await repository.categoryBelongsToUser(categoryId, userId)
    if (!ok) throw new ValidationError('Categoria inválida para este usuário.', {
      categoryId: ['Categoria não encontrada.'],
    })
  }

  if (creditCardId) {
    const ok = await repository.creditCardBelongsToUser(creditCardId, userId)
    if (!ok) throw new ValidationError('Cartão inválido para este usuário.', {
      creditCardId: ['Cartão não encontrado.'],
    })
  }
}

export class CreateTransactionUseCase {
  constructor(
    private transactionsRepository: ITransactionsRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async execute(userId: string, input: CreateInput) {
    await assertReferences(
      this.transactionsRepository,
      userId,
      input.categoryId,
      input.creditCardId,
    )

    const creditCardNextMonth = await getCreditCardNextMonth(this.usersRepository, userId)
    const basePaymentDate = resolvePaymentDate(
      input.date,
      input.paymentMethod,
      creditCardNextMonth,
    )

    const base = {
      userId,
      description: input.description,
      amount: toCents(input.amount),
      type: input.type,
      categoryId: input.categoryId,
      paymentMethod: input.paymentMethod,
      creditCardId: input.paymentMethod === 'credit' ? (input.creditCardId ?? null) : null,
      accountId: input.accountId ?? null,
      notes: input.notes ?? null,
    }

    if (input.isInstallment && input.installmentCount) {
      const currentNumber = input.installmentNumber ?? 1
      const count = input.installmentCount

      const parcels = Array.from({ length: count }, (_, index) => {
        const installmentNumber = index + 1
        const monthsOffset = installmentNumber - currentNumber

        return {
          ...base,
          date: input.date,
          paymentDate: addMonths(basePaymentDate, monthsOffset),
          isInstallment: true,
          installmentCount: count,
          installmentNumber,
        }
      })

      const created = await this.transactionsRepository.createMany(parcels)
      const current =
        created.find((item) => item.installmentNumber === currentNumber) ?? created[0]

      return {
        ...serializeTransaction(current),
        createdInstallments: created.length,
      }
    }

    const transaction = await this.transactionsRepository.create({
      ...base,
      date: input.date,
      paymentDate: basePaymentDate,
      isInstallment: false,
      installmentCount: null,
      installmentNumber: null,
    })

    return serializeTransaction(transaction)
  }
}

export class ListTransactionsUseCase {
  constructor(private transactionsRepository: ITransactionsRepository) {}

  async execute(userId: string, input: ListInput) {
    const { items, total } = await this.transactionsRepository.findMany({
      userId,
      ...input,
    })

    return {
      data: items.map(serializeTransaction),
      pagination: buildPagination(input.page, input.pageSize, total),
    }
  }
}

export class GetTransactionUseCase {
  constructor(private transactionsRepository: ITransactionsRepository) {}

  async execute(userId: string, id: string) {
    const transaction = await this.transactionsRepository.findById(id, userId)
    if (!transaction) throw new NotFoundError('Movimentação não encontrada.')
    return serializeTransaction(transaction)
  }
}

export class UpdateTransactionUseCase {
  constructor(
    private transactionsRepository: ITransactionsRepository,
    private usersRepository: IUsersRepository,
  ) {}

  async execute(userId: string, id: string, input: Partial<CreateInput> & {
    creditCardId?: string | null
    accountId?: string | null
    notes?: string | null
    installmentCount?: number | null
    installmentNumber?: number | null
  }) {
    const existing = await this.transactionsRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Movimentação não encontrada.')

    const merged = {
      description: input.description ?? existing.description,
      amount: input.amount ?? existing.amount / 100,
      type: input.type ?? existing.type,
      date: input.date ?? existing.date,
      categoryId: input.categoryId ?? existing.categoryId,
      paymentMethod: input.paymentMethod ?? existing.paymentMethod,
      creditCardId:
        input.creditCardId !== undefined ? input.creditCardId : existing.creditCardId,
      accountId: input.accountId !== undefined ? input.accountId : existing.accountId,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      isInstallment: input.isInstallment ?? existing.isInstallment,
      installmentCount:
        input.installmentCount !== undefined
          ? input.installmentCount
          : existing.installmentCount,
      installmentNumber:
        input.installmentNumber !== undefined
          ? input.installmentNumber
          : existing.installmentNumber,
    }

    if (merged.paymentMethod === 'credit' && !merged.creditCardId) {
      throw new ValidationError('creditCardId é obrigatório para pagamento com crédito.', {
        creditCardId: ['Obrigatório.'],
      })
    }

    if (merged.isInstallment) {
      if (!['credit', 'boleto'].includes(merged.paymentMethod)) {
        throw new ValidationError('Parcelamento só é permitido para crédito ou boleto.')
      }
      if (!merged.installmentCount) {
        throw new ValidationError('Dados de parcelamento incompletos.')
      }
      const installmentNumber = merged.installmentNumber ?? 1
      if (installmentNumber > merged.installmentCount) {
        throw new ValidationError('installmentNumber inválido.')
      }
      merged.installmentNumber = installmentNumber
    }

    await assertReferences(
      this.transactionsRepository,
      userId,
      merged.categoryId,
      merged.creditCardId,
    )

    const creditCardNextMonth = await getCreditCardNextMonth(this.usersRepository, userId)
    const installmentOffset = merged.isInstallment ? (merged.installmentNumber ?? 1) - 1 : 0
    const paymentDate = addMonths(
      resolvePaymentDate(merged.date, merged.paymentMethod, creditCardNextMonth),
      installmentOffset,
    )

    const transaction = await this.transactionsRepository.update(id, {
      description: merged.description,
      amount: toCents(merged.amount),
      type: merged.type,
      date: merged.date,
      paymentDate,
      categoryId: merged.categoryId,
      paymentMethod: merged.paymentMethod,
      creditCardId: merged.paymentMethod === 'credit' ? merged.creditCardId : null,
      accountId: merged.accountId,
      notes: merged.notes,
      isInstallment: merged.isInstallment,
      installmentCount: merged.isInstallment ? merged.installmentCount : null,
      installmentNumber: merged.isInstallment ? (merged.installmentNumber ?? 1) : null,
    })

    return serializeTransaction(transaction)
  }
}

export class DeleteTransactionUseCase {
  constructor(private transactionsRepository: ITransactionsRepository) {}

  async execute(userId: string, id: string) {
    const existing = await this.transactionsRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Movimentação não encontrada.')
    await this.transactionsRepository.delete(id, userId)
  }
}
