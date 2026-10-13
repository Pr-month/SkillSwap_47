import { request, RequestError } from './base'
import { getSkillByIdApi } from './skillsApi'

jest.mock('./base', () => ({
  request: jest.fn(),
  fetchAllPages: jest.fn(),
  RequestError: jest.requireActual('./base').RequestError,
}))

const requestMock = request as jest.MockedFunction<typeof request>

describe('getSkillByIdApi', () => {
  const skillId = 'skill-uuid-1'

  beforeEach(() => {
    requestMock.mockReset()
  })

  it('запрашивает навык по id и маппит skill с owner', async () => {
    requestMock.mockResolvedValue({
      id: skillId,
      title: 'Йога',
      description: 'Утренние практики',
      images: ['/uploads/yoga.jpg'],
      category: { id: 'sub-1', name: 'Здоровье' },
      owner: {
        id: 'user-1',
        name: 'Анна',
        city: 'Москва',
        birthdate: '1990-01-15',
        gender: 'female',
        email: 'anna@skillswap.local',
        about: 'Инструктор',
        avatar: '/uploads/anna.jpg',
        wantToLearn: [{ id: 'want-1', name: 'Английский' }],
      },
    })

    await expect(getSkillByIdApi(skillId)).resolves.toEqual({
      skill: {
        id: skillId,
        categoryId: 'sub-1',
        subcategoryId: 'sub-1',
        userId: 'user-1',
        title: 'Йога',
        description: 'Утренние практики',
        imagesUrl: ['/uploads/yoga.jpg'],
      },
      owner: {
        id: 'user-1',
        name: 'Анна',
        city: 'Москва',
        birthDate: '1990-01-15',
        gender: 'female',
        email: 'anna@skillswap.local',
        about: 'Инструктор',
        avatarUrl: '/uploads/anna.jpg',
        skillOfferedId: skillId,
        subcategoriesWanted: ['want-1'],
        favoritesUserId: [],
        createdAt: undefined,
      },
    })
    expect(requestMock).toHaveBeenCalledWith(`/api/skills/${skillId}`)
  })

  it('пробрасывает 404 от backend', async () => {
    const notFoundError = new RequestError(404, 'Навык с ID skill-uuid-1 не найден')
    requestMock.mockRejectedValue(notFoundError)

    await expect(getSkillByIdApi(skillId)).rejects.toBe(notFoundError)
  })

  it('пробрасывает сетевую ошибку', async () => {
    const networkError = new RequestError(
      null,
      'Не удалось выполнить запрос. Проверьте подключение к сети.',
    )
    requestMock.mockRejectedValue(networkError)

    await expect(getSkillByIdApi(skillId)).rejects.toBe(networkError)
  })
})
