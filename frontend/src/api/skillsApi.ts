import { fetchAllPages } from './base'
import { postToStorage, patchToStorage } from './localStorageApi'
import type { TSkill } from '../shared/utils/types'
import { delay } from '../shared/lib/delay'

type TBackendSkill = {
  id: string
  title: string
  description: string
  images?: string[]
  category?: { id: string; name?: string }
  owner?: { id: string }
}

const mapSkill = (skill: TBackendSkill): TSkill => {
  const subcategoryId = skill.category?.id ?? ''
  return {
    id: skill.id,
    // parent category подставится в skillSlice после flatten категорий
    categoryId: subcategoryId,
    subcategoryId,
    userId: skill.owner?.id ?? '',
    title: skill.title,
    description: skill.description,
    imagesUrl: skill.images ?? [],
  }
}

//метод для получения всех навыков с бэка
export const getSkillsApi = async (): Promise<TSkill[]> => {
  const skills = await fetchAllPages<TBackendSkill>('/api/skills')
  return skills.map(mapSkill)
}

//обертка-метод для эмуляции создания нового навыка(на самом деле записывается в localStorage)
export const createSkillApi = async (data: TSkill): Promise<TSkill> => {
  await delay()
  const newSkill: TSkill = {
    ...data,
    id: String(Date.now()),
    updatedAt: new Date().toISOString(),
  }
  return postToStorage('draftSkill', newSkill)
}

//обертка-метод для эмуляции обновления информации о навыке(на самом деле записывается в localStorage)
export const updateSkillApi = async (data: Partial<TSkill>): Promise<TSkill> => {
  await delay()
  return patchToStorage('draftSkill', {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}
