import { clearAuthTokens, getAuthTokens, setAuthTokens, type TAuthTokens } from './authTokenStorage'

describe('authTokenStorage', () => {
  const tokens: TAuthTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it('сохраняет и восстанавливает пару токенов', () => {
    setAuthTokens(tokens)

    expect(getAuthTokens()).toEqual(tokens)
  })

  it('атомарно заменяет оба токена', () => {
    const newTokens: TAuthTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }
    setAuthTokens(tokens)

    setAuthTokens(newTokens)

    expect(getAuthTokens()).toEqual(newTokens)
    expect(localStorage).toHaveLength(1)
  })

  it('полностью очищает токены', () => {
    setAuthTokens(tokens)

    clearAuthTokens()

    expect(getAuthTokens()).toBeNull()
    expect(localStorage).toHaveLength(0)
  })

  it('не сохраняет пароль и остальные поля ответа loginApi', () => {
    setAuthTokens({
      ...tokens,
      password: 'password123',
      message: 'Успешный вход',
    } as TAuthTokens & { password: string; message: string })

    const storedTokens = localStorage.getItem(localStorage.key(0) ?? '')

    expect(getAuthTokens()).toEqual(tokens)
    expect(storedTokens).toBe(JSON.stringify(tokens))
    expect(storedTokens).not.toContain('password123')
  })

  it('удаляет повреждённые данные хранилища', () => {
    setAuthTokens(tokens)
    const storageKey = localStorage.key(0)

    if (!storageKey) {
      throw new Error('Ключ токенов не найден')
    }

    localStorage.setItem(storageKey, '{invalid-json')

    expect(getAuthTokens()).toBeNull()
    expect(localStorage).toHaveLength(0)
  })
})
