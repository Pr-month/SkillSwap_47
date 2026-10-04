import { request } from './base'

export type TUploadResponse = { url: string }

export const uploadFileApi = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  const data = await request<TUploadResponse>('/api/upload', {
    method: 'POST',
    body: formData,
  })
  return data.url
}
