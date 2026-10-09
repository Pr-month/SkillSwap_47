import { fetchAllPages, request, RequestError } from './base'
import { delay } from '../shared/lib/delay'
import { getAuthTokens } from './authTokenStorage'
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
  favoriteSkills?: Array<TBackendSkillBrief | string>
}

const mapFavoriteIds = (favorites?: Array<TBackendSkillBrief | string>): string[] =>
  (favorites ?? []).map((item) => (typeof item === 'string' ? item : item.id))

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
  favoritesUserId: mapFavoriteIds(user.favoriteSkills),
  createdAt: undefined,
})

//метод для получения всех пользователей с бэка
export const getUsersApi = async (): Promise<TUser[]> => {
  const users = await fetchAllPages<TBackendUser>('/api/users')
  return users.map(mapUser)
}

export const getMeApi = async (): Promise<TUser> => {
  const tokens = getAuthTokens()
  if (!tokens) {
    throw new RequestError(401, 'Нет токена авторизации')
  }

  const user = await request<TBackendUser>('/api/users/me', {
    auth: true,
  })
  return mapUser(user)
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
