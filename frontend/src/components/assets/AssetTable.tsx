import { QrCode, ArrowRightLeft, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { Asset, AssetCategory, AssetStatus } from '@/types'
import { useI18n } from '@/i18n'

interface AssetTableProps {
  assets: Asset[]
  selectedIds: number[]
  canEdit: boolean
  canDelete: boolean
  categoryLabels: Record<AssetCategory, string>
  statusConfig: Record<AssetStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }>
  onToggleSelect: (id: number) => void
  onToggleSelectAll: () => void
  onQr: (asset: Asset) => void
  onTransfer: (asset: Asset) => void
  onReturn: (asset: Asset) => void
  onEdit: (asset: Asset) => void
  onDelete: (id: number) => void
  onTagFilter: (tag: string) => void
}

export function AssetTable({
  assets, selectedIds, canEdit, canDelete,
  categoryLabels, statusConfig,
  onToggleSelect, onToggleSelectAll, onQr, onTransfer, onReturn, onEdit, onDelete, onTagFilter,
}: AssetTableProps) {
  const { t } = useI18n()
  return (
    <div className="hidden sm:block rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 w-10">
              <Checkbox
                checked={assets.length > 0 && selectedIds.length === assets.length}
                onCheckedChange={onToggleSelectAll}
              />
            </th>
            <th className="px-4 py-3 text-left font-medium">{t.assets.name}</th>
            <th className="px-4 py-3 text-left font-medium">{t.assets.category}</th>
            <th className="px-4 py-3 text-left font-medium hidden md:table-cell">{t.assets.brandModel}</th>
            <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">{t.assets.assignedTo}</th>
            <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">{t.assets.renewalDate}</th>
            <th className="px-4 py-3 text-left font-medium">{t.common.status}</th>
            <th className="px-4 py-3 text-right font-medium">{t.common.actions}</th>
          </tr>
        </thead>
        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                {t.assets.noAssets}
              </td>
            </tr>
          ) : (
            assets.map((asset) => (
              <tr key={asset.id} className={`border-b hover:bg-muted/30 transition-colors ${selectedIds.includes(asset.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedIds.includes(asset.id)}
                    onCheckedChange={() => onToggleSelect(asset.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{asset.name}</div>
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {asset.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium cursor-pointer hover:bg-primary/20"
                          onClick={() => onTagFilter(tag)}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">{categoryLabels[asset.category]}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {[asset.brand, asset.model].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                  {asset.assignedUserName || asset.assignedDepartment || '—'}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                  {asset.renewalDate ? new Date(asset.renewalDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusConfig[asset.status].variant}>
                    {statusConfig[asset.status].label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onQr(asset)} title={t.assets.showQr}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => onTransfer(asset)} title={t.assets.transferTitle}>
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                        {asset.assignedUserId && (
                          <Button size="sm" variant="ghost" onClick={() => onReturn(asset)} title={t.assets.returned}>
                            <Undo2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => onEdit(asset)}>
                          {t.common.edit}
                        </Button>
                      </>
                    )}
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(asset.id)}
                      >
                        {t.common.delete}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
