//база для основных fetch из json/api

export const request = async <T>(url: string): Promise<T> => {
  const result = await fetch(url)
  if (!result.ok) {
    throw new Error(`Ошибка: ${result.status}`)
  }
  return result.json()
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
