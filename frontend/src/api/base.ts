//база для основных fetch из json/api

type RequestOptions = {
  method?: string
  body?: unknown
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
  const headers: Record<string, string> = {}
  let body: string | undefined

  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
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
    throw new RequestError(result.status, getErrorMessage(text, result.status))
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
