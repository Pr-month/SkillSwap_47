//база для методов для эмуляции запросов к серверу

//POST
export const postToStorage = async <T>(key: string, data: T): Promise<T> => {
  localStorage.setItem(key, JSON.stringify(data))
  return data
}

//PATCH
export const patchToStorage = async <T>(key: string, updatedData: Partial<T>): Promise<T> => {
  const existingData = localStorage.getItem(key)
  if (!existingData) {
    throw new Error('Данные не найдены или пользователя не существует')
  }
  const parsedData = JSON.parse(existingData)
  const updated = {
    ...parsedData,
    ...updatedData,
  }
  localStorage.setItem(key, JSON.stringify(updated))
  return updated
}
