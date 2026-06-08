import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { invitationsApi } from '@/api/invitations'
import { useI18n } from '@/i18n'
import type { AxiosError } from 'axios'
import type { ErrorResponse } from '@/types'

export function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(true)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) { setError(t.users.inviteInvalidLink); setVerifying(false); return }

    invitationsApi.verify(token)
      .then((res) => {
        setEmail(res.data.email)
        setVerifying(false)
      })
      .catch(() => {
        setError(t.users.inviteExpired)
        setVerifying(false)
      })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setFormError(t.users.inviteFirstNameRequired)
      return
    }
    if (password.length < 6) {
      setFormError(t.users.invitePasswordMinLength)
      return
    }
    if (password !== passwordConfirm) {
      setFormError(t.users.invitePasswordsMismatch)
      return
    }

    setSubmitting(true)
    try {
      const res = await invitationsApi.accept(token!, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      localStorage.setItem('user', JSON.stringify({
        email: res.data.email,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
      }))
      navigate('/dashboard')
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>
      const message = axiosError.response?.data?.message || t.users.inviteRegistrationError
      setFormError(message)
      setSubmitting(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">{t.users.inviteVerifying}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">{t.users.inviteUnavailable}</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button variant="outline" onClick={() => navigate('/auth')}>{t.auth.login}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">{t.users.inviteCreateAccount}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{email}</span> {t.users.inviteEnterDetailsFor}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t.auth.firstName}</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t.auth.firstName}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t.auth.lastName}</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t.auth.lastName}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.users.invitePasswordPlaceholder}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">{t.auth.confirmPassword}</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder={t.users.invitePasswordConfirmPlaceholder}
                  required
                  minLength={6}
                />
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.users.inviteCreating}
                  </>
                ) : (
                  t.users.inviteCreateButton
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
