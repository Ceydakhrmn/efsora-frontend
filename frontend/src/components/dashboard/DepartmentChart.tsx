import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useI18n } from '@/i18n'
import type { User } from '@/types'

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981']

interface DepartmentChartProps {
  users: User[]
}

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useI18n()
  if (active && payload && payload.length) {
    const { name, value, percentage } = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{value}</span> {t.reports.users}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{percentage}%</span> {t.dashboard.ofTotal}
        </p>
      </div>
    )
  }
  return null
}

export function DepartmentChart({ users }: DepartmentChartProps) {
  const { t } = useI18n()

  const deptData = users.reduce<Record<string, number>>((acc, user) => {
    const dept = user.department || 'N/A'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  const data = Object.entries(deptData)
    .map(([name, value]) => ({
      name,
      value,
      percentage: users.length > 0 ? Math.round((value / users.length) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.dashboard.usersByDepartment}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
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