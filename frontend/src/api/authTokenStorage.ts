import type { TLoginResponse } from './authApi'

export type TAuthTokens = Pick<TLoginResponse, 'accessToken' | 'refreshToken'>

const AUTH_TOKENS_STORAGE_KEY = 'authTokens'

const isAuthTokens = (value: unknown): value is TAuthTokens => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const tokens = value as Partial<TAuthTokens>
  return typeof tokens.accessToken === 'string' && typeof tokens.refreshToken === 'string'
}

export const setAuthTokens = ({ accessToken, refreshToken }: TAuthTokens): void => {
  localStorage.setItem(AUTH_TOKENS_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }))
}

export const getAuthTokens = (): TAuthTokens | null => {
  const storedTokens = localStorage.getItem(AUTH_TOKENS_STORAGE_KEY)

  if (!storedTokens) {
    return null
  }

  try {
    const tokens: unknown = JSON.parse(storedTokens)

    if (isAuthTokens(tokens)) {
      return tokens
    }
  } catch {
    // Повреждённое значение не должно считаться авторизованной сессией.
  }

  localStorage.removeItem(AUTH_TOKENS_STORAGE_KEY)
  return null
}

export const clearAuthTokens = (): void => {
  localStorage.removeItem(AUTH_TOKENS_STORAGE_KEY)
}
