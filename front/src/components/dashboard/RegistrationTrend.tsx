import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useI18n } from '@/i18n'
import type { User } from '@/types'

interface RegistrationTrendProps {
  users: User[]
}

export function RegistrationTrend({ users }: RegistrationTrendProps) {
  const { t } = useI18n()

  // Group by month (last 6 months)
  const now = new Date()
  const months: { label: string; count: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthLabel = date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })
    const count = users.filter((u) => {
      const regDate = new Date(u.registrationDate)
      return regDate.getMonth() === date.getMonth() && regDate.getFullYear() === date.getFullYear()
    }).length
    months.push({ label: monthLabel, count })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.dashboard.registrationTrend}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={months} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
