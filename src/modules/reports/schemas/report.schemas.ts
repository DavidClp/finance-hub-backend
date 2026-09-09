import { z } from 'zod'

export const expensesReportQuerySchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    groupBy: z.enum(['day', 'month', 'category', 'card']).default('month'),
    type: z.enum(['income', 'expense']).optional(),
    categoryId: z.string().uuid().optional(),
    creditCardId: z.string().uuid().optional(),
  })
  .refine((data) => data.to >= data.from, {
    message: 'to deve ser maior ou igual a from.',
    path: ['to'],
  })
