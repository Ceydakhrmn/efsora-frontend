import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/LoginForm'
import { ForgotPasswordFlow } from '@/components/auth/ForgotPasswordFlow'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'

export function AuthPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  const { t, language, setLanguage } = useI18n()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const languageSwitch = (
    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-lg border bg-muted p-1">
      <button
        onClick={() => setLanguage('tr')}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer font-mono ${language === 'tr' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
      >
        TR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer font-mono ${language === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
      >
        EN
      </button>
    </div>
  )

  if (showForgotPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        {languageSwitch}
        <ForgotPasswordFlow onBack={() => setShowForgotPassword(false)} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {languageSwitch}

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
            <img
              src="/efsora-logo.jpg"
              alt="Efsora Labs"
              className="h-14 w-14 rounded-xl object-cover shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
            <div
              className="hidden h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl"
              style={{ display: 'none' }}
            >
              E
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground font-archivo">Efsora Labs</h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">
            {t.auth.loginSubtitle}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}