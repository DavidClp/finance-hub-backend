import { z } from 'zod'

const daySchema = z.number().int().min(1).max(31)

export const createCreditCardSchema = z.object({
  name: z.string().trim().min(1).max(80),
  bank: z.string().trim().min(1).max(80),
  brand: z.enum(['visa', 'mastercard', 'elo', 'amex']),
  lastFourDigits: z.string().regex(/^\d{4}$/, 'Informe exatamente 4 dígitos'),
  limit: z.number().positive(),
  closingDay: daySchema,
  dueDay: daySchema,
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser hex (#RRGGBB)')
    .default('#4F46E5'),
})

export const updateCreditCardSchema = createCreditCardSchema.partial()
