import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
	clearAuthNavigation,
	registerAuthNavigation,
} from '@/lib/auth-navigation'

export function AppRootLayout() {
	const navigate = useNavigate()
	const { logout } = useAuth()

	useEffect(() => {
		registerAuthNavigation(navigate, logout)
		return () => clearAuthNavigation()
	}, [navigate, logout])

	return <Outlet />
}
