import { z } from 'zod'

const paymentMethodEnum = z.enum(['cash', 'pix', 'debit', 'credit', 'boleto', 'transfer', 'other'])
const typeEnum = z.enum(['income', 'expense'])

export const createTransactionSchema = z
  .object({
    description: z.string().trim().min(1).max(160),
    amount: z.number().positive(),
    type: typeEnum,
    date: z.coerce.date(),
    categoryId: z.string().uuid(),
    paymentMethod: paymentMethodEnum,
    creditCardId: z.string().uuid().optional(),
    accountId: z.string().uuid().optional(),
    notes: z.string().trim().max(1000).optional(),
    isInstallment: z.boolean().default(false),
    installmentCount: z.number().int().min(2).max(60).optional(),
    installmentNumber: z.number().int().min(1).max(60).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'credit' && !data.creditCardId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'creditCardId é obrigatório para pagamento com crédito.',
        path: ['creditCardId'],
      })
    }

    if (data.isInstallment) {
      if (!['credit', 'boleto'].includes(data.paymentMethod)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Parcelamento só é permitido para crédito ou boleto.',
          path: ['isInstallment'],
        })
      }

      if (!data.installmentCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'installmentCount é obrigatório para parcelamento.',
          path: ['installmentCount'],
        })
      }

      const installmentNumber = data.installmentNumber ?? 1

      if (
        data.installmentCount &&
        installmentNumber > data.installmentCount
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'installmentNumber não pode ser maior que installmentCount.',
          path: ['installmentNumber'],
        })
      }
    }
  })
  .transform((data) => {
    if (!data.isInstallment) {
      return {
        ...data,
        installmentCount: undefined,
        installmentNumber: undefined,
      }
    }

    return {
      ...data,
      installmentNumber: data.installmentNumber ?? 1,
    }
  })

export const updateTransactionSchema = z
  .object({
    description: z.string().trim().min(1).max(160).optional(),
    amount: z.number().positive().optional(),
    type: typeEnum.optional(),
    date: z.coerce.date().optional(),
    categoryId: z.string().uuid().optional(),
    paymentMethod: paymentMethodEnum.optional(),
    creditCardId: z.string().uuid().nullable().optional(),
    accountId: z.string().uuid().nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    isInstallment: z.boolean().optional(),
    installmentCount: z.number().int().min(2).max(60).nullable().optional(),
    installmentNumber: z.number().int().min(1).max(60).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar.',
  })

export const listTransactionsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  type: typeEnum.optional(),
  categoryId: z.string().uuid().optional(),
  creditCardId: z.string().uuid().optional(),
  search: z.string().trim().max(160).optional(),
  periodBy: z.enum(['payment', 'purchase']).default('payment'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['date', 'paymentDate', 'amount', 'description']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
})
