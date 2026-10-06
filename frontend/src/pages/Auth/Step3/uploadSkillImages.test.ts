import { uploadFileApi } from '../../../api/uploadApi'
import { uploadSkillImages } from './uploadSkillImages'

jest.mock('../../../api/uploadApi', () => ({
  uploadFileApi: jest.fn(),
}))

const uploadFileApiMock = uploadFileApi as jest.MockedFunction<typeof uploadFileApi>

describe('uploadSkillImages', () => {
  beforeEach(() => {
    uploadFileApiMock.mockReset()
  })

  it('возвращает все URL при успешной загрузке', async () => {
    uploadFileApiMock
      .mockResolvedValueOnce('/uploads/a.png')
      .mockResolvedValueOnce('/uploads/b.png')

    const files = [
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.png', { type: 'image/png' }),
    ]

    await expect(uploadSkillImages(files)).resolves.toEqual({
      urls: ['/uploads/a.png', '/uploads/b.png'],
      failedCount: 0,
      errorMessage: null,
    })
  })

  it('оставляет только успешные URL при частичном сбое', async () => {
    uploadFileApiMock
      .mockResolvedValueOnce('/uploads/ok.png')
      .mockRejectedValueOnce(new Error('Файл слишком большой'))

    const files = [
      new File(['ok'], 'ok.png', { type: 'image/png' }),
      new File(['bad'], 'bad.png', { type: 'image/png' }),
    ]

    await expect(uploadSkillImages(files)).resolves.toEqual({
      urls: ['/uploads/ok.png'],
      failedCount: 1,
      errorMessage: 'Файл слишком большой',
    })
  })

  it('возвращает ошибку, если все файлы упали', async () => {
    uploadFileApiMock
      .mockRejectedValueOnce(new Error('fail-1'))
      .mockRejectedValueOnce(new Error('fail-2'))

    const files = [
      new File(['1'], '1.png', { type: 'image/png' }),
      new File(['2'], '2.png', { type: 'image/png' }),
    ]

    await expect(uploadSkillImages(files)).resolves.toEqual({
      urls: [],
      failedCount: 2,
      errorMessage: 'Не загружено файлов: 2',
    })
  })
})
