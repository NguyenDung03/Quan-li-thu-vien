import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from 'react'
import type { User, Reader, LoginRequest, LoginResponse } from '@/types/auth.types'
import axios from 'axios'
import axiosClient from '@/apis/axios-client'
import { READER_KEY, TOKEN_KEY, USER_KEY } from '@/constants/auth-storage'
import { queryClient } from '@/lib/query-client'

interface AuthContextType {
	
	user: User | null
	reader: Reader | null
	accessToken: string | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null

	
	login: (credentials: LoginRequest) => Promise<boolean>
	logout: () => void
	clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [reader, setReader] = useState<Reader | null>(null)
	const [accessToken, setAccessToken] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	
	useEffect(() => {
		const initializeAuth = () => {
			const token = localStorage.getItem(TOKEN_KEY)
			const storedUser = localStorage.getItem(USER_KEY)
			const storedReader = localStorage.getItem(READER_KEY)

			if (token) {
				setAccessToken(token)
				if (storedUser) {
					try {
						setUser(JSON.parse(storedUser))
					} catch {
						localStorage.removeItem(TOKEN_KEY)
						localStorage.removeItem(USER_KEY)
						localStorage.removeItem(READER_KEY)
					}
				}
				if (storedReader) {
					try {
						setReader(JSON.parse(storedReader))
					} catch {
						localStorage.removeItem(READER_KEY)
					}
				}
			}

			setIsLoading(false)
		}

		initializeAuth()
	}, [])

	const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
		setIsLoading(true)
		setError(null)

		try {
			
			const loginResponse = await axiosClient.post<LoginResponse>(
				'/api/auth/login',
				credentials
			)
			const token = loginResponse.data.access_token

			
			localStorage.setItem(TOKEN_KEY, token)
			setAccessToken(token)

			
			const userResponse = await axiosClient.get<User>('/api/users/me', {
				headers: { Authorization: `Bearer ${token}` },
			})
			const userData = userResponse.data
			setUser(userData)
			localStorage.setItem(USER_KEY, JSON.stringify(userData))

			
			if (userData.role === 'reader') {
				setError('Bạn không có quyền truy cập vào trang quản trị admin')
				
				localStorage.removeItem(TOKEN_KEY)
				setAccessToken(null)
				setIsLoading(false)
				return false
			}

			
			try {
				const readerResponse = await axiosClient.get<Reader>(
					`/api/readers/user/${userData.id}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				)
				setReader(readerResponse.data)
				localStorage.setItem(READER_KEY, JSON.stringify(readerResponse.data))
			} catch {
				
				setReader(null)
			}

			setIsLoading(false)
			return true
		} catch (err) {
			
			let displayError = 'Đăng nhập thất bại'

			if (axios.isAxiosError(err)) {
				if (err.response?.status === 401) {
					displayError = 'Tên đăng nhập hoặc mật khẩu không đúng'
				} else if (err.code === 'ECONNABORTED' || !err.response) {
					displayError = 'Không thể kết nối đến máy chủ'
				}
			}

			setError(displayError)
			setIsLoading(false)
			return false
		}
	}, [])

	const logout = useCallback(() => {
		queryClient.clear()
		localStorage.removeItem(TOKEN_KEY)
		localStorage.removeItem(USER_KEY)
		localStorage.removeItem(READER_KEY)
		setUser(null)
		setReader(null)
		setAccessToken(null)
		setError(null)
	}, [])

	const clearError = useCallback(() => {
		setError(null)
	}, [])

	const value: AuthContextType = {
		user,
		reader,
		accessToken,
		isAuthenticated: !!accessToken && !!user,
		isLoading,
		error,
		login,
		logout,
		clearError,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuthContext must be used within an AuthProvider')
	}
	return context
}
