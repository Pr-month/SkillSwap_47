import { fetchAllPages } from './base'
import { delay } from '../shared/lib/delay'
import { postToStorage, patchToStorage } from './localStorageApi'
import type { TUser, TRegisterData } from '../shared/utils/types'

type TBackendCategory = {
  id: string
  name?: string
}

type TBackendSkillBrief = {
  id: string
}

type TBackendUser = {
  id: string
  name: string
  city: string
  birthdate: string
  gender?: string
  email?: string
  about?: string | null
  avatar?: string
  skills?: TBackendSkillBrief[]
  wantToLearn?: TBackendCategory[]
}

const mapUser = (user: TBackendUser): TUser => ({
  id: user.id,
  name: user.name,
  city: user.city,
  birthDate: user.birthdate,
  gender: user.gender,
  email: user.email,
  about: user.about ?? undefined,
  avatarUrl: user.avatar ?? '',
  skillOfferedId: user.skills?.[0]?.id ?? '',
  subcategoriesWanted: (user.wantToLearn ?? []).map((c) => c.id),
  favoritesUserId: [],
  createdAt: undefined,
})

//метод для получения всех пользователей с бэка
export const getUsersApi = async (): Promise<TUser[]> => {
  const users = await fetchAllPages<TBackendUser>('/api/users')
  return users.map(mapUser)
}

//обертка-метод для эмуляции создания нового пользователя(на самом деле записывается в localStorage)
export const registerUserApi = async (data: TRegisterData): Promise<TUser> => {
  await delay()
  const newUser: TUser = {
    ...data,
    id: String(Date.now()),
    subcategoriesWanted: data.subcategoriesWanted,
    favoritesUserId: [],
    skillOfferedId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return postToStorage('draftUser', newUser)
}

//обертка-метод для эмуляции обновления информации о пользователе(на самом деле записывается в localStorage)
export const updateUserApi = async (data: Partial<TUser>): Promise<TUser> => {
  await delay()
  return patchToStorage('draftUser', {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

//метод для добавления/удаления карточки пользователя в избранное(не работает для пользователей из json)
export const toggleFavoriteApi = async (favoriteId: string): Promise<TUser> => {
  await delay(50, 500)
  const existingUser = localStorage.getItem('draftUser')
  if (!existingUser) throw new Error('Пользователь не найден')

  const user: TUser = JSON.parse(existingUser)

  const favorites = user.favoritesUserId || []
  const isFavorite = favorites.includes(favoriteId)

  const updatedFavorites = isFavorite
    ? favorites.filter((id) => id !== favoriteId)
    : [...favorites, favoriteId]

  return patchToStorage<TUser>('draftUser', {
    favoritesUserId: updatedFavorites,
    updatedAt: new Date().toISOString(),
  })
}
