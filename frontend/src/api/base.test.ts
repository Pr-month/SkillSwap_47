import { RequestError, request } from './base'

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

  it('прокидывает Authorization в заголовки', async () => {
    fetchMock.mockResolvedValue(createResponse(200, JSON.stringify({ id: 'user-1' })))

    await expect(
      request('/api/users/me', {
        headers: { Authorization: 'Bearer access-token' },
      }),
    ).resolves.toEqual({ id: 'user-1' })

    expect(fetchMock).toHaveBeenCalledWith('/api/users/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer access-token' },
      body: undefined,
    })
  })
})
