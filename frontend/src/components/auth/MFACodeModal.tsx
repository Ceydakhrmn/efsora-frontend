import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useI18n } from '@/i18n'

interface MFACodeModalProps {
  open: boolean
  onClose: () => void
  onVerify: (code: string) => Promise<void>
  mfaType: string
  error?: string | null
}

export function MFACodeModal({ open, onClose, onVerify, mfaType, error }: MFACodeModalProps) {
  const { t } = useI18n()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onVerify(code)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-xs">
        <h2 className="text-lg font-bold mb-2">{t.mfa.title}</h2>
        <p className="mb-4 text-muted-foreground text-sm">
          {mfaType === 'TOTP' ? t.mfa.totpPrompt : t.mfa.emailPrompt}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            autoFocus
            type="text"
            inputMode="numeric"
            maxLength={8}
            placeholder={t.mfa.codePlaceholder}
            value={code}
            onChange={e => setCode(e.target.value)}
            className="text-center tracking-widest font-mono text-lg"
          />
          {error && <div className="text-destructive text-xs">{error}</div>}
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={loading || code.length < 4} className="flex-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : t.mfa.verify}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
