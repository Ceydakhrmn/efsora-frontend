import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { AssetStats } from '@/api/assets'
import { useI18n } from '@/i18n'

const STATUS_ORDER = ['active', 'maintenance', 'expired', 'retired'] as const

const STATUS_CONFIG: Record<(typeof STATUS_ORDER)[number], { color: string }> = {
  active: { color: '#10b981' },
  maintenance: { color: '#f59e0b' },
  expired: { color: '#ef4444' },
  retired: { color: '#6b7280' },
}

interface ChartTooltipPoint {
  key: string
  name: string
  value: number
  percent: number
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartTooltipPoint }>
}

interface CustomTooltipLocalizer {
  assetsUnit: string
}

const CustomTooltip = ({ active, payload, assetsUnit }: ChartTooltipProps & CustomTooltipLocalizer) => {
  if (active && payload && payload.length) {
    const { name, value, percent } = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{value}</span> {assetsUnit}
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
  showSampleWhenEmpty?: boolean
}

export function AssetStatusChart({ stats, showSampleWhenEmpty = true }: AssetStatusChartProps) {
  const { t } = useI18n()

  const statusLabels: Record<(typeof STATUS_ORDER)[number], string> = {
    active: t.assets.statusActive,
    maintenance: t.assets.statusMaintenance,
    expired: t.assets.statusExpired,
    retired: t.assets.statusRetired,
  }

  const data = STATUS_ORDER
    .map((key) => ({
      key,
      name: statusLabels[key],
      value: (stats[key as keyof AssetStats] as number) ?? 0,
      color: STATUS_CONFIG[key].color,
      percent: stats.total > 0 ? ((stats[key as keyof AssetStats] as number) ?? 0) / stats.total : 0,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const sampleData = [
    { key: 'active', name: statusLabels.active, value: 8, color: STATUS_CONFIG.active.color },
    { key: 'maintenance', name: statusLabels.maintenance, value: 3, color: STATUS_CONFIG.maintenance.color },
    { key: 'expired', name: statusLabels.expired, value: 2, color: STATUS_CONFIG.expired.color },
    { key: 'retired', name: statusLabels.retired, value: 1, color: STATUS_CONFIG.retired.color },
  ]

  const chartData = data.length > 0
    ? data
    : showSampleWhenEmpty
    ? sampleData.map((item) => ({
        ...item,
        percent: item.value / sampleData.reduce((acc, current) => acc + current.value, 0),
      }))
    : []

  if (chartData.length === 0) {
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
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.key || index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip assetsUnit={t.common.assetsUnit} />} />
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
