import { useQuery } from "@tanstack/react-query"
import { publisherApi } from "@/apis/publisher.api"
import type { GetPublishersParams } from "@/types/book.type"

export const usePublisher = (params?: GetPublishersParams) => {
  const getPublishersQuery = useQuery({
    queryKey: ["publishers", params],
    queryFn: () => publisherApi.getPublishers(params),
  })

  return {
    publishers: getPublishersQuery.data,
    publishersLoading: getPublishersQuery.isLoading,
    publishersError: getPublishersQuery.error,
    refetchPublishers: getPublishersQuery.refetch,
  }
}

export const usePublisherById = (id: string) => {
  const getPublisherByIdQuery = useQuery({
    queryKey: ["publishers", id],
    queryFn: () => publisherApi.getPublisherById(id),
    enabled: !!id,
  })

  return {
    publisher: getPublisherByIdQuery.data,
    publisherLoading: getPublisherByIdQuery.isLoading,
    publisherError: getPublisherByIdQuery.error,
  }
}
