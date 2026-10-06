import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { loginApi, type TLoginUser } from '../../../api/authApi'
import { clearAuthTokens, getAuthTokens, setAuthTokens } from '../../../api/authTokenStorage'
import { RequestError } from '../../../api/base'
import {
  getMeApi,
  getUsersApi,
  registerUserApi,
  updateUserApi,
  toggleFavoriteApi,
} from '../../../api/usersApi'
import type { TUser, TRegisterData } from '../../../shared/utils/types'
import { delay } from '../../../shared/lib/delay'

const mapLoginUserToProfile = (user: TLoginUser): TUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  city: '',
  birthDate: '',
  skillOfferedId: '',
  subcategoriesWanted: [],
  avatarUrl: '',
})

export type userState = {
  allUsers: TUser[]
  draftUser: Partial<TRegisterData>
  profileUser: TUser | null
  isSessionChecked: boolean
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
  isSessionChecked: false,
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

export const updateUser = createAsyncThunk<TUser, Partial<TUser>>(
  'user/updateUser',
  async (userData) => {
    const data = await updateUserApi(userData)
    return data
  },
)

export const loginUser = createAsyncThunk<TUser, { email: string; password: string }>(
  'user/loginUser',
  async ({ email, password }) => {
    const response = await loginApi(email, password)
    setAuthTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })
    return mapLoginUserToProfile(response.user)
  },
)

export const restoreSession = createAsyncThunk<TUser | null>('user/restoreSession', async () => {
  const tokens = getAuthTokens()
  if (!tokens) {
    return null
  }

  try {
    return await getMeApi()
  } catch (error) {
    if (error instanceof RequestError && (error.status === 401 || error.status === 403)) {
      clearAuthTokens()
      return null
    }
    throw error
  }
})

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await delay()
  return true
})

export const toggleFavorite = createAsyncThunk<TUser, string>(
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
    updateDraftUser(state, action: PayloadAction<Partial<TRegisterData>>) {
      state.draftUser = { ...state.draftUser, ...action.payload }
    },
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
        state.isSessionChecked = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.errorLogin = action.error.message || 'Не удалось войти в аккаунт'
        state.isLoadingLogin = false
      })
      .addCase(restoreSession.fulfilled, (state, action: PayloadAction<TUser | null>) => {
        state.profileUser = action.payload
        state.isSessionChecked = true
      })
      .addCase(restoreSession.rejected, (state) => {
        state.profileUser = null
        state.isSessionChecked = true
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
