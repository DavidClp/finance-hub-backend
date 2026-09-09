import { ConflictError, NotFoundError } from '../../../shared/errors/AppError'
import { ICategoriesRepository } from '../repositories/ICategoriesRepository'
import { serializeCategory } from '../serializers/category.serializer'

export class CreateCategoryUseCase {
  constructor(private categoriesRepository: ICategoriesRepository) {}

  async execute(userId: string, input: { name: string; icon: string; color: string }) {
    const category = await this.categoriesRepository.create({ userId, ...input })
    return serializeCategory(category)
  }
}

export class ListCategoriesUseCase {
  constructor(private categoriesRepository: ICategoriesRepository) {}

  async execute(userId: string) {
    const categories = await this.categoriesRepository.findManyByUser(userId)
    return categories.map(serializeCategory)
  }
}

export class GetCategoryUseCase {
  constructor(private categoriesRepository: ICategoriesRepository) {}

  async execute(userId: string, id: string) {
    const category = await this.categoriesRepository.findById(id, userId)
    if (!category) throw new NotFoundError('Categoria não encontrada.')
    return serializeCategory(category)
  }
}

export class UpdateCategoryUseCase {
  constructor(private categoriesRepository: ICategoriesRepository) {}

  async execute(
    userId: string,
    id: string,
    input: { name?: string; icon?: string; color?: string },
  ) {
    const existing = await this.categoriesRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Categoria não encontrada.')

    const category = await this.categoriesRepository.update(id, userId, input)
    return serializeCategory(category)
  }
}

export class DeleteCategoryUseCase {
  constructor(private categoriesRepository: ICategoriesRepository) {}

  async execute(userId: string, id: string) {
    const existing = await this.categoriesRepository.findById(id, userId)
    if (!existing) throw new NotFoundError('Categoria não encontrada.')

    const count = await this.categoriesRepository.countTransactions(id, userId)
    if (count > 0) {
      throw new ConflictError(
        'Categoria possui movimentações vinculadas. Migre-as antes de excluir.',
      )
    }

    await this.categoriesRepository.delete(id, userId)
  }
}
