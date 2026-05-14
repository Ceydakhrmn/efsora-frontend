import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import { notify } from '@/lib/notify'

export function MFASettings() {
  const { user, updateUser } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [secret, setSecret] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'view' | 'setup' | 'verify'>('view')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) setEnabled(!!user.mfaEnabled)
  }, [user])

  const startSetup = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.startMfaSetup()
      setSecret(res.data.secret)
      setQrUrl(res.data.qr)
      setStep('setup')
    } catch {
      setError('MFA başlatılamadı.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) return
    setLoading(true)
    setError(null)
    try {
      await authApi.verifyMfaSetup({ code })
      notify.success('Authenticator bağlandı! Artık girişte kullanabilirsiniz.')
      setEnabled(true)
      setStep('view')
      setCode('')
      if (user) updateUser({ ...user, mfaEnabled: true })
    } catch {
      setError('Kod doğrulanamadı. Google Authenticator\'daki güncel kodu girin.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    setError(null)
    try {
      await authApi.disableMfa()
      notify.success('Authenticator bağlantısı kaldırıldı.')
      setEnabled(false)
      setStep('view')
      if (user) updateUser({ ...user, mfaEnabled: false })
    } catch {
      setError('Devre dışı bırakılamadı.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'setup') {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="font-medium text-sm">1. Google Authenticator uygulamasını açın</p>
          <p className="text-sm text-muted-foreground">App Store veya Google Play'den indirin.</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm">2. Aşağıdaki QR kodu okutun</p>
          <div className="bg-white p-4 rounded-xl w-fit">
            <QRCodeSVG value={qrUrl} size={180} level="M" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">QR okuyamıyorsanız bu kodu manuel girin:</p>
          <p className="font-mono text-xs bg-muted px-3 py-2 rounded break-all">{secret}</p>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-sm">3. Uygulamadan gelen 6 haneli kodu girin</p>
          <Input
            placeholder="000000"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="max-w-[160px] font-mono text-center text-lg tracking-widest"
            maxLength={6}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleVerify} disabled={loading || code.length < 6}>
            Doğrula ve Etkinleştir
          </Button>
          <Button variant="outline" onClick={() => { setStep('view'); setCode(''); setError(null) }}>
            İptal
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-muted-foreground'}`} />
        <span className="text-sm">
          {enabled ? 'Google Authenticator bağlı — girişte kullanılabilir' : 'Authenticator bağlı değil'}
        </span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {enabled ? (
        <Button variant="destructive" size="sm" onClick={handleDisable} disabled={loading}>
          Authenticator Bağlantısını Kaldır
        </Button>
      ) : (
        <Button size="sm" onClick={startSetup} disabled={loading}>
          Google Authenticator'a Bağlan
        </Button>
      )}
    </div>
  )
}
