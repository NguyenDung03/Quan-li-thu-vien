import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type {
  User,
  AuthState,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types/auth.type";
import { AUTH_KEYS } from "@/constants/auth";
import { authApi } from "@/apis/auth.api";
import { readerApi } from "@/apis/reader.api";

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function clearAuthStorage() {
  localStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER);
  localStorage.removeItem(AUTH_KEYS.READER);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
      const userStr = localStorage.getItem(AUTH_KEYS.USER);

      if (token && userStr && userStr !== "undefined") {
        try {
          const cachedUser = JSON.parse(userStr) as User;
          setState({
            user: cachedUser,
            isAuthenticated: true,
            isLoading: true,
          });

          const data = await authApi.getMe();
          localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data));

          try {
            const readerData = await readerApi.getReaderByUserId(data.id);
            localStorage.setItem(AUTH_KEYS.READER, JSON.stringify(readerData));
          } catch {
            void 0;
          }

          setState({
            user: data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          clearAuthStorage();
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    void initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const data = await authApi.login(credentials);
    localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, data.access_token);

    const userData = await authApi.getMe();
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(userData));

    try {
      const readerData = await readerApi.getReaderByUserId(userData.id);
      localStorage.setItem(AUTH_KEYS.READER, JSON.stringify(readerData));
    } catch {
      localStorage.removeItem(AUTH_KEYS.READER);
    }

    setState({ user: userData, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    clearAuthStorage();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    await authApi.forgotPassword(data);
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordRequest) => {
    await authApi.resetPassword(data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
