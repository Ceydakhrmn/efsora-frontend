import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useI18n } from '@/i18n'
import type { User } from '@/types'

interface RecentUsersProps {
  users: User[]
}

export function RecentUsers({ users }: RecentUsersProps) {
  const { t } = useI18n()
  const navigate = useNavigate()

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.dashboard.recentUsers}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
              onClick={() => navigate(`/users/${user.id}`)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {user.department}
                </span>
                <Badge variant={user.active ? 'success' : 'secondary'}>
                  {user.active ? t.common.active : t.common.inactive}
                </Badge>
              </div>
            </div>
          ))}
          {recentUsers.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">{t.common.noData}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
