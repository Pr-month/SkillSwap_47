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
})
