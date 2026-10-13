import { request } from './base'
import { uploadFileApi } from './uploadApi'

jest.mock('./base', () => ({
  request: jest.fn(),
}))

const requestMock = request as jest.MockedFunction<typeof request>

describe('uploadFileApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('отправляет File в FormData и возвращает url', async () => {
    const file = new File(['png-bytes'], 'avatar.png', { type: 'image/png' })
    requestMock.mockResolvedValue({ url: '/uploads/11111111-1111-1111-1111-111111111111.png' })

    await expect(uploadFileApi(file)).resolves.toBe(
      '/uploads/11111111-1111-1111-1111-111111111111.png',
    )

    expect(requestMock).toHaveBeenCalledTimes(1)
    const [url, options] = requestMock.mock.calls[0]
    expect(url).toBe('/api/upload')
    expect(options?.method).toBe('POST')
    expect(options?.body).toBeInstanceOf(FormData)
    expect((options?.body as FormData).get('file')).toBe(file)
  })

  it('пробрасывает ошибку размера или формата', async () => {
    const file = new File(['x'], 'doc.txt', { type: 'text/plain' })
    const uploadError = new Error('Допустимы только изображения')
    requestMock.mockRejectedValue(uploadError)

    await expect(uploadFileApi(file)).rejects.toBe(uploadError)
  })
})
