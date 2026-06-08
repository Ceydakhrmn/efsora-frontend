import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSelector } from '@/components/settings/ThemeSelector'
import { PasswordChange } from '@/components/settings/PasswordChange'
import { ProfileEdit } from '@/components/settings/ProfileEdit'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { ReminderRulesCard } from '@/components/settings/ReminderRulesCard'
import { useI18n } from '@/i18n'
import { useAuth } from '@/contexts/AuthContext'
import { MFASettings } from '@/components/settings/MFASettings'

export function SettingsPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Theme */}
      <Card className="border border-gray-300 dark:border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t.settings.theme}</CardTitle>
          <CardDescription>{t.settings.themeDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      {/* Profile Edit */}
      <Card className="border border-gray-300 dark:border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t.settings.editProfile}</CardTitle>
          <CardDescription>{t.settings.editProfileDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEdit />
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border border-gray-300 dark:border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t.settings.changePassword}</CardTitle>
          <CardDescription>{t.settings.changePasswordDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChange />
        </CardContent>
      </Card>

      {/* MFA/2FA Settings */}
      <Card className="border border-gray-300 dark:border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t.mfa.settingsTitle}</CardTitle>
          <CardDescription>{t.mfa.settingsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <MFASettings />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border border-gray-300 dark:border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t.settings.notifications}</CardTitle>
          <CardDescription>{t.settings.notificationsDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSettings />
        </CardContent>
      </Card>

      {/* Reminder Rules — Admin only */}
      {isAdmin && (
        <Card className="border border-gray-300 dark:border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t.settings.reminderRules}</CardTitle>
            <CardDescription>{t.settings.reminderRulesDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ReminderRulesCard />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
