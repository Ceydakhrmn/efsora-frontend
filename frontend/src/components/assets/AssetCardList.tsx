import { QrCode, ArrowRightLeft, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { Asset, AssetCategory, AssetStatus } from '@/types'
import { useI18n } from '@/i18n'

interface AssetCardListProps {
  assets: Asset[]
  selectedIds: number[]
  canEdit: boolean
  canDelete: boolean
  categoryLabels: Record<AssetCategory, string>
  statusConfig: Record<AssetStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }>
  onToggleSelect: (id: number) => void
  onQr: (asset: Asset) => void
  onTransfer: (asset: Asset) => void
  onReturn: (asset: Asset) => void
  onEdit: (asset: Asset) => void
  onDelete: (id: number) => void
  onTagFilter: (tag: string) => void
}

export function AssetCardList({
  assets, selectedIds, canEdit, canDelete,
  categoryLabels, statusConfig,
  onToggleSelect, onQr, onTransfer, onReturn, onEdit, onDelete, onTagFilter,
}: AssetCardListProps) {
  const { t } = useI18n()
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border px-4 py-12 text-center text-muted-foreground">
        {t.assets.noAssets}
      </div>
    )
  }

  return (
    <div className="sm:hidden space-y-3">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className={`rounded-lg border bg-card p-4 space-y-3 ${selectedIds.includes(asset.id) ? 'ring-2 ring-primary/40' : ''}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Checkbox
                checked={selectedIds.includes(asset.id)}
                onCheckedChange={() => onToggleSelect(asset.id)}
                className="flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{asset.name}</p>
                <p className="text-xs text-muted-foreground">{categoryLabels[asset.category]}</p>
              </div>
            </div>
            <Badge variant={statusConfig[asset.status].variant} className="flex-shrink-0">
              {statusConfig[asset.status].label}
            </Badge>
          </div>

          {(asset.brand || asset.model) && (
            <p className="text-xs text-muted-foreground">
              {[asset.brand, asset.model].filter(Boolean).join(' ')}
            </p>
          )}

          {(asset.assignedUserName || asset.assignedDepartment) && (
            <p className="text-xs text-muted-foreground">
              {t.assets.assignedTo}: {asset.assignedUserName || asset.assignedDepartment}
            </p>
          )}

          {asset.renewalDate && (
            <p className="text-xs text-muted-foreground">
              {t.assets.renewalDate}: {new Date(asset.renewalDate).toLocaleDateString()}
            </p>
          )}

          {asset.tags && asset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {asset.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                  onClick={() => onTagFilter(tag)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => onQr(asset)}>
              <QrCode className="h-4 w-4" />
            </Button>
            {canEdit && (
              <>
                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => onTransfer(asset)}>
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
                {asset.assignedUserId && (
                  <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => onReturn(asset)}>
                    <Undo2 className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-8 px-2 ml-auto" onClick={() => onEdit(asset)}>
                  {t.common.edit}
                </Button>
              </>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                className={`h-8 px-2 text-destructive hover:text-destructive ${canEdit ? '' : 'ml-auto'}`}
                onClick={() => onDelete(asset.id)}
              >
                {t.common.delete}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
