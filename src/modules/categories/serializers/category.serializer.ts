import { CategoryRecord } from '../repositories/ICategoriesRepository'

export function serializeCategory(category: CategoryRecord) {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
  }
}
