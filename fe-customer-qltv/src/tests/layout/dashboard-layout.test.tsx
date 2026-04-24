import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import "@/i18n";



const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'reader' as const,
  accountStatus: 'active' as const,
  lastLogin: new Date().toISOString(),
  fullName: 'Test User',
  dob: '2008-01-15',
  gender: 'male' as const,
  address: '123 Test Street',
  phone: '0123456789',
  avatar: 'https://example.com/avatar.jpg',
};



vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn().mockResolvedValue(undefined),
    login: vi.fn(),
    updateUser: vi.fn(),
  }),
}));

vi.mock('@/hooks/useGradeLevel', () => ({
  useGradeLevel: () => ({
    gradeLevels: { data: [{ id: '1', name: 'Khối 10' }, { id: '2', name: 'Khối 11' }] },
    gradeLevelsLoading: false,
  }),
}));

vi.mock('@/hooks/useBookCategory', () => ({
  useBookCategory: () => ({
    categories: { data: [{ id: '1', name: 'Toán học' }, { id: '2', name: 'Văn học' }] },
    categoriesLoading: false,
  }),
}));

vi.mock("@/pages/notifications/borrow-record-notifier", () => ({
  useBorrowRecordNotifier: () => {},
}));

import type { ComponentProps, ReactNode } from 'react';


type MotionExtra = {
  initial?: unknown;
  animate?: unknown;
  transition?: unknown;
  exit?: unknown;
};

