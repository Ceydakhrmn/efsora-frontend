import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { AssetStats } from '@/api/assets'
import { useI18n } from '@/i18n'

const CATEGORY_ORDER = ['HARDWARE', 'SOFTWARE_LICENSE', 'API_SUBSCRIPTION', 'SAAS_TOOL', 'OFFICE_EQUIPMENT'] as const

const CATEGORY_COLORS: Record<(typeof CATEGORY_ORDER)[number], string> = {
  HARDWARE: '#3b82f6',
  SOFTWARE_LICENSE: '#8b5cf6',
  API_SUBSCRIPTION: '#06b6d4',
  SAAS_TOOL: '#f59e0b',
  OFFICE_EQUIPMENT: '#ef4444',
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

interface AssetCategoryChartProps {
  stats: AssetStats
  showSampleWhenEmpty?: boolean
}

export function AssetCategoryChart({ stats, showSampleWhenEmpty = true }: AssetCategoryChartProps) {
  const { t } = useI18n()

  const categoryLabels: Record<string, string> = {
    HARDWARE: t.assets.categoryHardware,
    SOFTWARE_LICENSE: t.assets.categorySoftware,
    API_SUBSCRIPTION: t.assets.categoryApi,
    SAAS_TOOL: t.assets.categorySaas,
    OFFICE_EQUIPMENT: t.assets.categoryOffice,
  }

  const data = CATEGORY_ORDER
    .map((key) => ({
      key,
      name: categoryLabels[key] || key,
      value: stats.byCategory[key] ?? 0,
      percent: stats.total > 0 ? (stats.byCategory[key] ?? 0) / stats.total : 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)

  const sampleData = [
    { key: 'HARDWARE', name: categoryLabels.HARDWARE, value: 9 },
    { key: 'SOFTWARE_LICENSE', name: categoryLabels.SOFTWARE_LICENSE, value: 6 },
    { key: 'API_SUBSCRIPTION', name: categoryLabels.API_SUBSCRIPTION, value: 4 },
    { key: 'SAAS_TOOL', name: categoryLabels.SAAS_TOOL, value: 3 },
    { key: 'OFFICE_EQUIPMENT', name: categoryLabels.OFFICE_EQUIPMENT, value: 2 },
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
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.key || index}
                    fill={CATEGORY_COLORS[entry.key as keyof typeof CATEGORY_COLORS] ?? '#10b981'}
                  />
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
