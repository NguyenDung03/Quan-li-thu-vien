import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';
import { TOKEN_KEY, USER_KEY } from '@/constants/auth-storage';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();

	
	const token = localStorage.getItem(TOKEN_KEY);
	const userStr = localStorage.getItem(USER_KEY);
	const hasLocalAuth = !!token && !!userStr;

	
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	
	if (!isAuthenticated && !hasLocalAuth) {
		return <Navigate to="/login" replace />;
	}

	
	return <>{children}</>;
}
