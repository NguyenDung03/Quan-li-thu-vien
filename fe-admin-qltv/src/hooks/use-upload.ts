import { useMutation } from '@tanstack/react-query'
import { uploadApi, type UploadResponse } from '@/apis/upload.api'

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const response = await uploadApi.uploadFile(file)
      return response
    },
  })
}
