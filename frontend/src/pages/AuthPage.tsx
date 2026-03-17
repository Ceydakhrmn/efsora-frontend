import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { ForgotPasswordFlow } from '@/components/auth/ForgotPasswordFlow'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'

export function AuthPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
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

  if (showForgotPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-lg border bg-muted p-1">
          <button
            onClick={() => setLanguage('tr')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${language === 'tr' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            TR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${language === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            EN
          </button>
        </div>
        <ForgotPasswordFlow onBack={() => setShowForgotPassword(false)} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Language Switch */}
      <div className="absolute top-4 right-4 flex items-center gap-1 rounded-lg border bg-muted p-1">
        <button
          onClick={() => setLanguage('tr')}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${language === 'tr' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          TR
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${language === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          EN
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
            E
          </div>
          <h1 className="text-2xl font-bold text-foreground">Efsora</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === 'login' ? t.auth.loginSubtitle : t.auth.registerSubtitle}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t.auth.login}</TabsTrigger>
                <TabsTrigger value="register">{t.auth.register}</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm onSuccess={() => setActiveTab('login')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
