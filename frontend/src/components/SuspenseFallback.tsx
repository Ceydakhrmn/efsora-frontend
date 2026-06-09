import { Loader2 } from 'lucide-react'
import { useI18n } from '@/i18n'

export function SuspenseFallback() {
  const { t } = useI18n()
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      </div>
    </div>
  )
}
