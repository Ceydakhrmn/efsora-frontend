import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { AssetStats } from '@/api/assets'
import { useI18n } from '@/i18n'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktif', color: '#10b981' },
  maintenance: { label: 'Bakımda', color: '#f59e0b' },
  expired: { label: 'Süresi Doldu', color: '#ef4444' },
  retired: { label: 'Hurdaya Çıktı', color: '#6b7280' },
}

interface ChartTooltipPoint {
  name: string
  value: number
  percent: number
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartTooltipPoint }>
}

const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
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
  const { t } = useI18n()
  const data = Object.entries(STATUS_CONFIG)
    .map(([key, config]) => ({
      name: config.label,
      value: stats[key as keyof AssetStats] as number,
      color: config.color,
      percent: stats.total > 0 ? (stats[key as keyof AssetStats] as number) / stats.total : 0,
    }))
    .filter((d) => d.value > 0)

  const sampleData = [
    { name: STATUS_CONFIG.active.label, value: 8, color: STATUS_CONFIG.active.color },
    { name: STATUS_CONFIG.maintenance.label, value: 3, color: STATUS_CONFIG.maintenance.color },
    { name: STATUS_CONFIG.expired.label, value: 2, color: STATUS_CONFIG.expired.color },
    { name: STATUS_CONFIG.retired.label, value: 1, color: STATUS_CONFIG.retired.color },
  ]

  const chartData = data.length > 0
    ? data
    : sampleData.map((item) => ({
        ...item,
        percent: item.value / sampleData.reduce((acc, current) => acc + current.value, 0),
      }))

  const isSample = data.length === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{t.reports.statusBreakdown}</CardTitle>
          {isSample && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              {t.common.sampleData}
            </span>
          )}
        </div>
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
