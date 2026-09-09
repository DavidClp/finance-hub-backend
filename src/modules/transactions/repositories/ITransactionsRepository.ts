import { PaymentMethod, Transaction, TransactionType } from '@prisma/client'

export type TransactionRecord = Transaction

export interface CreateTransactionData {
  userId: string
  accountId?: string | null
  creditCardId?: string | null
  categoryId: string
  description: string
  amount: number
  type: TransactionType
  date: Date
  paymentMethod: PaymentMethod
  notes?: string | null
  isInstallment: boolean
  installmentCount?: number | null
  installmentNumber?: number | null
}

export interface UpdateTransactionData {
  accountId?: string | null
  creditCardId?: string | null
  categoryId?: string
  description?: string
  amount?: number
  type?: TransactionType
  date?: Date
  paymentMethod?: PaymentMethod
  notes?: string | null
  isInstallment?: boolean
  installmentCount?: number | null
  installmentNumber?: number | null
}

export interface ListTransactionsFilters {
  userId: string
  month?: number
  year?: number
  type?: TransactionType
  categoryId?: string
  creditCardId?: string
  search?: string
  page: number
  pageSize: number
  sort: 'date' | 'amount' | 'description'
  order: 'asc' | 'desc'
}

export interface ITransactionsRepository {
  create(data: CreateTransactionData): Promise<TransactionRecord>
  createMany(data: CreateTransactionData[]): Promise<TransactionRecord[]>
  findMany(filters: ListTransactionsFilters): Promise<{ items: TransactionRecord[]; total: number }>
  findById(id: string, userId: string): Promise<TransactionRecord | null>
  update(id: string, data: UpdateTransactionData): Promise<TransactionRecord>
  delete(id: string, userId: string): Promise<void>
  categoryBelongsToUser(categoryId: string, userId: string): Promise<boolean>
  creditCardBelongsToUser(creditCardId: string, userId: string): Promise<boolean>
}
