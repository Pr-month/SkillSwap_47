import { request } from './base'
import type { TCity } from '../shared/utils/types'

export const getCitiesApi = async (): Promise<TCity[]> => {
  const data = await request<TCity[]>('/api/cities')
  return data
}
