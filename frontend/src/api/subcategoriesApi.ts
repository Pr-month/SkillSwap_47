import type { TSubcategory } from '../shared/utils/types'
import { flattenCategoriesToSubcategories } from '../shared/utils/types'
import { getCategoriesApi } from './categoriesApi'

// Подкатегории = children из дерева GET /api/categories (отдельного эндпоинта нет)
export const getSubcategoriesApi = async (): Promise<TSubcategory[]> => {
  const categories = await getCategoriesApi()
  return flattenCategoriesToSubcategories(categories)
}
