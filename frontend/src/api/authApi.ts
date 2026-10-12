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
  gender: 'male' | 'female'
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

export type TRegisterUser = {
  id: string
  name: string
  email: string
  about?: string | null
  birthdate: string
  city: string
  gender: 'male' | 'female'
  avatar?: string
  role: TAuthRole
  skills?: {
    id: string
    title: string
    description: string
    images?: string[]
    category?: { id: string; name?: string }
    owner?: { id: string }
  }[]
  wantToLearn?: {
    id: string
    name?: string
  }[]
}

export type TRegisterResponse = {
  user: TRegisterUser
  accessToken: string
  refreshToken: string
}

export const registerApi = (body: TRegisterBody): Promise<TRegisterResponse> =>
  request<TRegisterResponse>('/api/auth/register', {
    method: 'POST',
    body,
  })
