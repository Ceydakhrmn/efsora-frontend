import type { Asset, AssetCategory } from '@/types'

interface AssetStatsProps {
  assets: Asset[]
  categoryLabels: Record<AssetCategory, string>
}

export function AssetStats({ assets, categoryLabels }: AssetStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {Object.entries(categoryLabels).map(([cat, label]) => {
        const count = assets.filter((a) => a.category === cat).length
        return (
          <div key={cat} className="rounded-lg border bg-card p-3 text-center">
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        )
      })}
    </div>
  )
}
