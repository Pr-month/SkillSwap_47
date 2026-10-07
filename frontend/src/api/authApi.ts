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

export type TRegisterBody = {
  email: string
  password: string
  name: string
  birthdate: string
  gender: string
  city: string
  wantToLearn: {
    categoryId: string
    subcategoryId: string
  }
  skill: {
    title: string
    categoryId: string
    subcategoryId: string
    description: string
    images?: string[]
  }
}

export type TRegisterResponse = {
  user: TLoginUser
  accessToken: string
  refreshToken: string
}

export const registerApi = (body: TRegisterBody): Promise<TRegisterResponse> =>
  request<TRegisterResponse>('/api/auth/register', {
    method: 'POST',
    body,
  })
