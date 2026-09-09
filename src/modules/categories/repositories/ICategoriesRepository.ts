import { Category } from '@prisma/client'

export type CategoryRecord = Category

export interface CreateCategoryData {
  userId: string
  name: string
  icon: string
  color: string
}

export interface UpdateCategoryData {
  name?: string
  icon?: string
  color?: string
}

export interface ICategoriesRepository {
  create(data: CreateCategoryData): Promise<CategoryRecord>
  findManyByUser(userId: string): Promise<CategoryRecord[]>
  findById(id: string, userId: string): Promise<CategoryRecord | null>
  update(id: string, userId: string, data: UpdateCategoryData): Promise<CategoryRecord>
  delete(id: string, userId: string): Promise<void>
  countTransactions(categoryId: string, userId: string): Promise<number>
}
