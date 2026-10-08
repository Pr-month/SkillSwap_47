import { request } from './base'
import { loginApi, logoutApi, refreshApi, type TLoginResponse } from './authApi'

jest.mock('./base', () => ({
  request: jest.fn(),
}))

const requestMock = request as jest.MockedFunction<typeof request>

describe('loginApi', () => {
  const credentials = {
    email: 'user@example.com',
    password: 'password123',
  }

  beforeEach(() => {
    requestMock.mockReset()
  })

  it('отправляет данные входа POST-запросом и возвращает ответ backend', async () => {
    const response: TLoginResponse = {
      message: 'Успешный вход',
      user: {
        id: 'user-id',
        email: credentials.email,
        name: 'Иван',
        role: 'USER',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }
    requestMock.mockResolvedValue(response)

    await expect(loginApi(credentials.email, credentials.password)).resolves.toEqual(response)
    expect(requestMock).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
  })

  it('отклоняет Promise при ошибке авторизации', async () => {
    const unauthorizedError = new Error('Ошибка: 401')
    requestMock.mockRejectedValue(unauthorizedError)

    await expect(loginApi(credentials.email, credentials.password)).rejects.toBe(unauthorizedError)
  })
})

describe('refreshApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('отправляет refresh-токен POST-запросом без повторного refresh', async () => {
    const response = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    }
    requestMock.mockResolvedValue(response)

    await expect(refreshApi('old-refresh')).resolves.toEqual(response)
    expect(requestMock).toHaveBeenCalledWith('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken: 'old-refresh' },
      skipAuthRefresh: true,
    })
  })
})

describe('logoutApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('отправляет защищённый POST /auth/logout', async () => {
    const response = { message: 'Успешный выход' }
    requestMock.mockResolvedValue(response)

    await expect(logoutApi()).resolves.toEqual(response)
    expect(requestMock).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
    })
  })
})
