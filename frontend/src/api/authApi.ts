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

export const loginApi = (email: string, password: string): Promise<TLoginResponse> =>
  request<TLoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
