import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookApi } from '@/apis/book.api'
import type { GetBooksParams, CreateBookRequest, UpdateBookRequest } from '@/types/book.types'

export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (params: GetBooksParams) => [...bookKeys.lists(), params] as const,
  details: () => [...bookKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
}

export const useBooks = (params: GetBooksParams) => {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => bookApi.getBooks(params),
  })
}

export const useBook = (id: string) => {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => bookApi.getBookById(id),
    enabled: !!id,
  })
}

export const useCreateBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBookRequest) => bookApi.createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
    },
  })
}

export const useUpdateBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookRequest }) =>
      bookApi.updateBook(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(id) })
    },
  })
}

export const useDeleteBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookApi.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
    },
  })
}

export const useAddBookAuthor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { bookId: string; authorId: string }) =>
      bookApi.addBookAuthor(data),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(bookId) })
    },
  })
}

export const useRemoveBookAuthor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookApi.removeBookAuthor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
  })
}

export const useAddBookGradeLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookId, gradeLevelId }: { bookId: string; gradeLevelId: string }) =>
      bookApi.addBookGradeLevel(bookId, gradeLevelId),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(bookId) })
    },
  })
}

export const useRemoveBookGradeLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ bookId, gradeLevelId }: { bookId: string; gradeLevelId: string }) =>
      bookApi.removeBookGradeLevel(bookId, gradeLevelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
  })
}
