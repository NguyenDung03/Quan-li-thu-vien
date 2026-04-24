import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
