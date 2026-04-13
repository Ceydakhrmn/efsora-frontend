import { useEffect, useState } from 'react'
import { Users, UserCheck, Building2, UserPlus, UserX, TrendingUp, Package, AlertTriangle, DollarSign, Wrench } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { DepartmentChart } from '@/components/dashboard/DepartmentChart'
import { RegistrationTrend } from '@/components/dashboard/RegistrationTrend'
import { RecentUsers } from '@/components/dashboard/RecentUsers'
import { SecurityDashboard } from '@/components/dashboard/SecurityDashboard'
import { AssetCategoryChart } from '@/components/dashboard/AssetCategoryChart'
import { AssetStatusChart } from '@/components/dashboard/AssetStatusChart'
import { AssetValueChart } from '@/components/dashboard/AssetValueChart'
import { usersApi } from '@/api/users'
import { assetsApi, type AssetStats } from '@/api/assets'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'
import type { Asset, User } from '@/types'

type FilterType = 'monthly' | 'yearly' | 'custom'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const currentYear = new Date().getFullYear()
const YEARS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

export function DashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetStats, setAssetStats] = useState<AssetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<FilterType>('monthly')
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const { user } = useAuth()
  const { t } = useI18n()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, assetsRes, statsRes] = await Promise.all([
          usersApi.getAll(),
          assetsApi.getAll(),
          assetsApi.getStats(),
        ])
        setUsers(usersRes.data)
        setAssets(assetsRes.data)
        setAssetStats(statsRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const activeUsers = users.filter((u) => u.active)
  const inactiveUsers = users.filter((u) => !u.active)
  const departments = [...new Set(users.map((u) => u.department).filter(Boolean))]
  const activeRatio = users.length > 0 ? Math.round((activeUsers.length / users.length) * 100) : 0

  const deptCounts = users.reduce<Record<string, number>>((acc, u) => {
    if (u.department) acc[u.department] = (acc[u.department] || 0) + 1
    return acc
  }, {})
  const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0]

  const filteredUsers = users.filter((u) => {
    const regDate = new Date(u.registrationDate)
    if (filterType === 'monthly') {
      return regDate.getMonth() === selectedMonth && regDate.getFullYear() === selectedYear
    } else if (filterType === 'yearly') {
      return regDate.getFullYear() === selectedYear
    } else if (filterType === 'custom' && customStart && customEnd) {
      return regDate >= new Date(customStart) && regDate <= new Date(customEnd)
    }
    return true
  })

  const filterLabel = filterType === 'monthly'
    ? `${MONTHS[selectedMonth]} ${selectedYear}`
    : filterType === 'yearly'
    ? `${selectedYear}`
    : customStart && customEnd
    ? `${customStart} — ${customEnd}`
    : 'Custom range'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome + Filtre */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t.dashboard.welcome}, {user?.firstName}! 👋
          </h2>
          <p className="text-muted-foreground">{t.dashboard.title}</p>
        </div>

        {/* Filtre kutusu */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="bg-card text-foreground text-sm outline-none cursor-pointer rounded px-1"
          >
            <option value="monthly" style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>Monthly</option>
            <option value="yearly" style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>Yearly</option>
            <option value="custom" style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>Custom range</option>
          </select>

          <div className="w-px h-4 bg-border" />

          {filterType === 'monthly' && (
            <>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-card text-foreground text-sm outline-none cursor-pointer rounded px-1"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y} style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>{y}</option>
                ))}
              </select>
              <div className="w-px h-4 bg-border" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-card text-foreground text-sm outline-none cursor-pointer rounded px-1"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i} style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>{m}</option>
                ))}
              </select>
            </>
          )}

          {filterType === 'yearly' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-card text-foreground text-sm outline-none cursor-pointer rounded px-1"
            >
              {YEARS.map((y) => (
                <option key={y} value={y} style={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>{y}</option>
              ))}
            </select>
          )}

          {filterType === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent text-sm text-foreground outline-none cursor-pointer"
              />
              <span className="text-muted-foreground text-sm">—</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent text-sm text-foreground outline-none cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Ana Stats - 4 kart */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t.dashboard.totalUsers} value={users.length} icon={Users} color="blue" />
        <StatCard title={t.dashboard.activeUsers} value={activeUsers.length} icon={UserCheck} color="green" />
        <StatCard title={t.dashboard.departments} value={departments.length} icon={Building2} color="purple" />
        <StatCard
          title={t.dashboard.newUsers}
          value={filteredUsers.length}
          icon={UserPlus}
          description={filterLabel}
          color="orange"
        />
      </div>

      {/* Ek Stats - 3 kart */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title={t.dashboard.inactiveUsers}
          value={inactiveUsers.length}
          icon={UserX}
          color="orange"
          description={`${100 - activeRatio}% ${t.dashboard.ofTotal}`}
        />
        <StatCard
          title={t.dashboard.activeRate}
          value={activeRatio}
          icon={TrendingUp}
          color="green"
          description={`${activeRatio}% ${t.dashboard.active}`}
        />
        <StatCard
          title={t.dashboard.largestDept}
          value={topDept ? topDept[1] : 0}
          icon={Building2}
          color="blue"
          description={topDept ? topDept[0] : '-'}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DepartmentChart users={users} />
        <RegistrationTrend users={users} />
      </div>

      {/* Asset Stats */}
      {assetStats && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">📦 {t.assets.title}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title={t.assets.title} value={assetStats.total} icon={Package} color="blue" />
              <StatCard title={t.assets.statusActive} value={assetStats.active} icon={Package} color="green" />
              <StatCard title={t.assets.statusMaintenance} value={assetStats.maintenance} icon={Wrench} color="orange" />
              <StatCard
                title={t.assets.expiringAlert.split(' ')[0] === 'varlığın' ? 'Süresi Dolacak' : 'Expiring Soon'}
                value={assetStats.expiringSoon}
                icon={AlertTriangle}
                color="orange"
                description={`${assetStats.expired} ${t.assets.statusExpired.toLowerCase()}`}
              />
            </div>
          </div>
          {assetStats.totalValue > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                title="Toplam Değer"
                value={`₺${assetStats.totalValue.toLocaleString('tr-TR')}`}
                icon={DollarSign}
                color="green"
              />
              <StatCard title={t.assets.statusRetired} value={assetStats.retired} icon={Package} color="purple" />
              <StatCard
                title={t.assets.allCategories}
                value={Object.keys(assetStats.byCategory).length}
                icon={Package}
                color="blue"
              />
            </div>
          )}

          {/* Asset Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AssetCategoryChart stats={assetStats} />
            <AssetStatusChart stats={assetStats} />
          </div>

          {assets.length > 0 && (
            <div className="grid gap-6">
              <AssetValueChart assets={assets} />
            </div>
          )}
        </>
      )}

      {/* Recent Users */}
      <RecentUsers users={users} />

      {/* Security Dashboard - Admin Only */}
      {user?.role === 'ADMIN' && <SecurityDashboard />}
    </div>
  )
}