import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { invitationsApi } from '@/api/invitations'

export function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) { setError('Geçersiz davet linki'); return }

    invitationsApi.accept(token)
      .then((res) => {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('refreshToken', res.data.refreshToken)
        localStorage.setItem('user', JSON.stringify({
          email: res.data.email,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
        }))
        navigate('/dashboard')
      })
      .catch((err) => {
        const message = err.response?.data?.message || 'Davet geçersiz veya süresi dolmuş'
        setError(message)
      })
  }, [token])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Davet kullanılamıyor</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button variant="outline" onClick={() => navigate('/auth')}>Giriş Yap</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        <p className="text-muted-foreground text-sm">Sisteme giriş yapılıyor...</p>
      </div>
    </div>
  )
}
