import { request } from './base'
import type { TCategory } from '../shared/utils/types'

//метод для получения всех категорий из json/api
export const getCategoriesApi = async (): Promise<TCategory[]> => {
  const data = await request<TCategory[]>('/api/categories')
  return data
}
