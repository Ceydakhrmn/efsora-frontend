import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import { notify } from '@/lib/notify'

export function MFASettings() {
  const { user } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [secret, setSecret] = useState('')
  const [qr, setQr] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'view'|'setup'|'verify'>('view')
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    // Kullanıcı MFA aktif mi?
    if (user) {
      setEnabled(!!user.mfaEnabled)
      setLoading(false)
    }
  }, [user])

  const startSetup = async () => {
    setLoading(true)
    setError(null)
    try {
      // Backend'den secret ve QR al
      const res = await authApi.startMfaSetup()
      setSecret(res.data.secret)
      setQr(res.data.qr)
      setStep('setup')
    } catch (e) {
      setError('MFA başlatılamadı.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    setError(null)
    try {
      await authApi.verifyMfaSetup({ code })
      notify.success('MFA etkinleştirildi!')
      setEnabled(true)
      setStep('view')
    } catch (e) {
      setError('Kod doğrulanamadı.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    setError(null)
    try {
      await authApi.disableMfa()
      notify.success('MFA devre dışı bırakıldı.')
      setEnabled(false)
      setStep('view')
    } catch (e) {
      setError('Devre dışı bırakılamadı.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Yükleniyor...</div>

  if (step === 'setup') {
    return (
      <div className="space-y-3">
        <p>Authenticator uygulamanızda bu QR kodu okutun veya anahtarı girin:</p>
        {qr && (
          <div className="bg-white p-4 rounded-lg mx-auto w-fit">
            <QRCodeSVG value={qr} size={200} level="M" />
          </div>
        )}
        <div className="font-mono text-sm break-all">{secret}</div>
        <Input
          placeholder="6 haneli kod"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="max-w-xs"
        />
        {error && <div className="text-destructive text-xs">{error}</div>}
        <div className="flex gap-2">
          <Button onClick={handleVerify} disabled={loading || code.length < 6}>Doğrula</Button>
          <Button variant="outline" onClick={() => setStep('view')}>İptal</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={enabled ? 'text-green-600' : 'text-muted-foreground'}>
          {enabled ? 'MFA/2FA Etkin' : 'MFA/2FA Kapalı'}
        </span>
        {enabled ? (
          <Button variant="destructive" size="sm" onClick={handleDisable}>Devre Dışı Bırak</Button>
        ) : (
          <Button size="sm" onClick={startSetup}>Etkinleştir</Button>
        )}
      </div>
      {error && <div className="text-destructive text-xs">{error}</div>}
    </div>
  )
}
