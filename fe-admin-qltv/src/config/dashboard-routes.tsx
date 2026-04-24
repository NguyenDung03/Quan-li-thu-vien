import type { RouteObject } from 'react-router-dom'
import { AuthorsPage } from '@/pages/authors-page/authors-page'
import { BookCategoriesPage } from '@/pages/book-categories-page/book-categories-page'
import { BooksPage } from '@/pages/books-page/books-page'
import { BorrowRecordsPage } from '@/pages/borrow-records/page'
import { DashboardPage } from '@/pages/dashboard-page/dashboard-page'
import { FinesPage } from '@/pages/fines/page'
import { GradeLevelsPage } from '@/pages/grade-levels-page/grade-levels-page'
import { LocationsPage } from '@/pages/locations-page/locations-page'
import { PublishersPage } from '@/pages/publishers-page/publishers-page'
import { ReaderTypesPage } from '@/pages/reader-types-page/reader-types-page'
import { ReadersPage } from '@/pages/readers-page/readers-page'
import { UsersPage } from '@/pages/users-page/users-page'
import { PhysicalCopiesPage } from '@/pages/physical-copies/page'
import { EbooksPage } from '@/pages/ebooks/page'
import { ReservationsPage } from '@/pages/reservation/page'

/** Các route con dưới `MainLayout` + `ProtectedRoute` — tách file để `routes.tsx` gọn, dễ chỉnh từng nhóm dashboard */
export const dashboardChildRoutes: RouteObject[] = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/dashboard/books', element: <BooksPage /> },
  { path: '/dashboard/authors', element: <AuthorsPage /> },
  { path: '/dashboard/publishers', element: <PublishersPage /> },
  { path: '/dashboard/grade-levels', element: <GradeLevelsPage /> },
  { path: '/dashboard/book-categories', element: <BookCategoriesPage /> },
  { path: '/dashboard/locations', element: <LocationsPage /> },
  { path: '/dashboard/readers', element: <ReadersPage /> },
  { path: '/dashboard/reader-types', element: <ReaderTypesPage /> },
  { path: '/dashboard/users', element: <UsersPage /> },
  { path: '/dashboard/borrow', element: <BorrowRecordsPage /> },
  { path: '/dashboard/violations', element: <FinesPage /> },
  { path: '/dashboard/physical-copies', element: <PhysicalCopiesPage /> },
  { path: '/dashboard/ebooks', element: <EbooksPage /> },
  { path: '/dashboard/reservations', element: <ReservationsPage /> },
]
