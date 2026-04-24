import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { TOKEN_KEY, USER_KEY } from '@/constants/auth-storage'

interface RedirectToDashboardProps {
	children: ReactNode
}

export function RedirectToDashboard({ children }: RedirectToDashboardProps) {
	const { isAuthenticated, isLoading } = useAuth()

	
	const token = localStorage.getItem(TOKEN_KEY)
	const userStr = localStorage.getItem(USER_KEY)
	const hasLocalAuth = !!token && !!userStr

	
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		)
	}

	
	if (isAuthenticated || hasLocalAuth) {
		return <Navigate to="/dashboard" replace />
	}

	
	return <>{children}</>
}
