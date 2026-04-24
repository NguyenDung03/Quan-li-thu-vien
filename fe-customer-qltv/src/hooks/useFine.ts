import { useQuery } from "@tanstack/react-query";
import { fineApi } from "@/apis/fine.api";
import type { GetFinesParams } from "@/types/fine.type";

export const useFine = (params?: GetFinesParams) => {
  const getFinesQuery = useQuery({
    queryKey: ["fines", params],
    queryFn: () => fineApi.getFines(params),
  });

  return {
    fines: getFinesQuery.data,
    finesLoading: getFinesQuery.isLoading,
    finesError: getFinesQuery.error,
    refetchFines: getFinesQuery.refetch,
  };
};

export const useFineById = (id: string) => {
  const getFineByIdQuery = useQuery({
    queryKey: ["fines", id],
    queryFn: () => fineApi.getFineById(id),
    enabled: !!id,
  });

  return {
    fine: getFineByIdQuery.data,
    fineLoading: getFineByIdQuery.isLoading,
    fineError: getFineByIdQuery.error,
  };
};
