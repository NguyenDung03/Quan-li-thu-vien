import { ProtectedRoute, PublicRoute } from "@/components/routes";
import { DashboardLayout } from "@/layouts/dashboard-layout/dashboard-layout";
import { LoginPage } from "@/pages/auth/login/page";
import { RegisterInfoPage } from "@/pages/auth/register/page";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password/page";
import { ResetPasswordPage } from "@/pages/auth/reset-password/page";
import { BookDetailPage } from "@/pages/book-detail/page";
import { HistoryPage } from "@/pages/history-borrow/page";
import { HistoryFinesPage } from "@/pages/history-fines/page";
import { HomePage } from "@/pages/home/page";
import { ProfilePage } from "@/pages/profile/page";
import { ReaderPage } from "@/pages/reader/page";
import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import BookReservationPage from "./pages/history-reservation/page";
import BorrowRecordsPage from "./pages/borrow-records/page";
import LibraryPage from "./pages/library/page";
import { SettingsPage } from "./pages/settings/page";
import { PaymentSuccessPage } from "./pages/payment-success/page";
import { PaymentCancelPage } from "./pages/payment-cancel/page";

function LayoutWithoutSidebar() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <ReaderPage />
    </div>
  );
}

function LayoutWrapper() {
  const location = useLocation();
  const isReaderPage = location.pathname.startsWith("/reader");

  if (isReaderPage) {
    return <LayoutWithoutSidebar />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export const router = createBrowserRouter([
  
  {
    element: <Outlet />,
    children: [
      {
        path: "/login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <PublicRoute>
            <RegisterInfoPage />
          </PublicRoute>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        ),
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <LayoutWrapper />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <HomePage />,
      },

      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/history-read",
        element: <HistoryPage />,
      },
      {
        path: "/borrow-records",
        element: <BorrowRecordsPage />,
      },
      {
        path: "/history-fines",
        element: <HistoryFinesPage />,
      },
      {
        path: "/thanh-toan-thanh-cong",
        element: <PaymentSuccessPage />,
      },
      {
        path: "/thanh-toan-that-bai",
        element: <PaymentCancelPage />,
      },
      {
        path: "/history-reservation",
        element: <BookReservationPage />,
      },
      {
        path: "/library",
        element: <LibraryPage />,
      },
      {
        path: "/book/:id",
        element: <BookDetailPage />,
      },
      {
        path: "/reader/:bookId",
        element: <ReaderPage />,
      },
    ],
  },
]);
