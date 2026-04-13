import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mail, Building2, Calendar, Shield } from 'lucide-react'
import { ArrowLeft, Activity } from 'lucide-react'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { usersApi } from '@/api/users'
import { activityLogsApi, type ActivityLog } from '@/api/activityLogs'
import { useI18n } from '@/i18n'
import type { User } from '@/types'

function actionIcon(action: string) {
  switch (action) {
    case 'CREATE': return '➕'
    case 'UPDATE': return '✏️'
    case 'DELETE': case 'PERMANENT_DELETE': case 'BULK_DELETE': return '🗑️'
    case 'LOGIN': return '🔑'
    case 'LOGIN_FAILED': return '⚠️'
    case 'ACCOUNT_LOCKED': return '🔒'
    case 'IMPERSONATE': return '👤'
    default: return '📋'
  }
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const navigate = useNavigate()
  const { t } = useI18n()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await usersApi.getById(Number(id))
        setUser(response.data)
        // Kullanıcının aktivitelerini getir
        try {
          const logsRes = await activityLogsApi.getByUser(response.data.email)
          setActivities(logsRes.data)
        } catch {
          // aktivite yoksa sorun değil
        }
      } catch {
        navigate('/users')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchUser()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-foreground">{t.users.detail}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-8 pb-6">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{user.department}</p>
            <Badge variant={user.active ? 'success' : 'secondary'} className="mt-3">
              {user.active ? t.common.active : t.common.inactive}
            </Badge>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t.users.userInfo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-400 dark:bg-blue-900 dark:text-blue-200">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.auth.email}</p>
                  <p className="text-sm font-medium text-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.auth.department}</p>
                  <p className="text-sm font-medium text-foreground">{user.department}</p>
                </div>
              </div>


              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.users.registrationDate}</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(user.registrationDate).toLocaleDateString('tr-TR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Last Login Card */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                  <Clock className="h-5 w-5" /> 
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <p className="text-sm font-medium text-foreground">
                    {user.lastLoginDate
                      ? new Date(user.lastLoginDate).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : 'Never logged in'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.common.status}</p>
                  <p className="text-sm font-medium text-foreground">
                    {user.active ? t.common.active : t.common.inactive}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button onClick={() => navigate('/users')} variant="outline">
                {t.common.back}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aktivite Geçmişi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t.activityLog?.title || 'Aktivite Geçmişi'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Henüz aktivite kaydı yok
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {activities.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {actionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {t.activityLog?.actions?.[log.action as keyof typeof t.activityLog.actions] || log.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {log.entityType}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {log.details}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString('tr-TR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
