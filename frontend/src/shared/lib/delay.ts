//эмуляция задержки от сервера

export const delay = (min = 500, max = 2000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min))
}
