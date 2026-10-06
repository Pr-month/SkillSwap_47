//база для основных fetch из json/api

import { clearAuthTokens, getAuthTokens, setAuthTokens } from './authTokenStorage'

type RequestOptions = {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  skipAuthRefresh?: boolean
}

type TRefreshTokens = {
  accessToken: string
  refreshToken: string
}

const AUTH_REFRESH_URL = '/api/auth/refresh'
const AUTH_NO_REFRESH_URLS = new Set(['/api/auth/login', '/api/auth/register', AUTH_REFRESH_URL])

let refreshInFlight: Promise<void> | null = null

const refreshAuthSession = async (): Promise<void> => {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const tokens = getAuthTokens()

      if (!tokens) {
        throw new RequestError(401, 'Сессия истекла')
      }

      const next = await request<TRefreshTokens>(AUTH_REFRESH_URL, {
        method: 'POST',
        body: { refreshToken: tokens.refreshToken },
        skipAuthRefresh: true,
      })

      setAuthTokens({
        accessToken: next.accessToken,
        refreshToken: next.refreshToken,
      })
    })().finally(() => {
      refreshInFlight = null
    })
  }

  return refreshInFlight
}

export type BackendErrorMessage = string | string[]

export class RequestError extends Error {
  readonly status: number | null
  readonly backendMessage: BackendErrorMessage
  readonly cause?: unknown

  constructor(status: number | null, backendMessage: BackendErrorMessage, cause?: unknown) {
    const message = Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage
    super(message)
    this.name = 'RequestError'
    this.status = status
    this.backendMessage = backendMessage
    this.cause = cause
  }
}

const isBackendErrorMessage = (value: unknown): value is BackendErrorMessage =>
  typeof value === 'string' ||
  (Array.isArray(value) && value.every((item) => typeof item === 'string'))

const getErrorMessage = (text: string, status: number): BackendErrorMessage => {
  const trimmedText = text.trim()

  if (!trimmedText) {
    return `Ошибка запроса: ${status}`
  }

  try {
    const payload = JSON.parse(trimmedText) as {
      message?: unknown
      error?: { message?: unknown }
    }
    const backendMessage = payload.error?.message ?? payload.message

    if (isBackendErrorMessage(backendMessage)) {
      return backendMessage
    }
  } catch {
    // Ответ с ошибкой может быть обычным текстом, а не JSON.
  }

  return trimmedText
}

export const request = async <T>(url: string, options?: RequestOptions): Promise<T> => {
  const method = options?.method ?? 'GET'
  const headers: Record<string, string> = { ...options?.headers }
  let body: BodyInit | undefined

  if (options?.body !== undefined) {
    if (options.body instanceof FormData) {
      body = options.body
      // Content-Type не задаём — boundary выставит браузер/fetch
    } else {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(options.body)
    }
  }

  if (!AUTH_NO_REFRESH_URLS.has(url) && !headers.Authorization) {
    const tokens = getAuthTokens()

    if (tokens) {
      headers.Authorization = `Bearer ${tokens.accessToken}`
    }
  }

  let result: Response

  try {
    result = await fetch(url, { method, headers, body })
  } catch (error) {
    throw new RequestError(
      null,
      'Не удалось выполнить запрос. Проверьте подключение к сети.',
      error,
    )
  }

  const text = await result.text()

  if (!result.ok) {
    const error = new RequestError(result.status, getErrorMessage(text, result.status))
    const canRefresh =
      result.status === 401 &&
      !options?.skipAuthRefresh &&
      !AUTH_NO_REFRESH_URLS.has(url) &&
      Boolean(getAuthTokens())

    if (canRefresh) {
      try {
        await refreshAuthSession()
      } catch {
        clearAuthTokens()
        throw error
      }

      return request<T>(url, { ...options, skipAuthRefresh: true })
    }

    throw error
  }

  if (!text.trim()) {
    return undefined as T
  }
  return JSON.parse(text) as T
}

export type TPage<T> = {
  data: T[]
  page: number
  totalPages: number
}

/** Собирает все страницы пагинированного GET (skills limit max 50 на бэке). */
export const fetchAllPages = async <T>(url: string, limit = 50): Promise<T[]> => {
  const first = await request<TPage<T>>(`${url}?page=1&limit=${limit}`)
  const items = [...(first.data ?? [])]
  const totalPages = first.totalPages ?? 0
  for (let p = 2; p <= totalPages; p++) {
    const next = await request<TPage<T>>(`${url}?page=${p}&limit=${limit}`)
    items.push(...(next.data ?? []))
  }
  return items
}
