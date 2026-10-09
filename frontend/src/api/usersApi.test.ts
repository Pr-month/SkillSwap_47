import { request, RequestError } from './base'
import { getAuthTokens } from './authTokenStorage'
import { getMeApi } from './usersApi'

jest.mock('./base', () => ({
  request: jest.fn(),
  fetchAllPages: jest.fn(),
  RequestError: jest.requireActual('./base').RequestError,
}))

jest.mock('./authTokenStorage', () => ({
  getAuthTokens: jest.fn(),
}))

const requestMock = request as jest.MockedFunction<typeof request>
const getAuthTokensMock = getAuthTokens as jest.MockedFunction<typeof getAuthTokens>

describe('getMeApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
    getAuthTokensMock.mockReset()
  })

  it('запрашивает /api/users/me с Bearer и маппит профиль', async () => {
    getAuthTokensMock.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
    requestMock.mockResolvedValue({
      id: 'user-1',
      name: 'Анна',
      city: 'Москва',
      birthdate: '1995-03-15',
      gender: 'female',
      email: 'anna@skillswap.local',
      about: 'Люблю обмен навыками',
      avatar: '/uploads/anna.png',
      skills: [{ id: 'skill-1' }],
      wantToLearn: [{ id: 'cat-1', name: 'Английский' }],
      favoriteSkills: [{ id: 'fav-skill-1' }, 'fav-skill-2'],
    })

    await expect(getMeApi()).resolves.toEqual({
      id: 'user-1',
      name: 'Анна',
      city: 'Москва',
      birthDate: '1995-03-15',
      gender: 'female',
      email: 'anna@skillswap.local',
      about: 'Люблю обмен навыками',
      avatarUrl: '/uploads/anna.png',
      skillOfferedId: 'skill-1',
      subcategoriesWanted: ['cat-1'],
      favoritesUserId: ['fav-skill-1', 'fav-skill-2'],
      createdAt: undefined,
    })
    expect(requestMock).toHaveBeenCalledWith('/api/users/me', {
      auth: true,
    })
  })

  it('бросает 401, если токена нет', async () => {
    getAuthTokensMock.mockReturnValue(null)

    await expect(getMeApi()).rejects.toMatchObject({
      name: 'RequestError',
      status: 401,
    } satisfies Partial<RequestError>)
    expect(requestMock).not.toHaveBeenCalled()
  })
})
