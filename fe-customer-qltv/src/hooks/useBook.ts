import { useQuery } from "@tanstack/react-query"
import { bookApi } from "@/apis/book.api"
import type { GetBooksParams } from "@/types/book.type"

export const useBook = (params?: GetBooksParams) => {
  const getBooksQuery = useQuery({
    queryKey: ["books", params],
    queryFn: () => bookApi.getBooks(params),
  })

  return {
    books: getBooksQuery.data,
    booksLoading: getBooksQuery.isLoading,
    booksError: getBooksQuery.error,
    refetchBooks: getBooksQuery.refetch,
  }
}

export const useBookById = (id: string) => {
  const getBookByIdQuery = useQuery({
    queryKey: ["books", id],
    queryFn: () => bookApi.getBookById(id),
    enabled: !!id,
  })

  return {
    book: getBookByIdQuery.data,
    bookLoading: getBookByIdQuery.isLoading,
    bookError: getBookByIdQuery.error,
  }
}
