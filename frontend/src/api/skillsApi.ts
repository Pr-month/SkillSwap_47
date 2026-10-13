import { fetchAllPages, request } from './base'
import { postToStorage, patchToStorage } from './localStorageApi'
import type { TSkill, TUser } from '../shared/utils/types'
import { delay } from '../shared/lib/delay'

type TBackendCategory = {
  id: string
  name?: string
}

type TBackendOwner = {
  id: string
  name: string
  city: string
  birthdate: string
  gender?: string
  email?: string
  about?: string | null
  avatar?: string
  wantToLearn?: TBackendCategory[]
}

type TBackendSkill = {
  id: string
  title: string
  description: string
  images?: string[]
  category?: { id: string; name?: string }
  owner?: { id: string }
}

type TBackendSkillDetail = {
  id: string
  title: string
  description: string
  images?: string[]
  category?: { id: string; name?: string }
  owner: TBackendOwner
}

export type TSkillByIdResult = {
  skill: TSkill
  owner: TUser
}

const mapSkill = (skill: TBackendSkill | TBackendSkillDetail): TSkill => {
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

const mapOwner = (owner: TBackendOwner, skillId: string): TUser => ({
  id: owner.id,
  name: owner.name,
  city: owner.city,
  birthDate: owner.birthdate,
  gender: owner.gender,
  email: owner.email,
  about: owner.about ?? undefined,
  avatarUrl: owner.avatar ?? '',
  skillOfferedId: skillId,
  subcategoriesWanted: (owner.wantToLearn ?? []).map((c) => c.id),
  favoritesUserId: [],
  createdAt: undefined,
})

//метод для получения всех навыков с бэка
export const getSkillsApi = async (): Promise<TSkill[]> => {
  const skills = await fetchAllPages<TBackendSkill>('/api/skills')
  return skills.map(mapSkill)
}

export const getSkillByIdApi = async (id: string): Promise<TSkillByIdResult> => {
  const data = await request<TBackendSkillDetail>(`/api/skills/${id}`)
  const skill = mapSkill(data)
  const owner = mapOwner(data.owner, skill.id)
  return { skill, owner }
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
