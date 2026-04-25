import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useI18n } from '@/i18n'
import type { User } from '@/types'

interface RegistrationTrendProps {
  users: User[]
}

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useI18n()
  if (active && payload && payload.length) {
    const { label, count, change } = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{count}</span> {t.reports.registrations}
        </p>
        {change !== null && (
          <p className={`text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change)} {t.reports.vsPrevMonth}
          </p>
        )}
      </div>
    )
  }
  return null
}

export function RegistrationTrend({ users }: RegistrationTrendProps) {
  const { t, language } = useI18n()

  const now = new Date()
  const months: { label: string; count: number; change: number | null }[] = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthIndex = date.getMonth()
    const shortYear = String(date.getFullYear()).slice(-2)
    const monthLabel = language === 'tr'
      ? `${t.dashboard.months[monthIndex]} '${shortYear}`
      : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const count = users.filter((u) => {
      const regDate = new Date(u.registrationDate)
      return regDate.getMonth() === date.getMonth() && regDate.getFullYear() === date.getFullYear()
    }).length
    months.push({ label: monthLabel, count, change: null })
  }

  // Önceki aya göre değişim hesapla
  const dataWithChange = months.map((m, i) => ({
    ...m,
    change: i === 0 ? null : m.count - months[i - 1].count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.dashboard.registrationTrend}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataWithChange} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}