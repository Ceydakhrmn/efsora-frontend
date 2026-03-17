import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/api/auth'
import { useI18n } from '@/i18n'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from '@/types'

const emailSchema = z.object({
  email: z.string().email(),
})

const resetSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
})

interface ForgotPasswordFlowProps {
  onBack: () => void
}

export function ForgotPasswordFlow({ onBack }: ForgotPasswordFlowProps) {
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  })

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
  })

  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    setError(null)
    try {
      const response = await authApi.forgotPassword(data)
      // Backend returns the token in message field for dev purposes
      toast.success(t.auth.forgotPasswordSuccess)
      // Auto-fill token if returned
      if (response.data.message) {
        resetForm.setValue('token', response.data.message)
      }
      setStep('reset')
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      setError(axiosError.response?.data?.message || t.common.error)
    }
  }

  const onResetSubmit = async (data: z.infer<typeof resetSchema>) => {
    setError(null)
    try {
      await authApi.resetPassword(data)
      toast.success(t.auth.resetPasswordSuccess)
      onBack()
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      setError(axiosError.response?.data?.message || t.common.error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-lg">
              {step === 'email' ? t.auth.forgotPasswordTitle : t.auth.resetPasswordTitle}
            </CardTitle>
            <CardDescription>
              {step === 'email' ? t.auth.forgotPasswordSubtitle : t.auth.resetPasswordSubtitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">{t.auth.email}</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="ornek@efsora.com"
                {...emailForm.register('email')}
              />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.auth.sendResetCode
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-token">{t.auth.enterResetCode}</Label>
              <Input
                id="reset-token"
                placeholder="Token"
                {...resetForm.register('token')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-password">{t.auth.newPassword}</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="••••••••"
                {...resetForm.register('newPassword')}
              />
              {resetForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">{resetForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
              {resetForm.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t.auth.resetPassword
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
