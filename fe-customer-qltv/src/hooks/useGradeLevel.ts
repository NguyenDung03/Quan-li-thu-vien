import { useQuery } from "@tanstack/react-query";
import { gradeLevelApi } from "@/apis/grade-level.api";
import type { GetGradeLevelsParams } from "@/types/book.type";

export const useGradeLevel = (params?: GetGradeLevelsParams) => {
  const getGradeLevelsQuery = useQuery({
    queryKey: ["grade-levels", params],
    queryFn: () => gradeLevelApi.getGradeLevels(params),
  });

  return {
    gradeLevels: getGradeLevelsQuery.data,
    gradeLevelsLoading: getGradeLevelsQuery.isLoading,
    gradeLevelsError: getGradeLevelsQuery.error,
    refetchGradeLevels: getGradeLevelsQuery.refetch,
  };
};
