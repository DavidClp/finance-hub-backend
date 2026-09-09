import { toCents } from '../../../shared/utils/money'
import { NotFoundError } from '../../../shared/errors/AppError'
import { IPlanningsRepository } from '../repositories/IPlanningsRepository'
import { serializePlanning, serializePlanningItem } from '../serializers/planning.serializer'

type CreateInput = {
  name: string
  description?: string
  targetAmount: number
  deadline: Date
  icon: string
  items?: Array<{
    name: string
    amount: number
    quantity?: number
    completed?: boolean
    priority?: 'low' | 'medium' | 'high'
    category?: string
  }>
}

export class CreatePlanningUseCase {
  constructor(private planningsRepository: IPlanningsRepository) {}

  async execute(userId: string, input: CreateInput) {
    const planning = await this.planningsRepository.create({
      userId,
      name: input.name,
      description: input.description ?? null,
      targetAmount: toCents(input.targetAmount),
      deadline: input.deadline,
      icon: input.icon,
      items: input.items?.map((item) => ({
        name: item.name,
        amount: toCents(item.amount),
        quantity: item.quantity ?? null,
        completed: item.completed ?? false,
        priority: item.priority ?? 'medium',
        category: item.category ?? null,
      })),
    })

    return serializePlanning(planning)
  }
}

export class ListPlanningsUseCase {
  constructor(private planningsRepository: IPlanningsRepository) {}

  async execute(userId: string) {
    const plannings = await this.planningsRepository.findManyByUser(userId)
    return plannings.map(serializePlanning)
  }
}

export class GetPlanningUseCase {
  constructor(private planningsRepository: IPlanningsRepository) {}

  async execute(userId: string, id: string) {
    const planning = await this.planningsRepository.findById(id, userId)
    if (!planning) throw new NotFoundError('Planejamento não encontrado.')
    return serializePlanning(planning)
  }
}

export class UpdatePlanningUseCase {
  constructor(private planningsRepository: IPlanningsRepository) {}

  async execute(
    userId: string,
    id: string,
    input: {
      name?: string
      description?: string | null
      targetAmount?: number
      deadline?: Date
      icon?: string
    },
  ) {
    const existing = await this.planningsRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Planejamento não encontrado.')

    const planning = await this.planningsRepository.update(id, {
      name: input.name,
      description: input.description,
      targetAmount: input.targetAmount !== undefined ? toCents(input.targetAmount) : undefined,
      deadline: input.deadline,
      icon: input.icon,
    })

    return serializePlanning(planning)
  }
}

export class DeletePlanningUseCase {
  constructor(private planningsRepository: IPlanningsRepository) {}

  async execute(userId: string, id: string) {
    const existing = await this.planningsRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Planejamento não encontrado.')
    await this.planningsRepository.delete(id, userId)
  }
}

export class UpdatePlanningItemUseCase {
  constructor(private planningsRepository: IPlanningsRepository) {}

  async execute(
    userId: string,
    planningId: string,
    itemId: string,
    input: {
      name?: string
      amount?: number
      quantity?: number | null
      completed?: boolean
      priority?: 'low' | 'medium' | 'high'
      category?: string | null
    },
  ) {
    const existing = await this.planningsRepository.findItem(planningId, itemId, userId)
    if (!existing) throw new NotFoundError('Item de planejamento não encontrado.')

    const item = await this.planningsRepository.updateItem(planningId, itemId, {
      name: input.name,
      amount: input.amount !== undefined ? toCents(input.amount) : undefined,
      quantity: input.quantity,
      completed: input.completed,
      priority: input.priority,
      category: input.category,
    })

    const planning = await this.planningsRepository.findByIdWithItems(planningId, userId)

    return {
      item: serializePlanningItem(item),
      planning: planning ? serializePlanning(planning) : null,
    }
  }
}
