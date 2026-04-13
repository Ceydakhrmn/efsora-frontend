import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Asset } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  HARDWARE: 'Donanım',
  SOFTWARE_LICENSE: 'Yazılım Lisansı',
  API_SUBSCRIPTION: 'API Aboneliği',
  SAAS_TOOL: 'SaaS Araç',
  OFFICE_EQUIPMENT: 'Ofis Ekipmanı',
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">₺{value.toLocaleString('tr-TR')}</span>
        </p>
      </div>
    )
  }
  return null
}

interface AssetValueChartProps {
  assets: Asset[]
}

export function AssetValueChart({ assets }: AssetValueChartProps) {
  const categoryValues = assets.reduce<Record<string, number>>((acc, asset) => {
    if (asset.purchasePrice) {
      const cat = asset.category
      acc[cat] = (acc[cat] || 0) + asset.purchasePrice
    }
    return acc
  }, {})

  const data = Object.entries(categoryValues)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key] || key,
      value: Math.round(value),
    }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Kategori Bazlı Değer (₺)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">Değer verisi yok</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Kategori Bazlı Değer (₺)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
