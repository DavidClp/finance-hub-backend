import { fromCents } from '../../../shared/utils/money'
import { PlanningItemRecord, PlanningRecord } from '../repositories/IPlanningsRepository'

export function serializePlanningItem(item: PlanningItemRecord) {
  return {
    id: item.id,
    name: item.name,
    amount: fromCents(item.amount),
    ...(item.quantity != null ? { quantity: item.quantity } : {}),
    completed: item.completed,
    priority: item.priority,
    ...(item.category ? { category: item.category } : {}),
  }
}

export function serializePlanning(planning: PlanningRecord) {
  return {
    id: planning.id,
    name: planning.name,
    ...(planning.description ? { description: planning.description } : {}),
    targetAmount: fromCents(planning.targetAmount),
    deadline: planning.deadline.toISOString().slice(0, 10),
    icon: planning.icon,
    items: planning.items.map(serializePlanningItem),
  }
}
