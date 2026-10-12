import { expect, test, describe, beforeEach, jest } from '@jest/globals'

import { registerApi } from '../../api/authApi'
import { setAuthTokens } from '../../api/authTokenStorage'
import { completeRegistration } from './registrationThunk'
import type { TSkill, TUser } from '../../shared/utils/types'
import store from '../../app/store/store'

jest.mock('../../api/authApi', () => ({
  registerApi: jest.fn(),
}))

jest.mock('../../api/authTokenStorage', () => ({
  setAuthTokens: jest.fn(),
}))

const registerApiMock = jest.mocked(registerApi)
const setAuthTokensMock = jest.mocked(setAuthTokens)

const serverUserId = '3f1c2c2e-6b1a-4e0a-9c2d-111111111111'
const serverSkillId = '8a0b1c2d-3e4f-5a6b-7c8d-222222222222'

describe('Тест completeRegistration', () => {
  beforeEach(() => {
    registerApiMock.mockReset()
    setAuthTokensMock.mockReset()
    localStorage.clear()
    store.dispatch({ type: 'user/resetDraftUser' })
    store.dispatch({ type: 'skill/resetDraftSkill' })
  })

  test('Проверяем заполнение profileUser и profileSkill с сервера', async () => {
    const draftUser: Partial<TUser> = {
      name: 'Иван Козлов',
      city: 'Москва',
      birthDate: '21.09.1996',
      gender: 'Мужской',
      email: 'ivan.kozlov@example.com',
      password: 'SkillSwap47!',
      subcategoriesWanted: ['17'],
      avatarUrl: '/images/users/8.png',
    }
    const draftSkill: Partial<TSkill> = {
      categoryId: '1',
      subcategoryId: '4',
      title: 'Спокойный личный бренд',
      description: 'Покажу, как выстраивать образ без показухи.',
      imagesUrl: ['/images/skills/sk8-1.png'],
    }
    registerApiMock.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: serverUserId,
        name: 'Иван Козлов',
        email: 'ivan.kozlov@example.com',
        about: null,
        birthdate: '1996-09-21',
        city: 'Москва',
        gender: 'male',
        avatar: '',
        role: 'USER',
        skills: [
          {
            id: serverSkillId,
            title: 'Спокойный личный бренд',
            description: 'Покажу, как выстраивать образ без показухи.',
            images: ['/images/skills/sk8-1.png'],
            category: { id: '4' },
          },
        ],
        wantToLearn: [{ id: '17' }],
      },
    })

    store.dispatch({ type: 'user/updateDraftUser', payload: draftUser })
    store.dispatch({ type: 'skill/updateDraftSkill', payload: draftSkill })
    const result = await store.dispatch(completeRegistration())
    const state = store.getState()

    expect(result.type).toBe('auth/completeRegistration/fulfilled')
    expect(registerApiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        birthdate: '1996-09-21',
        gender: 'male',
      }),
    )
    expect(setAuthTokensMock).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
    expect(state.user.profileUser?.id).toBe(serverUserId)
    expect(state.user.profileUser?.skillOfferedId).toBe(serverSkillId)
    expect(state.user.profileUser?.password).toBeUndefined()
    expect(state.skill.profileSkill?.id).toBe(serverSkillId)
    expect(state.skill.profileSkill?.userId).toBe(serverUserId)
    expect(state.user.profileUser?.skillOfferedId).toBe(state.skill.profileSkill?.id)
    expect(localStorage.getItem('draftUser')).toBeNull()
    expect(localStorage.getItem('draftSkill')).toBeNull()
  })

  test('Не указан не уходит на сервер', async () => {
    store.dispatch({
      type: 'user/updateDraftUser',
      payload: { name: 'Иван', gender: 'Не указан', birthDate: '21.09.1996' },
    })
    store.dispatch({
      type: 'skill/updateDraftSkill',
      payload: { title: 'Навык' },
    })

    const result = await store.dispatch(completeRegistration())

    expect(result.type).toBe('auth/completeRegistration/rejected')
    expect(result.payload).toBe('Укажите пол')
    expect(registerApiMock).not.toHaveBeenCalled()
    expect(setAuthTokensMock).not.toHaveBeenCalled()
  })

  test('Проверяем ошибку(нет draftUser)', async () => {
    const result = await store.dispatch(completeRegistration())

    expect(result.type).toBe('auth/completeRegistration/rejected')
    expect(registerApiMock).not.toHaveBeenCalled()
  })

  test('Проверяем ошибку(нет draftSkill)', async () => {
    store.dispatch({
      type: 'user/updateDraftUser',
      payload: { name: 'Иван' },
    })
    const result = await store.dispatch(completeRegistration())

    expect(result.type).toBe('auth/completeRegistration/rejected')
    expect(registerApiMock).not.toHaveBeenCalled()
  })
})
