import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import {
  getUsersApi,
  registerUserApi,
  updateUserApi,
  toggleFavoriteApi,
} from '../../../api/usersApi'
import type { TUser, TRegisterData } from '../../../shared/utils/types'
import { delay } from '../../../shared/lib/delay'

//Флоу данных для пользователей на главной странице:
//Компонент UserList получает из стора данные(использует useAppSelector)(можно пока что для визуализации брать всех юзеров
//потом будете брать уже отфильтрованных)
//записывает их в переменную. Возвращает что-то типо следующего:
// users.map((elem,key)=> {
//<li key={key}>
// <UserCard user={elem}/>
// </li>
//})

export type userState = {
  allUsers: TUser[]
  //это поле поможет вам собрать все данные по регистрации
  //получить их через useAppSelector и передать в registerUser
  draftUser: Partial<TRegisterData>
  //получаем его, чтобы заполнять автоматически данные в профиле
  profileUser: TUser | null
  isLoadingUsers: boolean
  isLoadingRegister: boolean
  isLoadingUpdate: boolean
  isLoadingLogin: boolean
  isLoadingLogout: boolean
  isLoadingFavorite: boolean
  errorUsers: string | null
  errorRegister: string | null
  errorUpdate: string | null
  errorLogin: string | null
  errorLogout: string | null
  errorFavorite: string | null
}

export const initialState: userState = {
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

//обязательно запускается при инициализации приложения!!!
export const getAllUsers = createAsyncThunk<TUser[]>('user/getAllUsers', async () => {
  const data = await getUsersApi()
  return data
})

//НЕ ВЫЗЫВАЕМ, ТЕПЕРЬ ЕСТЬ completeRegistration
export const registerUser = createAsyncThunk<TUser, TRegisterData>(
  'user/registerUser',
  async (userData) => {
    return registerUserApi(userData)
  },
)

//вызывать при изменении полей на странице профиля(не регистрации)
//пример, изменение имени в профиле: dispatch(updateUser({ name: `${что пользователь ввел}` }))
export const updateUser = createAsyncThunk<TUser, Partial<TUser>>(
  'user/updateUser',
  async (userData) => {
    const data = await updateUserApi(userData)
    return data
  },
)

export const loginUser = createAsyncThunk<
  TUser,
  { email: string; password: string },
  { state: { user: userState } }
>('user/loginUser', async ({ email, password }, { getState }) => {
  await delay()
  const { allUsers } = getState().user

  const storeUser = allUsers.find((user) => user.email === email && user.password === password)
  if (storeUser) return storeUser

  const localUser = localStorage.getItem('draftUser')
  if (localUser) {
    const user: TUser = JSON.parse(localUser)
    if (user.email === email && user.password === password) {
      return user
    }
  }
  throw new Error('Пользователь не найден')
})

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await delay()
  return true
})

export const toggleFavorite = createAsyncThunk<TUser, number>(
  'user/toggleFavorite',
  async (favoriteId) => {
    const data = await toggleFavoriteApi(favoriteId)
    return data
  },
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    //вызывать при заполнении любого окошка формы регистрации(если это не записывать в стор, состояние между шагами не сохранится)
    updateDraftUser(state, action: PayloadAction<Partial<TRegisterData>>) {
      state.draftUser = { ...state.draftUser, ...action.payload }
    },
    //вызывается при завершении регистрации успешно (все три шага)
    resetDraftUser(state) {
      state.draftUser = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoadingUsers = true
        state.errorUsers = null
      })
      .addCase(getAllUsers.fulfilled, (state, action: PayloadAction<TUser[]>) => {
        state.allUsers = action.payload
        state.isLoadingUsers = false
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.errorUsers = action.error.message || 'Не удалось загрузить пользователей'
        state.isLoadingUsers = false
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoadingRegister = true
        state.errorRegister = null
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.profileUser = action.payload
        state.isLoadingRegister = false
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.errorRegister = action.error.message || 'Не удалось зарегистрировать пользователя'
        state.isLoadingRegister = false
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoadingUpdate = true
        state.errorUpdate = null
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.profileUser = action.payload
        state.isLoadingUpdate = false
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.errorUpdate = action.error.message || 'Не удалось обновить данные о пользователе'
        state.isLoadingUpdate = false
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoadingLogin = true
        state.errorLogin = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.profileUser = action.payload
        state.isLoadingLogin = false
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.errorLogin = action.error.message || 'Не удалось войти в аккаунт'
        state.isLoadingLogin = false
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoadingLogout = true
        state.errorLogout = null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.profileUser = null
        state.isLoadingLogout = false
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.errorLogout = action.error.message || 'Не удалось выйти из аккаунта'
        state.isLoadingLogout = false
      })
      .addCase(toggleFavorite.pending, (state) => {
        state.isLoadingFavorite = true
        state.errorFavorite = null
      })
      .addCase(toggleFavorite.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.profileUser = action.payload
        state.isLoadingFavorite = false
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.errorFavorite = action.error.message || 'Не удалось добавить в избранное'
        state.isLoadingFavorite = false
      })
  },
})

export const { updateDraftUser, resetDraftUser } = userSlice.actions
export default userSlice.reducer
