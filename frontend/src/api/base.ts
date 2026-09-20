//база для основных fetch из json

export const request = async <T>(url: string): Promise<T> => {
  const result = await fetch(url)
  if (!result.ok) {
    throw new Error(`Ошибка: ${result.status}`)
  }
  return result.json()
}
