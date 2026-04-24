import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { AssetStats } from '@/api/assets'
import { useI18n } from '@/contexts/I18nProvider'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktif', color: '#10b981' },
  maintenance: { label: 'Bakımda', color: '#f59e0b' },
  expired: { label: 'Süresi Doldu', color: '#ef4444' },
  retired: { label: 'Hurdaya Çıktı', color: '#6b7280' },
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value, percent } = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{value}</span> varlık
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{(percent * 100).toFixed(0)}%</span>
        </p>
      </div>
    )
  }
  return null
}

interface AssetStatusChartProps {
  stats: AssetStats
}

export function AssetStatusChart({ stats }: AssetStatusChartProps) {
  const t = useI18n()
  const data = Object.entries(STATUS_CONFIG)
    .map(([key, config]) => ({
      name: config.label,
      value: stats[key as keyof AssetStats] as number,
      color: config.color,
      percent: stats.total > 0 ? (stats[key as keyof AssetStats] as number) / stats.total : 0,
    }))
    .filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.reports.statusBreakdown}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">{t.reports.noData}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.reports.statusBreakdown}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
