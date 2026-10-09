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

export type TSimilarOffer = {
  user: TUser
  skill: TSkill
}

type TBackendSimilarSkill = {
  id: string
  title: string
  description: string
  images?: string[]
  category?: { id: string; name?: string }
}

type TBackendSimilarUser = {
  id: string
  name: string
  city: string
  birthdate: string
  gender?: string
  email?: string
  about?: string | null
  avatar?: string
  wantToLearn?: TBackendCategory[]
  skills?: TBackendSimilarSkill[]
}

const mapSkill = (skill: TBackendSkill | TBackendSkillDetail | TBackendSimilarSkill, userId = ''): TSkill => {
  const subcategoryId = skill.category?.id ?? ''
  const ownerId =
    'owner' in skill && skill.owner?.id ? skill.owner.id : userId
  return {
    id: skill.id,
    // parent category подставится в skillSlice после flatten категорий
    categoryId: subcategoryId,
    subcategoryId,
    userId: ownerId,
    title: skill.title,
    description: skill.description,
    imagesUrl: skill.images ?? [],
  }
}

const mapOwner = (owner: TBackendOwner | TBackendSimilarUser, skillId: string): TUser => ({
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

const pickSimilarSkill = (
  skills: TBackendSimilarSkill[] | undefined,
  preferredCategoryId?: string,
): TBackendSimilarSkill | undefined => {
  if (!skills?.length) return undefined
  if (preferredCategoryId) {
    const matched = skills.find((skill) => skill.category?.id === preferredCategoryId)
    if (matched) return matched
  }
  return skills.find((skill) => Boolean(skill.category?.id)) ?? skills[0]
}

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

export const getSimilarBySkillIdApi = async (id: string): Promise<TSimilarOffer[]> => {
  const users = await request<TBackendSimilarUser[]>(`/api/skills/${id}/similar`)
  const preferredCategoryId = users
    .flatMap((user) => user.skills ?? [])
    .map((skill) => skill.category?.id)
    .find((categoryId): categoryId is string => Boolean(categoryId))

  const offers: TSimilarOffer[] = []

  for (const backendUser of users) {
    const backendSkill = pickSimilarSkill(backendUser.skills, preferredCategoryId)
    if (!backendSkill) continue

    const skill = mapSkill(backendSkill, backendUser.id)
    const user = mapOwner(backendUser, skill.id)
    offers.push({ user, skill })
  }

  return offers
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
