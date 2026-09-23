import { request } from './base'
import { postToStorage, patchToStorage } from './localStorageApi'
import type { TSkill } from '../shared/utils/types'
import { delay } from '../shared/lib/delay'

type TSkillResponse = {
  skills: TSkill[]
}

//метод для получения всех навыков из json
export const getSkillsApi = async (): Promise<TSkill[]> => {
  await delay()
  const data = await request<TSkillResponse>('/db/skills.json')
  return data.skills
}

//метод для получения всех навыков, принадлежащих к какой-либо категории(нужно для фильтрации)
// export const getSkillsByCategoryIdApi = async (categoryId: number): Promise<TSkill[]> => {
//   const allSkills = await getSkillsApi()
//   const skillsByCategoryId = allSkills.filter((skill) => skill.categoryId === categoryId)
//   return skillsByCategoryId
// }

// //метод для получения всех навыков, принадлежащих к какой-либо подкатегории(нужно для фильтрации)
// export const getSkillsBySubcategoryIdApi = async (subcategoryId: number): Promise<TSkill[]> => {
//   const allSkills = await getSkillsApi()
//   const skillsBySubcategoryId = allSkills.filter((skill) => skill.subcategoryId === subcategoryId)
//   return skillsBySubcategoryId
// }
//аналогично, как с подкатегориями - не понадобится, можно спокойно вытащить,
//  имея данные из стора обо всех категориях и подкатегориях

//метод для получения навыка по ID(используется на странице с роутом /skill/:id)
// export const getSkillsByIdApi = async (id: number): Promise<TSkill> => {
//   const skills = await getSkillsApi()
//   const skill = skills.find((s) => s.id === id)
//   if (!skill) {
//     throw new Error('Такой навык не найден или не существует')
//   }
//   return skill
// }
// не понадобится - фильтер так же можно сделать из компонента, это не апи функциональность,
// достаточно лишь знать список всех навыков, а это можно взять из стора

//обертка-метод для эмуляции создания нового навыка(на самом деле записывается в localStorage)
export const createSkillApi = async (data: TSkill): Promise<TSkill> => {
  await delay()
  const newSkill: TSkill = {
    ...data,
    id: Date.now(),
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
