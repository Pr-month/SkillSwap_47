import { request } from './base'

export type TAuthRole = 'USER' | 'ADMIN'

export type TLoginUser = {
  id: string
  email: string
  name: string
  role: TAuthRole
}

export type TLoginResponse = {
  message: string
  user: TLoginUser
  accessToken: string
  refreshToken: string
}

export type TRefreshResponse = {
  accessToken: string
  refreshToken: string
}

export type TLogoutResponse = {
  message: string
}

export const loginApi = (email: string, password: string): Promise<TLoginResponse> =>
  request<TLoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })

export const refreshApi = (refreshToken: string): Promise<TRefreshResponse> =>
  request<TRefreshResponse>('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    skipAuthRefresh: true,
  })

export const logoutApi = (): Promise<TLogoutResponse> =>
  request<TLogoutResponse>('/api/auth/logout', {
    method: 'POST',
  })
