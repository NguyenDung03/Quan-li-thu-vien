import { useQuery } from "@tanstack/react-query"
import { bookCategoryApi } from "@/apis/book-category.api"

export const useBookCategory = (
  params?: { page?: number; limit?: number; search?: string; all?: boolean },
) => {
  const getCategoriesQuery = useQuery({
    queryKey: params?.all ? ["book-categories", "all"] : ["book-categories", params],
    queryFn: () => {
      if (params?.all) return bookCategoryApi.getAllCategories();
      if (!params) return bookCategoryApi.getCategories();
      const { all: _all, ...rest } = params;
      void _all;
      return bookCategoryApi.getCategories(rest);
    },
  })

  return {
    categories: getCategoriesQuery.data,
    categoriesLoading: getCategoriesQuery.isLoading,
    categoriesError: getCategoriesQuery.error,
    refetchCategories: getCategoriesQuery.refetch,
  }
}

export const useBookCategoryById = (id: string) => {
  const getCategoryByIdQuery = useQuery({
    queryKey: ["book-categories", id],
    queryFn: () => bookCategoryApi.getCategoryById(id),
    enabled: !!id,
  })

  return {
    category: getCategoryByIdQuery.data,
    categoryLoading: getCategoryByIdQuery.isLoading,
    categoryError: getCategoryByIdQuery.error,
  }
}
