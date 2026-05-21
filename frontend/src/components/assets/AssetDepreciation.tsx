import { useEffect, useState } from 'react'
import { TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { assetsApi } from '@/api/assets'
import { useI18n } from '@/i18n'
import type { DepreciationInfo } from '@/types'

interface AssetDepreciationProps {
  assetId: number
}

function fmt(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function AssetDepreciation({ assetId }: AssetDepreciationProps) {
  const { t } = useI18n()
  const [data, setData] = useState<DepreciationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [noPurchaseData, setNoPurchaseData] = useState(false)

  useEffect(() => {
    setLoading(true)
    assetsApi.getDepreciation(assetId)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err?.response?.status === 204) setNoPurchaseData(true)
      })
      .finally(() => setLoading(false))
  }, [assetId])

  if (loading) return <p className="text-sm text-muted-foreground py-4">{t.common.loading}</p>

  if (noPurchaseData || !data) {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 mt-2">
        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">{t.assets.noPurchaseData}</p>
      </div>
    )
  }

  const barColor = data.depreciationPercent >= 90
    ? 'bg-red-500'
    : data.depreciationPercent >= 60
    ? 'bg-orange-400'
    : 'bg-blue-500'

  return (
    <div className="space-y-4 pt-2">
      {data.fullyDepreciated && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{t.assets.fullyDepreciated}</p>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t.assets.depreciationPercent}</span>
          <span>{data.depreciationPercent.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(100, data.depreciationPercent)}%` }}
          />
        </div>
      </div>

      {/* Value grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border p-3 space-y-1">
          <p className="text-xs text-muted-foreground">{t.assets.currentValue}</p>
          <p className="text-base font-semibold text-green-600 dark:text-green-400">
            ₺{fmt(data.currentValue)}
          </p>
        </div>
        <div className="rounded-lg border p-3 space-y-1">
          <p className="text-xs text-muted-foreground">{t.assets.totalDepreciation}</p>
          <p className="text-base font-semibold text-red-600 dark:text-red-400">
            ₺{fmt(data.totalDepreciation)}
          </p>
        </div>
        <div className="rounded-lg border p-3 space-y-1">
          <p className="text-xs text-muted-foreground">{t.assets.annualDepreciation}</p>
          <p className="text-base font-semibold">₺{fmt(data.annualDepreciation)}</p>
        </div>
        <div className="rounded-lg border p-3 space-y-1">
          <p className="text-xs text-muted-foreground">{t.assets.yearsElapsed}</p>
          <p className="text-base font-semibold">
            {data.yearsElapsed.toFixed(1)} / {data.usefulLifeYears} {t.assets.yearsLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{t.assets.usefulLife}: {data.usefulLifeYears} {t.assets.yearsLabel} · {t.assets.totalPurchaseValue ? '' : ''} ₺{fmt(data.purchasePrice)}</span>
      </div>
    </div>
  )
}
