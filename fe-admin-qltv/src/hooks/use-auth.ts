import { useAuthContext } from '@/contexts/auth-context'
import { UserRole } from '@/types/auth.types'

export const useAuth = () => {
	const {
		user,
		reader,
		accessToken,
		isAuthenticated,
		isLoading,
		error,
		login,
		logout,
		clearError,
	} = useAuthContext()

	return {
		
		user,
		reader,
		accessToken,
		isAuthenticated,
		isLoading,
		error,

		
		login,
		logout,
		clearError,

		
		isAdmin: user?.role === UserRole.ADMIN,
		isReader: user?.role === UserRole.READER,

		
		userDisplayName: reader?.fullName || user?.username || '',
		userEmail: user?.email || '',
		userRole: user?.role,
	}
}
