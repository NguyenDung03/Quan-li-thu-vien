import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ebookApi } from "@/apis/ebook.api";
import type { GetEbooksParams } from "@/types/ebook.type";

export const useEbook = (params?: GetEbooksParams) => {
  const getEbooksQuery = useQuery({
    queryKey: ["ebooks", params],
    queryFn: () => ebookApi.getEbooks(params),
  });

  return {
    ebooks: getEbooksQuery.data,
    ebooksLoading: getEbooksQuery.isLoading,
    ebooksError: getEbooksQuery.error,
    refetchEbooks: getEbooksQuery.refetch,
  };
};

export const useEbookById = (id: string) => {
  const getEbookByIdQuery = useQuery({
    queryKey: ["ebooks", id],
    queryFn: () => ebookApi.getEbookById(id),
    enabled: !!id,
  });

  return {
    ebook: getEbookByIdQuery.data,
    ebookLoading: getEbookByIdQuery.isLoading,
    ebookError: getEbookByIdQuery.error,
  };
};

export const useEbookByBookId = (bookId: string) => {
  const getEbookByBookIdQuery = useQuery({
    queryKey: ["ebooks", "by-book", bookId],
    queryFn: () => ebookApi.getEbookByBookId(bookId),
    enabled: !!bookId,
  });

  return {
    ebook: getEbookByBookIdQuery.data,
    ebookLoading: getEbookByBookIdQuery.isLoading,
    ebookError: getEbookByBookIdQuery.error,
  };
};

export const useIncrementDownloadCount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => ebookApi.incrementDownloadCount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ebooks"] });
    },
  });

  return {
    incrementDownload: mutation.mutate,
    isIncrementing: mutation.isPending,
  };
};
