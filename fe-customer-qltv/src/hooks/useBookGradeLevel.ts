import { useQuery } from "@tanstack/react-query";
import { bookGradeLevelApi } from "@/apis/book-grade-level.api";
import type { GetBookGradeLevelsParams } from "@/types/book.type";

export const useBookGradeLevel = (params?: GetBookGradeLevelsParams) => {
  const getBookGradeLevelsQuery = useQuery({
    queryKey: ["book-grade-levels", params],
    queryFn: () => bookGradeLevelApi.getBookGradeLevels(params),
  });

  return {
    bookGradeLevels: getBookGradeLevelsQuery.data,
    bookGradeLevelsLoading: getBookGradeLevelsQuery.isLoading,
    bookGradeLevelsError: getBookGradeLevelsQuery.error,
    refetchBookGradeLevels: getBookGradeLevelsQuery.refetch,
  };
};

export const useBookGradeLevelById = (bookId: string, gradeLevelId: string) => {
  const getBookGradeLevelByIdQuery = useQuery({
    queryKey: ["book-grade-levels", bookId, gradeLevelId],
    queryFn: () => bookGradeLevelApi.getBookGradeLevelById(bookId, gradeLevelId),
    enabled: !!bookId && !!gradeLevelId,
  });

  return {
    bookGradeLevel: getBookGradeLevelByIdQuery.data,
    bookGradeLevelLoading: getBookGradeLevelByIdQuery.isLoading,
    bookGradeLevelError: getBookGradeLevelByIdQuery.error,
  };
};