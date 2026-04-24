import { useMutation, useQuery } from "@tanstack/react-query"
import { userApi } from "@/apis/user.api"
import type { UpdateUserRequest } from "@/types/auth.type"

export const useUser = () => {
  const getMeQuery = useQuery({
    queryKey: ["users", "me"],
    queryFn: () => userApi.getMe(),
  })

  const updateMeMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => userApi.updateMe(data),
  })

  return {
    currentUser: getMeQuery.data,
    currentUserLoading: getMeQuery.isLoading,
    currentUserError: getMeQuery.error,
    refetchCurrentUser: getMeQuery.refetch,

    updateMe: updateMeMutation.mutate,
    updateMeAsync: updateMeMutation.mutateAsync,
    updateMeLoading: updateMeMutation.isPending,
    updateMeError: updateMeMutation.error,
  }
}

export const useUserById = (id: string) => {
  const getUserByIdQuery = useQuery({
    queryKey: ["users", id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  })

  return {
    user: getUserByIdQuery.data,
    userLoading: getUserByIdQuery.isLoading,
    userError: getUserByIdQuery.error,
  }
}
