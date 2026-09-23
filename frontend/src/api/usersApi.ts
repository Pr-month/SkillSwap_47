import { request } from './base'
import { delay } from '../shared/lib/delay'
import { postToStorage, patchToStorage } from './localStorageApi'
import type { TUser, TRegisterData } from '../shared/utils/types'

type TUserResponse = {
  users: TUser[]
}

//метод для получения всех пользователей из json
export const getUsersApi = async (): Promise<TUser[]> => {
  await delay()
  const data = await request<TUserResponse>('/db/users.json')
  return data.users
}

//обертка-метод для эмуляции создания нового пользователя(на самом деле записывается в localStorage)
export const registerUserApi = async (data: TRegisterData): Promise<TUser> => {
  await delay()
  const newUser: TUser = {
    ...data,
    id: Date.now(),
    subcategoriesWanted: data.subcategoriesWanted,
    favoritesSkills: [],
    skillOfferedId: 0,
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
export const toggleFavoriteApi = async (favoriteId: number): Promise<TUser> => {
  await delay(50, 500)
  const existingUser = localStorage.getItem('draftUser')
  if (!existingUser) throw new Error('Пользователь не найден')

  const user: TUser = JSON.parse(existingUser)

  const favorites = user.favoritesSkills || []
  const isFavorite = favorites.includes(favoriteId)

  const updatedFavorites = isFavorite
    ? favorites.filter((id) => id !== favoriteId)
    : [...favorites, favoriteId]

  return patchToStorage<TUser>('draftUser', {
    favoritesSkills: updatedFavorites,
    updatedAt: new Date().toISOString(),
  })
}
