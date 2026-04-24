import api from "@/lib/api";
import type {
  BorrowRecord,
  BorrowRecordsResponse,
  GetBorrowRecordsParams,
} from "@/types/borrow-record.type";

export const borrowRecordApi = {
  getBorrowRecords: async (
    params?: GetBorrowRecordsParams,
  ): Promise<BorrowRecordsResponse> => {
    const response = await api.get<BorrowRecordsResponse>("/borrow-records/my", {
      params,
    });
    return response.data;
  },

  getBorrowRecordById: async (id: string): Promise<BorrowRecord> => {
    const response = await api.get<BorrowRecord>(`/borrow-records/${id}`);
    return response.data;
  },

  returnBook: async (
    id: string,
    librarianId: string,
  ): Promise<BorrowRecord> => {
    const response = await api.post<BorrowRecord>(
      `/borrow-records/${id}/return`,
      { librarianId },
    );
    return response.data;
  },
};
