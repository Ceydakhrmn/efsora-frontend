import { useState } from 'react'
import { MFACodeModal } from './MFACodeModal'
import { authApi } from '@/api/auth'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'
import { notify } from '@/lib/notify'
import type { AxiosError } from 'axios'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onForgotPassword: () => void
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [mode, setMode] = useState<'password' | 'totp'>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mfaModal, setMfaModal] = useState<{ open: boolean; userId?: number; mfaType?: string; email?: string; password?: string }>({ open: false })
  const [mfaError, setMfaError] = useState<string | null>(null)

  // TOTP-only login state
  const [totpEmail, setTotpEmail] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [totpLoading, setTotpLoading] = useState(false)

  const { login, handleAuthResponse } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setMfaError(null)
    try {
      const result = await login(data)
      if (result.passwordExpired) {
        notify.warning('Şifrenizin süresi dolmuş. Lütfen şifrenizi değiştirin.')
        navigate('/settings')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const axiosError = err as AxiosError<any>
      if (axiosError.response?.data?.mfaRequired) {
        setMfaModal({ open: true, userId: axiosError.response.data.userId, mfaType: axiosError.response.data.mfaType, email: data.email, password: data.password })
        return
      }
      if (axiosError.response?.status === 401) {
        setError(t.auth.invalidCredentials)
      } else if (axiosError.response?.status === 429) {
        setError(axiosError.response.data?.message || 'Hesap kilitlendi. Lütfen bekleyin.')
      } else {
        setError(axiosError.response?.data?.message || t.common.error)
      }
    }
  }

  const handleVerifyMfa = async (code: string) => {
    setMfaError(null)
    try {
      await authApi.verifyMfa({ userId: mfaModal.userId!, code })
      await login({ email: mfaModal.email!, password: mfaModal.password! })
      setMfaModal({ open: false })
      navigate('/dashboard')
    } catch (err) {
      const axiosError = err as AxiosError<any>
      setMfaError(axiosError.response?.data?.message || 'Kod doğrulanamadı.')
    }
  }

  const handleTotpLogin = async () => {
    if (!totpEmail || totpCode.length < 6) return
    setTotpLoading(true)
    setError(null)
    try {
      const res = await authApi.loginWithTotp({ email: totpEmail, code: totpCode })
      handleAuthResponse(res.data)
      navigate('/dashboard')
    } catch (err) {
      const axiosError = err as AxiosError<any>
      if (axiosError.response?.status === 429) {
        setError(axiosError.response.data?.message || 'Hesap kilitlendi. Lütfen bekleyin.')
      } else {
        setError(axiosError.response?.data?.message || 'Geçersiz kod veya email.')
      }
    } finally {
      setTotpLoading(false)
    }
  }

  return (
    <>
      {/* Mode tabs */}
      <div className="flex rounded-lg border border-border bg-muted p-1 mb-4">
        <button
          type="button"
          onClick={() => { setMode('password'); setError(null) }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${mode === 'password' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          Şifre ile Giriş
        </button>
        <button
          type="button"
          onClick={() => { setMode('totp'); setError(null) }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${mode === 'totp' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Authenticator ile Giriş
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive mb-3">
          {error}
        </div>
      )}

      {mode === 'password' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">{t.auth.email}</Label>
            <Input id="login-email" type="email" placeholder="ornek@efsora.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">{t.auth.password}</Label>
              <button type="button" onClick={onForgotPassword} className="text-xs text-primary hover:underline cursor-pointer">
                {t.auth.forgotPassword}
              </button>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />{t.common.loading}</> : t.auth.login}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Google Authenticator uygulamasında görünen 6 haneli kodu girin.
          </p>
          <div className="space-y-2">
            <Label htmlFor="totp-email">{t.auth.email}</Label>
            <Input
              id="totp-email"
              type="email"
              placeholder="ornek@efsora.com"
              value={totpEmail}
              onChange={e => setTotpEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totp-code">Authenticator Kodu</Label>
            <Input
              id="totp-code"
              placeholder="000000"
              value={totpCode}
              onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="font-mono text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>
          <Button className="w-full" onClick={handleTotpLogin} disabled={totpLoading || totpCode.length < 6 || !totpEmail}>
            {totpLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{t.common.loading}</> : 'Giriş Yap'}
          </Button>
        </div>
      )}

      <MFACodeModal
        open={mfaModal.open}
        mfaType={mfaModal.mfaType || 'TOTP'}
        onClose={() => setMfaModal({ open: false })}
        onVerify={handleVerifyMfa}
        error={mfaError}
      />
    </>
  )
}
