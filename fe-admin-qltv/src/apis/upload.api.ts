import axiosClient from './axios-client'

export interface UploadResponse {
  id: string
  fileName: string
  fileUrl: string
  fileFormat: string
  fileSize: number
  uploadedAt: string
}

export const uploadApi = {
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axiosClient.post<UploadResponse>('/api/uploads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}