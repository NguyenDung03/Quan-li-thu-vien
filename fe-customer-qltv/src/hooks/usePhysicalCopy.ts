import { useQuery } from "@tanstack/react-query"
import { physicalCopyApi } from "@/apis/physical-copy.api"
import type { GetPhysicalCopiesParams } from "@/types/ebook.type"

export const usePhysicalCopy = (params?: GetPhysicalCopiesParams) => {
  const getPhysicalCopiesQuery = useQuery({
    queryKey: ["physical-copies", params],
    queryFn: () => physicalCopyApi.getPhysicalCopies(params),
  })

  return {
    physicalCopies: getPhysicalCopiesQuery.data,
    physicalCopiesLoading: getPhysicalCopiesQuery.isLoading,
    physicalCopiesError: getPhysicalCopiesQuery.error,
    refetchPhysicalCopies: getPhysicalCopiesQuery.refetch,
  }
}

export const usePhysicalCopyById = (id: string) => {
  const getPhysicalCopyByIdQuery = useQuery({
    queryKey: ["physical-copies", id],
    queryFn: () => physicalCopyApi.getPhysicalCopyById(id),
    enabled: !!id,
  })

  return {
    physicalCopy: getPhysicalCopyByIdQuery.data,
    physicalCopyLoading: getPhysicalCopyByIdQuery.isLoading,
    physicalCopyError: getPhysicalCopyByIdQuery.error,
  }
}
