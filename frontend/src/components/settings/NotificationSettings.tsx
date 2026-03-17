import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/i18n'
import { toast } from 'sonner'

interface NotificationPrefs {
  emailNotifications: boolean
  pushNotifications: boolean
  loginAlerts: boolean
}

const defaultPrefs: NotificationPrefs = {
  emailNotifications: true,
  pushNotifications: false,
  loginAlerts: true,
}

export function NotificationSettings() {
  const { t } = useI18n()
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => {
    const saved = localStorage.getItem('notificationPrefs')
    return saved ? JSON.parse(saved) : defaultPrefs
  })

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    const newPrefs = { ...prefs, [key]: value }
    setPrefs(newPrefs)
    localStorage.setItem('notificationPrefs', JSON.stringify(newPrefs))
    toast.success(t.settings.notificationsSaved)
  }

  const items = [
    { key: 'emailNotifications' as const, label: t.settings.emailNotifications, desc: t.settings.emailNotificationsDesc },
    { key: 'pushNotifications' as const, label: t.settings.pushNotifications, desc: t.settings.pushNotificationsDesc },
    { key: 'loginAlerts' as const, label: t.settings.loginAlerts, desc: t.settings.loginAlertsDesc },
  ]

  return (
    <div className="space-y-6">
      {items.map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">{label}</Label>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
          <Switch checked={prefs[key]} onCheckedChange={(checked) => updatePref(key, checked)} />
        </div>
      ))}
    </div>
  )
}
