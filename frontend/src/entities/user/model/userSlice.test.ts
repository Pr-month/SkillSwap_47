import { expect, test, describe } from '@jest/globals'

import userSlice, {
  getAllUsers,
  registerUser,
  updateUser,
  loginUser,
  logoutUser,
  toggleFavorite,
  updateDraftUser,
  resetDraftUser,
  type userState,
} from './userSlice'
import type { TRegisterData, TUser } from '../../../shared/utils/types'

describe('Проверяем работу userSlice', () => {
  const initialState: userState = {
    allUsers: [],
    draftUser: {},
    profileUser: null,
    isLoadingUsers: false,
    isLoadingRegister: false,
    isLoadingUpdate: false,
    isLoadingLogin: false,
    isLoadingLogout: false,
    isLoadingFavorite: false,
    errorUsers: null,
    errorRegister: null,
    errorUpdate: null,
    errorLogin: null,
    errorLogout: null,
    errorFavorite: null,
  }

  const testUser: TRegisterData = {
    name: 'Тест Тестович',
    city: 'Тула',
    birthDate: '1998-07-12',
    gender: 'male',
    email: 'test@example.com',
    password: 'SkillSwap47!',
    about: 'Какое-то описание.',
    subcategoriesWanted: [1],
    avatarUrl: '/images/users/38.png',
  }

  const existingTestUser: TUser = {
    ...testUser,
    id: Date.now(),
    skillOfferedId: 0,
    favoritesSkills: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const updatedTestUser: TUser = {
    ...existingTestUser,
    name: 'Новый Тестович',
    about: 'Глубокомысленное описание.',
  }

  const updatedWithFavorite: TUser = {
    ...existingTestUser,
    favoritesSkills: [14],
  }

  const testListUsers: TUser[] = [
    {
      id: 11,
      name: 'Алексей Новиков',
      city: 'Москва',
      birthDate: '1995-11-11',
      gender: 'male',
      email: 'alex.novikov@example.com',
      password: 'SkillSwap47!',
      about:
        'Запустил небольшой онлайн-проект, учусь на ходу и часто делаю ошибки. Хочется больше понимания в том, как всё выстроить грамотно и не терять деньги на простых вещах.',
      skillOfferedId: 11,
      subcategoriesWanted: [8, 31, 1, 3],
      favoritesSkills: [9, 16, 21, 22, 35],
      createdAt: '2025-01-18T08:20:00Z',
      updatedAt: '2026-01-18T08:20:00Z',
      avatarUrl: '/images/users/11.png',
    },
    {
      id: 12,
      name: 'Леви Аккерман',
      city: 'Екатеринбург',
      birthDate: '1992-12-25',
      gender: 'male',
      email: 'levi@example.com',
      password: 'SkillSwap47!',
      about: 'Люблю порядок и чёткие правила. Хаос раздражает больше, чем должен.',
      skillOfferedId: 12,
      subcategoriesWanted: [30, 6],
      favoritesSkills: [2, 4, 24, 25, 41],
      createdAt: '2026-01-08T10:00:00Z',
      updatedAt: '2026-01-08T11:00:00Z',
      avatarUrl: '/images/users/12.png',
    },
    {
      id: 13,
      name: 'Эрен Йегер',
      city: 'Екатеринбург',
      birthDate: '2000-03-30',
      gender: 'male',
      email: 'eren@example.com',
      password: 'SkillSwap47!',
      about: 'Чувствую, что нужно что-то менять, даже если не до конца понимаю что именно.',
      skillOfferedId: 13,
      subcategoriesWanted: [24, 42],
      favoritesSkills: [4, 9, 16, 22, 35],
      createdAt: '2026-01-09T10:00:00Z',
      updatedAt: '2026-01-09T11:00:00Z',
      avatarUrl: '/images/users/13.png',
    },
  ]

  const stateGetAllUsersPending = {
    ...initialState,
    isLoadingUsers: true,
    errorUsers: null,
  }
  const stateGetAllUsersFulfilled = {
    ...initialState,
    allUsers: testListUsers,
    isLoadingUsers: false,
  }
  const stateRegisterUserPending = {
    ...initialState,
    isLoadingRegister: true,
    errorRegister: null,
  }
  const stateRegisterUserFulfilled = {
    ...initialState,
    profileUser: existingTestUser,
    isLoadingRegister: false,
  }
  const stateUpdateUserPending = {
    ...initialState,
    isLoadingUpdate: true,
    errorUpdate: null,
  }
  const stateUpdateUserFulfilled = {
    ...initialState,
    isLoadingUpdate: false,
    profileUser: updatedTestUser,
  }
  const stateLoginUserPending = {
    ...initialState,
    isLoadingLogin: true,
    errorLogin: null,
  }
  const stateLoginUserFulfilled = {
    ...initialState,
    isLoadingLogin: false,
    profileUser: testListUsers[0],
  }
  const stateLogoutUserPending = {
    ...initialState,
    isLoadingLogout: true,
    errorLogout: null,
  }
  const stateLogoutUserFulfilled = {
    ...initialState,
    profileUser: null,
    isLoadingLogout: false,
  }
  const stateToggleFavoritePending = {
    ...initialState,
    isLoadingFavorite: true,
    errorFavorite: null,
  }
  const stateToggleFavoriteFulfilled = {
    ...initialState,
    isLoadingFavorite: false,
    profileUser: { ...existingTestUser, favoritesSkills: [14] },
  }

  describe('getAllUsers', () => {
    test('проверяем работу pending', () => {
      const newStatePending = userSlice(initialState, getAllUsers.pending('Loading...'))
      expect(newStatePending).toEqual(stateGetAllUsersPending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = userSlice(initialState, getAllUsers.fulfilled(testListUsers, ''))
      expect(newStateFulfilled).toEqual(stateGetAllUsersFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = userSlice(initialState, getAllUsers.rejected(new Error(), ''))
      expect(newStateRejected.errorUsers).toBe('Не удалось загрузить пользователей')
      expect(newStateRejected.isLoadingUsers).toBe(false)
    })
  })
  describe('registerUser', () => {
    test('проверяем работу pending', () => {
      const newStatePending = userSlice(initialState, registerUser.pending('Loading...', testUser))
      expect(newStatePending).toEqual(stateRegisterUserPending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = userSlice(
        initialState,
        registerUser.fulfilled(existingTestUser, '', testUser),
      )
      expect(newStateFulfilled).toEqual(stateRegisterUserFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = userSlice(
        initialState,
        registerUser.rejected(new Error(), '', testUser),
      )
      expect(newStateRejected.errorRegister).toBe('Не удалось зарегистрировать пользователя')
      expect(newStateRejected.isLoadingRegister).toBe(false)
    })
  })
  describe('updateUser', () => {
    test('проверяем работу pending', () => {
      const newStatePending = userSlice(
        initialState,
        updateUser.pending('Loading...', {
          name: 'Новый Тестович',
          about: 'Глубокомысленное описание.',
        }),
      )
      expect(newStatePending).toEqual(stateUpdateUserPending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = userSlice(
        initialState,
        updateUser.fulfilled(updatedTestUser, '', {
          name: 'Новый Тестович',
          about: 'Глубокомысленное описание.',
        }),
      )
      expect(newStateFulfilled).toEqual(stateUpdateUserFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = userSlice(
        initialState,
        updateUser.rejected(new Error(), '', {
          name: 'Новый Тестович',
          about: 'Глубокомысленное описание.',
        }),
      )
      expect(newStateRejected.errorUpdate).toBe('Не удалось обновить данные о пользователе')
      expect(newStateRejected.isLoadingUpdate).toBe(false)
    })
  })
  describe('loginUser', () => {
    test('проверяем работу pending', () => {
      const newStatePending = userSlice(
        initialState,
        loginUser.pending('Loading...', {
          email: 'alex.novikov@example.com',
          password: 'SkillSwap47!',
        }),
      )
      expect(newStatePending).toEqual(stateLoginUserPending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = userSlice(
        initialState,
        loginUser.fulfilled(testListUsers[0], '', {
          email: 'alex.novikov@example.com',
          password: 'SkillSwap47!',
        }),
      )
      expect(newStateFulfilled).toEqual(stateLoginUserFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = userSlice(
        initialState,
        loginUser.rejected(new Error(), '', {
          email: 'alex.novikov@example.com',
          password: 'SkillSwap47!',
        }),
      )
      expect(newStateRejected.errorLogin).toBe('Не удалось войти в аккаунт')
      expect(newStateRejected.isLoadingLogin).toBe(false)
    })

    describe('loginUser: ветвления asyncThunk', () => {
      test('loginUser находит пользователя в store и не идет в localStorage', async () => {
        const dispatch = jest.fn()
        const getState = jest.fn(() => ({
          user: {
            ...initialState,
            allUsers: testListUsers,
          },
        }))
        if (testListUsers[0].email === undefined) return
        if (testListUsers[0].password === undefined) return
        const thunk = loginUser({
          email: testListUsers[0].email,
          password: testListUsers[0].password,
        })

        const result = await thunk(dispatch, getState, undefined)
        expect(result.payload).toEqual(testListUsers[0])
      })
      test('loginUser не нашел пользователя в store и идет в localStorage', async () => {
        const dispatch = jest.fn()
        const getState = jest.fn(() => ({
          user: {
            ...initialState,
            allUsers: [],
          },
        }))
        const spyUser = testListUsers[1]
        localStorage.setItem('draftUser', JSON.stringify(spyUser))

        if (spyUser.email === undefined) return
        if (spyUser.password === undefined) return
        const thunk = loginUser({
          email: spyUser.email,
          password: spyUser.password,
        })

        const result = await thunk(dispatch, getState, undefined)
        expect(result.payload).toEqual(spyUser)
      })
      test('loginUser не нашел пользователя нигде', async () => {
        const dispatch = jest.fn()
        const getState = jest.fn(() => ({
          user: {
            ...initialState,
            allUsers: [],
          },
        }))
        localStorage.removeItem('draftUser')

        const thunk = loginUser({
          email: 'okak@mail.ru',
          password: '1234567890',
        })

        const result = await thunk(dispatch, getState, undefined)
        expect(result.type).toBe('user/loginUser/rejected')
      })
    })
  })
  describe('logoutUser', () => {
    test('проверяем работу pending', () => {
      const newStatePending = userSlice(initialState, logoutUser.pending('Loading...'))
      expect(newStatePending).toEqual(stateLogoutUserPending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = userSlice(initialState, logoutUser.fulfilled(true, ''))
      expect(newStateFulfilled).toEqual(stateLogoutUserFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = userSlice(initialState, logoutUser.rejected(new Error(), ''))
      expect(newStateRejected.errorLogout).toBe('Не удалось выйти из аккаунта')
      expect(newStateRejected.isLoadingLogout).toBe(false)
    })
  })
  describe('toggleFavorite', () => {
    test('проверяем работу pending', () => {
      const newStatePending = userSlice(initialState, toggleFavorite.pending('Loading...', 14))
      expect(newStatePending).toEqual(stateToggleFavoritePending)
    })

    test('проверяем работу fulfilled', () => {
      const newStateFulfilled = userSlice(
        initialState,
        toggleFavorite.fulfilled(updatedWithFavorite, '', 14),
      )
      expect(newStateFulfilled).toEqual(stateToggleFavoriteFulfilled)
    })

    test('проверяем работу rejected fallback', () => {
      const newStateRejected = userSlice(initialState, toggleFavorite.rejected(new Error(), '', 14))
      expect(newStateRejected.errorFavorite).toBe('Не удалось добавить в избранное')
      expect(newStateRejected.isLoadingFavorite).toBe(false)
    })
  })

  describe('Проверяем работу reducers(updateDraftUser, resetDraftUser)', () => {
    const initialStateForDrafts = {
      ...initialState,
      draftUser: {
        name: 'Анна Скоробогатова',
        city: 'Красноярск',
      },
    }
    test('updateDraftUser добавляет новые данные', () => {
      const newState = userSlice(
        initialStateForDrafts,
        updateDraftUser({ city: 'Москва', about: 'Какой хороший день. Какой чудесный день...' }),
      )
      expect(newState).toEqual({
        ...initialStateForDrafts,
        draftUser: {
          name: 'Анна Скоробогатова',
          city: 'Москва',
          about: 'Какой хороший день. Какой чудесный день...',
        },
      })
    })

    test('resetDraftUser очищает все данные', () => {
      const newState = userSlice(initialStateForDrafts, resetDraftUser())
      expect(newState).toEqual({ ...initialStateForDrafts, draftUser: {} })
    })
  })
})
