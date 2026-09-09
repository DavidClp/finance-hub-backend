import { prisma } from '../../../infra/database/prisma'
import {
  CreatePlanningData,
  IPlanningsRepository,
  PlanningItemRecord,
  PlanningRecord,
  UpdatePlanningData,
  UpdatePlanningItemData,
} from './IPlanningsRepository'

const includeItems = {
  items: {
    orderBy: { createdAt: 'asc' as const },
  },
}

export class PrismaPlanningsRepository implements IPlanningsRepository {
  async create(data: CreatePlanningData): Promise<PlanningRecord> {
    const { items, ...planning } = data

    return prisma.planning.create({
      data: {
        ...planning,
        items: items?.length
          ? {
              create: items.map((item) => ({
                name: item.name,
                amount: item.amount,
                quantity: item.quantity ?? null,
                completed: item.completed ?? false,
                priority: item.priority ?? 'medium',
                category: item.category ?? null,
              })),
            }
          : undefined,
      },
      include: includeItems,
    })
  }

  async findManyByUser(userId: string): Promise<PlanningRecord[]> {
    return prisma.planning.findMany({
      where: { userId },
      include: includeItems,
      orderBy: { deadline: 'asc' },
    })
  }

  async findById(id: string, userId: string): Promise<PlanningRecord | null> {
    return prisma.planning.findFirst({
      where: { id, userId },
      include: includeItems,
    })
  }

  async findByIdWithItems(id: string, userId: string): Promise<PlanningRecord | null> {
    return this.findById(id, userId)
  }

  async update(id: string, data: UpdatePlanningData): Promise<PlanningRecord> {
    return prisma.planning.update({
      where: { id },
      data,
      include: includeItems,
    })
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.planning.deleteMany({ where: { id, userId } })
  }

  async findItem(
    planningId: string,
    itemId: string,
    userId: string,
  ): Promise<PlanningItemRecord | null> {
    return prisma.planningItem.findFirst({
      where: {
        id: itemId,
        planningId,
        planning: { userId },
      },
    })
  }

  async updateItem(
    planningId: string,
    itemId: string,
    data: UpdatePlanningItemData,
  ): Promise<PlanningItemRecord> {
    return prisma.planningItem.update({
      where: { id: itemId },
      data,
    })
  }
}
