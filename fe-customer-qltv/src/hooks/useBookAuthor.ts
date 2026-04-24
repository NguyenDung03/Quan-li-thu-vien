import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookAuthorApi } from "@/apis/book-author.api";
import { authorApi } from "@/apis/author.api";
import type { GetBookAuthorsParams, GetAuthorsParams } from "@/types/book.type";

export const useBookAuthor = (params?: GetBookAuthorsParams) => {
  const getBookAuthorsQuery = useQuery({
    queryKey: ["book-authors", params],
    queryFn: () => bookAuthorApi.getBookAuthors(params),
  });

  return {
    bookAuthors: getBookAuthorsQuery.data,
    bookAuthorsLoading: getBookAuthorsQuery.isLoading,
    bookAuthorsError: getBookAuthorsQuery.error,
    refetchBookAuthors: getBookAuthorsQuery.refetch,
  };
};

export const useBookAuthorById = (bookId: string, authorId: string) => {
  const getBookAuthorByIdQuery = useQuery({
    queryKey: ["book-authors", bookId, authorId],
    queryFn: () => bookAuthorApi.getBookAuthorById(`${bookId}/${authorId}`),
    enabled: !!bookId && !!authorId,
  });

  return {
    bookAuthor: getBookAuthorByIdQuery.data,
    bookAuthorLoading: getBookAuthorByIdQuery.isLoading,
    bookAuthorError: getBookAuthorByIdQuery.error,
  };
};


export const useAuthorsByBookId = (bookId: string) => {
  
  const { bookAuthors, bookAuthorsLoading, bookAuthorsError } = useBookAuthor({ limit: 100 });

  
  const { authors: authorsResponse } = useAuthor({ limit: 100 });

  const bookAuthorsData = bookAuthors?.data;
  const authorsData = authorsResponse?.data;

  const authors = useMemo(() => {
    if (!bookAuthorsData || !authorsData) return [];

    const authorIds = bookAuthorsData
      .filter((ba) => ba.bookId === bookId)
      .map((ba) => ba.authorId);

    return authorsData.filter(
      (author) => author.id != null && authorIds.includes(author.id),
    );
  }, [bookAuthorsData, authorsData, bookId]);

  return {
    authors,
    authorsLoading: bookAuthorsLoading,
    authorsError: bookAuthorsError,
  };
};


export const useAuthor = (params?: GetAuthorsParams) => {
  const getAuthorsQuery = useQuery({
    queryKey: ["authors", params],
    queryFn: () => authorApi.getAuthors(params),
  });

  return {
    authors: getAuthorsQuery.data,
    authorsLoading: getAuthorsQuery.isLoading,
    authorsError: getAuthorsQuery.error,
    refetchAuthors: getAuthorsQuery.refetch,
  };
};

export const useAuthorById = (id: string) => {
  const getAuthorByIdQuery = useQuery({
    queryKey: ["authors", id],
    queryFn: () => authorApi.getAuthorById(id),
    enabled: !!id,
  });

  return {
    author: getAuthorByIdQuery.data,
    authorLoading: getAuthorByIdQuery.isLoading,
    authorError: getAuthorByIdQuery.error,
  };
};