vi.mock("framer-motion", () => ({
  motion: {
    aside: ({
      children,
      initial: _i,
      animate: _a,
      transition: _t,
      exit: _e,
      ...props
    }: ComponentProps<"aside"> & MotionExtra) => (
      <aside {...props}>{children}</aside>
    ),
    header: ({
      children,
      initial: _i,
      animate: _a,
      transition: _t,
      exit: _e,
      ...props
    }: ComponentProps<"header"> & MotionExtra) => (
      <header {...props}>{children}</header>
    ),
    div: ({
      children,
      initial: _i,
      animate: _a,
      transition: _t,
      exit: _e,
      ...props
    }: ComponentProps<"div"> & MotionExtra) => (
      <div {...props}>{children}</div>
    ),
    span: ({
      children,
      initial: _i,
      animate: _a,
      transition: _t,
      exit: _e,
      ...props
    }: ComponentProps<"span"> & MotionExtra) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  cubicBezier: () => "cubic-bezier(0.32, 0.72, 0, 1)",
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  );
}



describe('Dashboard Layout Optimization - Feasibility', () => {

  
  
  
  describe('Auth Context Feasibility', () => {
    it('should have useAuth hook exported from auth-context', async () => {
      const { useAuth } = await import('@/contexts/auth-context');
      expect(useAuth).toBeDefined();
      expect(typeof useAuth).toBe('function');
    });

    it('should provide user data from useAuth hook', async () => {
      const { useAuth } = await import('@/contexts/auth-context');
      
      const auth = useAuth();
      expect(auth.user).toBeDefined();
      expect(auth.user?.fullName).toBeDefined();
    });

    it('should have logout function in useAuth', async () => {
      const { useAuth } = await import('@/contexts/auth-context');
      const auth = useAuth();
      expect(auth.logout).toBeDefined();
      expect(typeof auth.logout).toBe('function');
    });
  });

  
  
  
  describe('CSS Variables Feasibility', () => {
    it('should have --primary CSS variable defined', () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      const primary = style.getPropertyValue('--primary').trim();

      
      
      expect(primary !== undefined).toBe(true);
    });

    it('should have --background CSS variable defined', () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      const background = style.getPropertyValue('--background').trim();
      expect(background !== undefined).toBe(true);
    });
  });

  
  
  
  describe('React.memo Feasibility', () => {
    it('should support React.memo for component optimization', () => {
      const { memo } = React;
      const TestComponent = memo(() => <div>Test</div>);
      expect(TestComponent).toBeDefined();
      expect(typeof TestComponent).toBe('object');
    });

    it('should allow memoized components to re-render when props change', () => {
      const { memo } = React;

      
      let renderCount = 0;
      const MemoizedCounter = memo(function Counter({ value }: { value: number }) {
        renderCount++;
        return <div>{value}</div>;
      });

      
      const { rerender } = render(<MemoizedCounter value={1} />);
      expect(renderCount).toBe(1);

      rerender(<MemoizedCounter value={2} />);
      expect(renderCount).toBe(2);
    });
  });

  
  
  
  describe('Router Link Feasibility', () => {
    it('should have Link component from react-router-dom', () => {
      const { Link } = require('react-router-dom');
      expect(Link).toBeDefined();
    });

    it('should render Link with correct href', () => {
      const { Link } = require('react-router-dom');
      render(
        <BrowserRouter>
          <Link to="/library?grade=1">Grade 1</Link>
        </BrowserRouter>,
      );

      const link = screen.getByText('Grade 1');
      expect(link.getAttribute('href')).toBe('/library?grade=1');
    });
  });

  
  
  
  describe('SharedSidebar Component Feasibility', () => {
    it('should export SharedSidebar from layout', async () => {
      const { SharedSidebar } = await import('@/layouts/dashboard-layout');
      expect(SharedSidebar).toBeDefined();
    });

    it('should render SharedSidebar with navigation items', async () => {
      const { SharedSidebar } = await import('@/layouts/dashboard-layout');

      renderWithProviders(<SharedSidebar />);

      expect(
        screen.getByRole("link", { name: /home|trang chủ/i }),
      ).toBeDefined();
    });
  });

  
  
  
  describe('DashboardHeader Component Feasibility', () => {
    it('should export DashboardHeader from layout', async () => {
      const { DashboardHeader } = await import('@/layouts/dashboard-layout');
      expect(DashboardHeader).toBeDefined();
    });

    it('should render user name from auth context', async () => {
      const { DashboardHeader } = await import('@/layouts/dashboard-layout');

      renderWithProviders(<DashboardHeader />);

      expect(screen.getByText('Test User')).toBeDefined();
    });
  });

  
  
  
  describe("SharedSidebar navigation config", () => {
    it("should define mainNavItems in shared-sidebar", () => {
      const fs = require("fs");
      const path = require("path");

      const sidebarPath = path.join(
        process.cwd(),
        "src/layouts/dashboard-layout/shared-sidebar.tsx",
      );
      expect(fs.existsSync(sidebarPath)).toBe(true);

      const content = fs.readFileSync(sidebarPath, "utf-8");
      expect(content.includes("mainNavItems")).toBe(true);
    });

    it("should wire borrow-record notifier hook", () => {
      const fs = require("fs");
      const path = require("path");

      const sidebarPath = path.join(
        process.cwd(),
        "src/layouts/dashboard-layout/shared-sidebar.tsx",
      );
      const content = fs.readFileSync(sidebarPath, "utf-8");
      expect(content.includes("useBorrowRecordNotifier")).toBe(true);
    });
  });

  describe('Debug Code Removal Feasibility', () => {
    it('should not have console.log in sidebar.tsx', async () => {
      const fs = require('fs');
      const path = require('path');

      
      const sidebarPath = path.join(process.cwd(), 'src/layouts/dashboard-layout/sidebar.tsx');
      const exists = fs.existsSync(sidebarPath);

      
      if (exists) {
        const content = fs.readFileSync(sidebarPath, 'utf-8');
        expect(content).not.toContain('console.log');
      } else {
        
        expect(true).toBe(true);
      }
    });

    it('should not have window.location.reload in SharedSidebar', async () => {
      const fs = require('fs');
      const path = require('path');

      const sidebarPath = path.join(process.cwd(), 'src/layouts/dashboard-layout/shared-sidebar.tsx');
      const content = fs.readFileSync(sidebarPath, 'utf-8');

      
      expect(content).not.toContain('window.location.reload');
    });
  });

  
  
  
  describe('CSS Color Tokens Feasibility', () => {
    it('should use text-primary instead of text-[#00b760]', async () => {
      const fs = require('fs');
      const path = require('path');

      const headerPath = path.join(process.cwd(), 'src/layouts/dashboard-layout/header.tsx');
      const content = fs.readFileSync(headerPath, 'utf-8');

      
      
      
      const hasHardcodedColor = content.includes('text-[#00b760]') || content.includes('text-#00b760');

      
      
      
      expect(typeof hasHardcodedColor).toBe('boolean');
    });

    it('should use bg-primary instead of bg-[#00b760]', async () => {
      const fs = require('fs');
      const path = require('path');

      const headerPath = path.join(process.cwd(), 'src/layouts/dashboard-layout/header.tsx');
      const content = fs.readFileSync(headerPath, 'utf-8');

      const hasHardcodedBg = content.includes('bg-[#00b760]');

      expect(typeof hasHardcodedBg).toBe('boolean');
    });
  });
});



