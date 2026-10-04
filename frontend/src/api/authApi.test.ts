import { request, RequestError } from './base'
import { getAuthTokens, setAuthTokens } from './authTokenStorage'
import { loginApi, refreshApi, type TLoginResponse, type TRefreshResponse } from './authApi'

jest.mock('./base', () => ({
  request: jest.fn(),
  RequestError: jest.requireActual('./base').RequestError,
}))

jest.mock('./authTokenStorage', () => ({
  getAuthTokens: jest.fn(),
  setAuthTokens: jest.fn(),
}))

const requestMock = request as jest.MockedFunction<typeof request>
const getAuthTokensMock = getAuthTokens as jest.MockedFunction<typeof getAuthTokens>
const setAuthTokensMock = setAuthTokens as jest.MockedFunction<typeof setAuthTokens>

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
    getAuthTokensMock.mockReset()
    setAuthTokensMock.mockReset()
  })

  it('отправляет refreshToken, сохраняет новую пару и возвращает ответ', async () => {
    const response: TRefreshResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }
    requestMock.mockResolvedValue(response)

    await expect(refreshApi('old-refresh-token')).resolves.toEqual(response)
    expect(requestMock).toHaveBeenCalledWith('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken: 'old-refresh-token' },
    })
    expect(setAuthTokensMock).toHaveBeenCalledWith({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    })
  })

  it('берёт refreshToken из storage, если аргумент не передан', async () => {
    getAuthTokensMock.mockReturnValue({
      accessToken: 'stored-access',
      refreshToken: 'stored-refresh',
    })
    const response: TRefreshResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }
    requestMock.mockResolvedValue(response)

    await expect(refreshApi()).resolves.toEqual(response)
    expect(requestMock).toHaveBeenCalledWith('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken: 'stored-refresh' },
    })
  })

  it('пробрасывает ошибку backend и не сохраняет токены', async () => {
    const unauthorizedError = new RequestError(401, 'Невалидный refresh токен')
    requestMock.mockRejectedValue(unauthorizedError)

    await expect(refreshApi('bad-refresh-token')).rejects.toBe(unauthorizedError)
    expect(setAuthTokensMock).not.toHaveBeenCalled()
  })

  it('бросает ошибку, если refreshToken нигде нет', async () => {
    getAuthTokensMock.mockReturnValue(null)

    await expect(refreshApi()).rejects.toMatchObject({
      name: 'RequestError',
      status: null,
      message: 'Нет refresh токена',
    })
    expect(requestMock).not.toHaveBeenCalled()
    expect(setAuthTokensMock).not.toHaveBeenCalled()
  })
})
