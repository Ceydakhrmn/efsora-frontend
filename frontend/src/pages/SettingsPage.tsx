import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSelector } from '@/components/settings/ThemeSelector'
import { PasswordChange } from '@/components/settings/PasswordChange'
import { ProfileEdit } from '@/components/settings/ProfileEdit'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { useI18n } from '@/i18n'

export function SettingsPage() {
  const { t } = useI18n()

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.settings.theme}</CardTitle>
          <CardDescription>{t.settings.themeDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      {/* Profile Edit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.settings.editProfile}</CardTitle>
          <CardDescription>{t.settings.editProfileDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEdit />
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.settings.changePassword}</CardTitle>
          <CardDescription>{t.settings.changePasswordDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChange />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t.settings.notifications}</CardTitle>
          <CardDescription>{t.settings.notificationsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSettings />
        </CardContent>
      </Card>
    </div>
  )
}
