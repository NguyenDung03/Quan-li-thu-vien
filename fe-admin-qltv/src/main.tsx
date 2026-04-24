import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import './i18n'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { useThemeStore } from './stores/theme-store'
import { useLanguageStore } from './stores/language-store'
import { AuthProvider } from './contexts/auth-context'
import i18n from './i18n'

function ThemeInitializer() {
  const theme = useThemeStore((state) => state.theme)
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])
  return null
}

function LanguageInitializer() {
  const language = useLanguageStore((state) => state.language)
  useEffect(() => {
    i18n.changeLanguage(language)
  }, [language])
  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeInitializer />
        <LanguageInitializer />
        <App />
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
