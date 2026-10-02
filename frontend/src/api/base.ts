//база для основных fetch из json/api

type RequestOptions = {
  method?: string
  body?: unknown
}

export const request = async <T>(
  url: string,
  options?: RequestOptions,
): Promise<T> => {
  const method = options?.method ?? 'GET'
  const headers: Record<string, string> = {}
  let body: string | undefined

  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  const result = await fetch(url, { method, headers, body })
  if (!result.ok) {
    throw new Error(`Ошибка: ${result.status}`)
  }

  const text = await result.text()
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
