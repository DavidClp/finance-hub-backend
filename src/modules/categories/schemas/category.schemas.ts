import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  icon: z.string().trim().min(1).max(60),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser hex (#RRGGBB)'),
})

export const updateCategorySchema = createCategorySchema.partial()
