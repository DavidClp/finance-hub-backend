import { z } from 'zod'

export const updateSettingsSchema = z
  .object({
    creditCardNextMonth: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar.',
  })
