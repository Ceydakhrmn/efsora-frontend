import { useEffect, useState } from 'react'
import { Download, Building2, Users, Package, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { reportsApi, type DepartmentSummary, type AssetOverview, type UserOverview } from '@/api/reports'
import { useI18n } from '@/i18n'
import { notify } from '@/lib/notify'
import { exportToExcel } from '@/lib/exportExcel'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

export function ReportsPage() {
  const { t } = useI18n()
  const [deptSummary, setDeptSummary] = useState<DepartmentSummary[]>([])
  const [assetOverview, setAssetOverview] = useState<AssetOverview | null>(null)
  const [userOverview, setUserOverview] = useState<UserOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState<string>('all')

  useEffect(() => {
    async function fetchData() {
      try {
        const [deptRes, assetRes, userRes] = await Promise.all([
          reportsApi.getDepartmentSummary(),
          reportsApi.getAssetOverview(),
          reportsApi.getUserOverview(),
        ])
        setDeptSummary(deptRes.data)
        setAssetOverview(assetRes.data)
        setUserOverview(userRes.data)
      } catch {
        notify.error(t.common.error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleExport = () => {
    const rows = deptSummary.map((d) => ({
      [t.reports.department]: d.department,
      [t.reports.totalUsers]: d.totalUsers,
      [t.reports.activeUsers]: d.activeUsers,
      [t.reports.totalAssets]: d.totalAssets,
      [t.reports.activeAssets]: d.activeAssets,
      [t.reports.maintenanceAssets]: d.maintenanceAssets,
      [t.reports.expiredAssets]: d.expiredAssets,
      [t.reports.totalValue + ' (₺)']: d.totalValue,
    }))
    exportToExcel(rows, 'departman-raporu', t.reports.departmentReport)
    notify.success(t.reports.exported)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const filteredDept = selectedDept === 'all'
    ? deptSummary
    : deptSummary.filter((d) => d.department === selectedDept)

  const categoryData = assetOverview
    ? Object.entries(assetOverview.byCategory).map(([name, value]) => ({ name, value }))
    : []

  const statusData = assetOverview
    ? Object.entries(assetOverview.byStatus).map(([name, value]) => ({ name, value }))
    : []

  const deptChartData = deptSummary.map((d) => ({
    name: d.department,
    users: d.totalUsers,
    assets: d.totalAssets,
  }))

  const roleData = userOverview
    ? Object.entries(userOverview.byRole).map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.reports.title}</h1>
          <p className="text-sm text-muted-foreground">{t.reports.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.reports.allDepartments} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.reports.allDepartments}</SelectItem>
              {deptSummary.filter((d) => d.department).map((d) => (
                <SelectItem key={d.department} value={d.department}>{d.department}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            {t.reports.export}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs">{t.reports.totalUsers}</span>
          </div>
          <p className="text-2xl font-bold">{userOverview?.total || 0}</p>
          <p className="text-xs text-muted-foreground">
            {userOverview?.active || 0} {t.reports.active} / {userOverview?.inactive || 0} {t.reports.inactive}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Package className="h-4 w-4" />
            <span className="text-xs">{t.reports.totalAssets}</span>
          </div>
          <p className="text-2xl font-bold">{assetOverview?.total || 0}</p>
          <p className="text-xs text-muted-foreground">
            {assetOverview?.assigned || 0} {t.reports.assigned} / {assetOverview?.unassigned || 0} {t.reports.unassigned}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">{t.reports.totalValue}</span>
          </div>
          <p className="text-2xl font-bold">
            {(assetOverview?.totalValue || 0).toLocaleString('tr-TR')} ₺
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            <span className="text-xs">{t.reports.departments}</span>
          </div>
          <p className="text-2xl font-bold">{deptSummary.length}</p>
          <p className="text-xs text-muted-foreground">
            {assetOverview?.expiringSoon || 0} {t.reports.expiringSoon}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Bar Chart */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">{t.reports.deptComparison}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
              <YAxis className="text-xs" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#6366f1" name={t.reports.users} radius={[4, 4, 0, 0]} />
              <Bar dataKey="assets" fill="#22c55e" name={t.reports.assets} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">{t.reports.categoryBreakdown}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">{t.reports.statusBreakdown}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-4">{t.reports.roleDistribution}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {roleData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Detail Table */}
      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">{t.reports.departmentReport}</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">{t.reports.department}</th>
              <th className="px-4 py-3 text-center font-medium">{t.reports.users}</th>
              <th className="px-4 py-3 text-center font-medium">{t.reports.assets}</th>
              <th className="px-4 py-3 text-center font-medium hidden md:table-cell">{t.reports.activeAssets}</th>
              <th className="px-4 py-3 text-center font-medium hidden md:table-cell">{t.reports.maintenanceAssets}</th>
              <th className="px-4 py-3 text-center font-medium hidden lg:table-cell">{t.reports.expiredAssets}</th>
              <th className="px-4 py-3 text-right font-medium">{t.reports.totalValue}</th>
            </tr>
          </thead>
          <tbody>
            {filteredDept.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  {t.common.noData}
                </td>
              </tr>
            ) : (
              filteredDept.map((dept) => (
                <tr key={dept.department} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{dept.department}</td>
                  <td className="px-4 py-3 text-center">{dept.totalUsers}</td>
                  <td className="px-4 py-3 text-center">{dept.totalAssets}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">{dept.activeAssets}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">{dept.maintenanceAssets}</td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">{dept.expiredAssets}</td>
                  <td className="px-4 py-3 text-right">{dept.totalValue.toLocaleString('tr-TR')} ₺</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
