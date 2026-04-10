import { useEffect, useState } from 'react'
import { Shield, ShieldAlert, ShieldCheck, ShieldX, Globe, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { activityLogsApi, type SecurityStats, type ActivityLog } from '@/api/activityLogs'
import { useI18n } from '@/i18n'

export function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  useEffect(() => {
    activityLogsApi.getSecurityStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!stats) return null

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Shield className="h-5 w-5" />
        {t.security.title}
      </h3>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-2">
              <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.successLogins24h}</p>
              <p className="text-xs text-muted-foreground">{t.security.successLogins}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-2">
              <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.failedLogins24h}</p>
              <p className="text-xs text-muted-foreground">{t.security.failedLogins}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-2">
              <ShieldX className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.accountLocks24h}</p>
              <p className="text-xs text-muted-foreground">{t.security.accountLocks}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2">
              <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.suspiciousIps.length}</p>
              <p className="text-xs text-muted-foreground">{t.security.suspiciousIps}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious IPs */}
      {stats.suspiciousIps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t.security.suspiciousIpList}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.suspiciousIps.map((ip) => (
              <Badge key={ip} variant="destructive" className="font-mono text-xs">{ip}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Security Events */}
      {stats.recentSecurityEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t.security.recentEvents}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {stats.recentSecurityEvents.slice(0, 20).map((event: ActivityLog) => (
              <div key={event.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      event.action === 'ACCOUNT_LOCKED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      event.action === 'LOGIN_BLOCKED' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }
                  >
                    {event.action.replace('_', ' ')}
                  </Badge>
                  <span className="text-muted-foreground truncate max-w-[200px]">{event.details}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                  {event.ipAddress && <span className="font-mono">{event.ipAddress}</span>}
                  <span>{formatDate(event.createdAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
