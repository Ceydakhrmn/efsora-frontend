import { useEffect, useState } from 'react'
import { Users, UserCheck, Building2, UserPlus } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { DepartmentChart } from '@/components/dashboard/DepartmentChart'
import { RegistrationTrend } from '@/components/dashboard/RegistrationTrend'
import { RecentUsers } from '@/components/dashboard/RecentUsers'
import { usersApi } from '@/api/users'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'
import type { User } from '@/types'

export function DashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { t } = useI18n()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await usersApi.getAll()
        setUsers(response.data)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const activeUsers = users.filter((u) => u.active)
  const departments = [...new Set(users.map((u) => u.department).filter(Boolean))]

  const now = new Date()
  const thisMonthUsers = users.filter((u) => {
    const regDate = new Date(u.registrationDate)
    return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear()
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {t.dashboard.welcome}, {user?.firstName}! 👋
        </h2>
        <p className="text-muted-foreground">{t.dashboard.title}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t.dashboard.totalUsers}
          value={users.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title={t.dashboard.activeUsers}
          value={activeUsers.length}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title={t.dashboard.departments}
          value={departments.length}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title={t.dashboard.newUsers}
          value={thisMonthUsers.length}
          icon={UserPlus}
          description={t.dashboard.thisMonth}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DepartmentChart users={users} />
        <RegistrationTrend users={users} />
      </div>

      {/* Recent Users */}
      <RecentUsers users={users} />
    </div>
  )
}
