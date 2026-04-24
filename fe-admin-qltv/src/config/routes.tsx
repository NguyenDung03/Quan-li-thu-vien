import { MainLayout } from '@/components/layouts/main-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { RedirectToDashboard } from '@/components/redirect-to-dashboard'
import { AppRootLayout } from '@/components/app-root-layout'
import { LoginPage } from '@/pages/login-page/login-page'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { dashboardChildRoutes } from './dashboard-routes'

export const router = createBrowserRouter([
  {
    element: <AppRootLayout />,
    children: [
      {
        path: '/login',
        element: (
          <RedirectToDashboard>
            <LoginPage />
          </RedirectToDashboard>
        ),
      },
      {
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: dashboardChildRoutes,
      },
      {
        path: '/',
        element: <Navigate to="/login" replace />,
      },
    ],
  },
])
