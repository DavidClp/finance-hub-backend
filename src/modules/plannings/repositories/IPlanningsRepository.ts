import { Planning, PlanningItem, Priority } from '@prisma/client'

export type PlanningItemRecord = PlanningItem
export type PlanningRecord = Planning & { items: PlanningItemRecord[] }

export interface CreatePlanningItemData {
  name: string
  amount: number
  quantity?: number | null
  completed?: boolean
  priority?: Priority
  category?: string | null
}

export interface CreatePlanningData {
  userId: string
  name: string
  description?: string | null
  targetAmount: number
  deadline: Date
  icon: string
  items?: CreatePlanningItemData[]
}

export interface UpdatePlanningData {
  name?: string
  description?: string | null
  targetAmount?: number
  deadline?: Date
  icon?: string
}

export interface UpdatePlanningItemData {
  name?: string
  amount?: number
  quantity?: number | null
  completed?: boolean
  priority?: Priority
  category?: string | null
}

export interface IPlanningsRepository {
  create(data: CreatePlanningData): Promise<PlanningRecord>
  findManyByUser(userId: string): Promise<PlanningRecord[]>
  findById(id: string, userId: string): Promise<PlanningRecord | null>
  update(id: string, data: UpdatePlanningData): Promise<PlanningRecord>
  delete(id: string, userId: string): Promise<void>
  findItem(planningId: string, itemId: string, userId: string): Promise<PlanningItemRecord | null>
  updateItem(
    planningId: string,
    itemId: string,
    data: UpdatePlanningItemData,
  ): Promise<PlanningItemRecord>
  findByIdWithItems(id: string, userId: string): Promise<PlanningRecord | null>
}
