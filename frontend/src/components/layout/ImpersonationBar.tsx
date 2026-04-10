import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ImpersonationBar() {
  const { isImpersonating, user, stopImpersonation } = useAuth()
  const { t } = useI18n()

  if (!isImpersonating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium shadow-lg">
      <span>
        ⚠️ {t.impersonation.banner.replace('{name}', `${user?.firstName} ${user?.lastName}`)}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={stopImpersonation}
        className="bg-white text-red-600 hover:bg-red-50 border-white h-7 text-xs"
      >
        <X className="h-3 w-3 mr-1" />
        {t.impersonation.exit}
      </Button>
    </div>
  )
}
