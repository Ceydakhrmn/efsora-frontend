import { useEffect, useState } from 'react'
import { UserPlus, UserMinus, ArrowRightLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { assetsApi, type AssetAssignmentHistory as HistoryItem } from '@/api/assets'
import { useI18n } from '@/i18n'

interface AssetAssignmentHistoryProps {
  assetId: number
}

export function AssetAssignmentHistory({ assetId }: AssetAssignmentHistoryProps) {
  const { t } = useI18n()
  const [history, setHistory] = useState<HistoryItem[]>([])

  const actionConfig: Record<string, { label: string; icon: typeof UserPlus; variant: 'default' | 'secondary' | 'destructive' }> = {
    ASSIGNED: { label: t.assets.assignedAction, icon: UserPlus, variant: 'default' },
    UNASSIGNED: { label: t.assets.unassignedAction, icon: UserMinus, variant: 'destructive' },
    REASSIGNED: { label: t.assets.reassignedAction, icon: ArrowRightLeft, variant: 'secondary' },
  }

  useEffect(() => {
    assetsApi.getAssignmentHistory(assetId)
      .then((res) => setHistory(res.data))
      .catch(() => {})
  }, [assetId])

  if (history.length === 0) {
    return (
      <div className="border-t pt-4 space-y-2">
        <h4 className="text-sm font-medium">{t.assets.assignmentHistory}</h4>
        <p className="text-xs text-muted-foreground">{t.assets.noHistory}</p>
      </div>
    )
  }

  return (
    <div className="border-t pt-4 space-y-3">
      <h4 className="text-sm font-medium">{t.assets.assignmentHistory}</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {history.map((h) => {
          const config = actionConfig[h.action] || actionConfig.ASSIGNED
          const Icon = config.icon
          return (
            <div key={h.id} className="flex items-start gap-2 rounded-md border px-3 py-2 text-sm">
              <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
                  {h.action === 'ASSIGNED' && h.toUserName && (
                    <span className="text-foreground">{h.toUserName}</span>
                  )}
                  {h.action === 'UNASSIGNED' && h.fromUserName && (
                    <span className="text-foreground">{h.fromUserName}</span>
                  )}
                  {h.action === 'REASSIGNED' && (
                    <span className="text-foreground">
                      {h.fromUserName || '—'} → {h.toUserName || '—'}
                    </span>
                  )}
                </div>
                {(h.fromDepartment || h.toDepartment) && h.fromDepartment !== h.toDepartment && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t.assets.department}: {h.fromDepartment || '—'} → {h.toDepartment || '—'}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {h.performedBy} · {new Date(h.createdAt).toLocaleDateString(undefined, {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
