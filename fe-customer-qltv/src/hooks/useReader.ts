import { useMutation, useQuery } from "@tanstack/react-query";
import { readerApi } from "@/apis/reader.api";
import type { UpdateReaderRequest } from "@/types/reader.type";

export const useReaderByUserId = (id: string) => {
  const getReaderByUserIdQuery = useQuery({
    queryKey: ["readers", "user", id],
    queryFn: () => readerApi.getReaderByUserId(id),
    enabled: !!id,
  });

  return {
    readerByUserId: getReaderByUserIdQuery.data,
    readerByUserIdLoading: getReaderByUserIdQuery.isLoading,
    readerByUserIdError: getReaderByUserIdQuery.error,
  };
};

export const useUpdateReader = () => {
  const updateReaderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReaderRequest }) =>
      readerApi.updateReader(id, data),
  });

  return {
    updateReader: updateReaderMutation.mutate,
    updateReaderAsync: updateReaderMutation.mutateAsync,
    updateReaderLoading: updateReaderMutation.isPending,
    updateReaderError: updateReaderMutation.error,
  };
};
