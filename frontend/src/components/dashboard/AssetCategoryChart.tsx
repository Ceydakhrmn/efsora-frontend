import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { AssetStats } from '@/api/assets'
import { useI18n } from '@/i18n'

const CATEGORY_LABELS: Record<string, string> = {
  HARDWARE: 'Donanım',
  SOFTWARE_LICENSE: 'Yazılım Lisansı',
  API_SUBSCRIPTION: 'API Aboneliği',
  SAAS_TOOL: 'SaaS Araç',
  OFFICE_EQUIPMENT: 'Ofis Ekipmanı',
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981']

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

interface AssetCategoryChartProps {
  stats: AssetStats
  showSampleWhenEmpty?: boolean
}

export function AssetCategoryChart({ stats, showSampleWhenEmpty = true }: AssetCategoryChartProps) {
  const { t } = useI18n()
  const data = Object.entries(stats.byCategory).map(([key, value]) => ({
    name: CATEGORY_LABELS[key] || key,
    value,
    percent: stats.total > 0 ? value / stats.total : 0,
  })).sort((a, b) => b.value - a.value)

  const sampleData = [
    { name: CATEGORY_LABELS.HARDWARE, value: 9 },
    { name: CATEGORY_LABELS.SOFTWARE_LICENSE, value: 6 },
    { name: CATEGORY_LABELS.API_SUBSCRIPTION, value: 4 },
    { name: CATEGORY_LABELS.SAAS_TOOL, value: 3 },
    { name: CATEGORY_LABELS.OFFICE_EQUIPMENT, value: 2 },
  ]

  const chartData = data.length > 0
    ? data
    : showSampleWhenEmpty
    ? sampleData.map((item) => ({
        ...item,
        percent: item.value / sampleData.reduce((acc, current) => acc + current.value, 0),
      }))
    : []

  const isSample = data.length === 0 && showSampleWhenEmpty

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.reports.categoryBreakdown}</CardTitle>
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
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{t.reports.categoryBreakdown}</CardTitle>
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
                {chartData.map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
