import { z } from 'zod'

const priorityEnum = z.enum(['low', 'medium', 'high'])

const planningItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  amount: z.number().positive(),
  quantity: z.number().int().positive().optional(),
  completed: z.boolean().optional(),
  priority: priorityEnum.optional(),
  category: z.string().trim().max(80).optional(),
})

export const createPlanningSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  targetAmount: z.number().positive(),
  deadline: z.coerce.date(),
  icon: z.string().trim().min(1).max(60),
  items: z.array(planningItemSchema).optional(),
})

export const updatePlanningSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    targetAmount: z.number().positive().optional(),
    deadline: z.coerce.date().optional(),
    icon: z.string().trim().min(1).max(60).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar.',
  })

export const updatePlanningItemSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    amount: z.number().positive().optional(),
    quantity: z.number().int().positive().nullable().optional(),
    completed: z.boolean().optional(),
    priority: priorityEnum.optional(),
    category: z.string().trim().max(80).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar.',
  })
