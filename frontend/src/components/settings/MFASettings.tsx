import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import { notify } from '@/lib/notify'
import { useI18n } from '@/i18n'

export function MFASettings() {
  const { t } = useI18n()
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
      setError(t.mfa.startFailed)
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
      notify.success(t.mfa.connectedSuccess)
      setEnabled(true)
      setStep('view')
      setCode('')
      if (user) updateUser({ ...user, mfaEnabled: true })
    } catch {
      setError(t.mfa.codeError)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    setError(null)
    try {
      await authApi.disableMfa()
      notify.success(t.mfa.disconnected)
      setEnabled(false)
      setStep('view')
      if (user) updateUser({ ...user, mfaEnabled: false })
    } catch {
      setError(t.mfa.disableError)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'setup') {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="font-medium text-sm">{t.mfa.step1}</p>
          <p className="text-sm text-muted-foreground">{t.mfa.step1Sub}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm">{t.mfa.step2}</p>
          <div className="bg-white p-4 rounded-xl w-fit">
            <QRCodeSVG value={qrUrl} size={180} level="M" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{t.mfa.manualCode}</p>
          <p className="font-mono text-xs bg-muted px-3 py-2 rounded break-all">{secret}</p>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-sm">{t.mfa.step3}</p>
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
            {t.mfa.verifyActivate}
          </Button>
          <Button variant="outline" onClick={() => { setStep('view'); setCode(''); setError(null) }}>
            {t.common.cancel}
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
          {enabled ? t.mfa.connected : t.mfa.notConnected}
        </span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {enabled ? (
        <Button variant="destructive" size="sm" onClick={handleDisable} disabled={loading}>
          {t.mfa.disconnect}
        </Button>
      ) : (
        <Button size="sm" onClick={startSetup} disabled={loading}>
          {t.mfa.connect}
        </Button>
      )}
    </div>
  )
}
