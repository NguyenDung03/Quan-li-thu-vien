import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/providers/app-providers";
import { router } from "./router.tsx";
import { Toaster } from "@/components/ui/sonner";
import LibraryChatbot from "@/features/chatbot/library-chatbot";
import { useAuth } from "@/contexts/auth-context";

function ChatbotAfterAuth() {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading || !isAuthenticated) return null;
  return <LibraryChatbot />;
}

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
      <ChatbotAfterAuth />
    </AppProviders>
  );
}

export default App;
