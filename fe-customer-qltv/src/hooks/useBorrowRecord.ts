import { useQuery, useMutation } from "@tanstack/react-query"
import { borrowRecordApi } from "@/apis/borrow-record.api"
import { requestBorrowRenewPayOsRedirect } from "@/lib/request-fine-payos-checkout"
import type { GetBorrowRecordsParams } from "@/types/borrow-record.type"

export const useBorrowRecord = (params?: GetBorrowRecordsParams) => {
  const getBorrowRecordsQuery = useQuery({
    queryKey: ["borrow-records", params],
    queryFn: () => borrowRecordApi.getBorrowRecords(params),
  })

  return {
    borrowRecords: getBorrowRecordsQuery.data,
    borrowRecordsLoading: getBorrowRecordsQuery.isLoading,
    borrowRecordsError: getBorrowRecordsQuery.error,
    refetchBorrowRecords: getBorrowRecordsQuery.refetch,
  }
}

export const useBorrowRecordById = (id: string) => {
  const getBorrowRecordByIdQuery = useQuery({
    queryKey: ["borrow-records", id],
    queryFn: () => borrowRecordApi.getBorrowRecordById(id),
    enabled: !!id,
  })

  return {
    borrowRecord: getBorrowRecordByIdQuery.data,
    borrowRecordLoading: getBorrowRecordByIdQuery.isLoading,
    borrowRecordError: getBorrowRecordByIdQuery.error,
  }
}

export const useReturnBook = () => {
  const returnBookMutation = useMutation({
    mutationFn: ({ id, librarianId }: { id: string; librarianId: string }) =>
      borrowRecordApi.returnBook(id, librarianId),
  })

  return {
    returnBook: returnBookMutation.mutate,
    returnBookAsync: returnBookMutation.mutateAsync,
    returnBookLoading: returnBookMutation.isPending,
    returnBookError: returnBookMutation.error,
    returnBookSuccess: returnBookMutation.isSuccess,
  }
}


export const useRenewBook = () => {
  const renewBookMutation = useMutation({
    mutationFn: (borrowRecordId: string) =>
      requestBorrowRenewPayOsRedirect(borrowRecordId),
  })

  return {
    renewBook: renewBookMutation.mutate,
    renewBookAsync: renewBookMutation.mutateAsync,
    renewBookLoading: renewBookMutation.isPending,
    renewBookError: renewBookMutation.error,
    renewBookSuccess: renewBookMutation.isSuccess,
  }
}
