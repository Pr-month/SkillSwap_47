import { uploadFileApi } from '../../../api/uploadApi'

export type TUploadImagesResult = {
  urls: string[]
  errorMessage: string | null
  failedCount: number
}

export const uploadSkillImages = async (files: File[]): Promise<TUploadImagesResult> => {
  const settled = await Promise.allSettled(files.map((file) => uploadFileApi(file)))
  const urls: string[] = []
  const errors: string[] = []

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      urls.push(result.value)
    } else {
      errors.push(
        result.reason instanceof Error ? result.reason.message : 'Не удалось загрузить файл',
      )
    }
  }

  return {
    urls,
    failedCount: errors.length,
    errorMessage: errors.length
      ? errors.length === 1
        ? errors[0]
        : `Не загружено файлов: ${errors.length}`
      : null,
  }
}
