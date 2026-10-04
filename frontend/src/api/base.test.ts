import { RequestError, request } from './base'
import { clearAuthTokens, setAuthTokens } from './authTokenStorage'

const fetchMock = jest.fn()

const createResponse = (status: number, body: string): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(body),
  }) as unknown as Response

describe('request', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })
  })

  beforeEach(() => {
    fetchMock.mockReset()
    clearAuthTokens()
  })

  it('сохраняет статус и массив сообщений backend', async () => {
    const backendMessage = ['Email указан неверно', 'Пароль слишком короткий']
    fetchMock.mockResolvedValue(
      createResponse(
        400,
        JSON.stringify({
          error: {
            status: 400,
            message: backendMessage,
          },
        }),
      ),
    )

    await expect(request('/api/test')).rejects.toMatchObject({
      name: 'RequestError',
      status: 400,
      backendMessage,
      message: backendMessage.join(', '),
    } satisfies Partial<RequestError>)
  })

  it('использует текст ответа, если backend вернул не JSON', async () => {
    fetchMock.mockResolvedValue(createResponse(500, 'Internal Server Error'))

    await expect(request('/api/test')).rejects.toMatchObject({
      status: 500,
      backendMessage: 'Internal Server Error',
      message: 'Internal Server Error',
    } satisfies Partial<RequestError>)
  })

  it('возвращает понятную ошибку при сбое сети', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(request('/api/test')).rejects.toMatchObject({
      status: null,
      backendMessage: 'Не удалось выполнить запрос. Проверьте подключение к сети.',
      message: 'Не удалось выполнить запрос. Проверьте подключение к сети.',
    } satisfies Partial<RequestError>)
  })

  it('отправляет FormData без Content-Type', async () => {
    const formData = new FormData()
    formData.append('file', new File(['png'], 'sample.png', { type: 'image/png' }))
    fetchMock.mockResolvedValue(createResponse(201, JSON.stringify({ url: '/uploads/sample.png' })))

    await expect(
      request('/api/upload', {
        method: 'POST',
        body: formData,
      }),
    ).resolves.toEqual({ url: '/uploads/sample.png' })

    expect(fetchMock).toHaveBeenCalledWith('/api/upload', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  })

  describe('access-token', () => {
    const tokens = { accessToken: 'access-token', refreshToken: 'refresh-token' }

    it('защищённый запрос отправляет Authorization: Bearer', async () => {
      setAuthTokens(tokens)
      fetchMock.mockResolvedValue(createResponse(200, JSON.stringify({ ok: true })))

      await expect(request('/api/protected', { auth: true })).resolves.toEqual({ ok: true })

      expect(fetchMock).toHaveBeenCalledWith('/api/protected', {
        method: 'GET',
        headers: { Authorization: 'Bearer access-token' },
        body: undefined,
      })
    })

    it('защищённый запрос с телом отправляет и Authorization, и Content-Type', async () => {
      setAuthTokens(tokens)
      fetchMock.mockResolvedValue(createResponse(201, JSON.stringify({ id: 'skill-uuid-1' })))

      await request('/api/protected', { method: 'POST', body: { title: 'Йога' }, auth: true })

      expect(fetchMock).toHaveBeenCalledWith('/api/protected', {
        method: 'POST',
        headers: { Authorization: 'Bearer access-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Йога' }),
      })
    })

    it('публичный запрос не отправляет токен, даже если он есть в хранилище', async () => {
      setAuthTokens(tokens)
      fetchMock.mockResolvedValue(createResponse(200, JSON.stringify({ ok: true })))

      await request('/api/public')

      expect(fetchMock).toHaveBeenCalledWith('/api/public', {
        method: 'GET',
        headers: {},
        body: undefined,
      })
    })

    it('запрос логина не отправляет токен, даже если он есть в хранилище', async () => {
      setAuthTokens(tokens)
      fetchMock.mockResolvedValue(createResponse(200, JSON.stringify({ accessToken: 'new' })))

      await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'anna@skillswap.local', password: 'secret' },
      })

      expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'anna@skillswap.local', password: 'secret' }),
      })
    })

    it('защищённый запрос без токена не уходит на сервер и падает с 401', async () => {
      await expect(request('/api/protected', { auth: true })).rejects.toMatchObject({
        name: 'RequestError',
        status: 401,
        backendMessage: 'Необходима авторизация',
      } satisfies Partial<RequestError>)

      expect(fetchMock).not.toHaveBeenCalled()
    })
  })
})
