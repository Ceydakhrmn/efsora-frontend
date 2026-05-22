import { RefreshCw, ShieldCheck, Clock, Users } from 'lucide-react'
import { useI18n } from '@/i18n'

interface RuleRowProps {
  icon: React.ElementType
  title: string
  description: string
}

function RuleRow({ icon: Icon, title, description }: RuleRowProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="mt-0.5 rounded-md bg-primary/10 p-1.5">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 text-xs font-medium">
            Aktif
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}

export function ReminderRulesCard() {
  const { t } = useI18n()

  return (
    <div className="space-y-1">
      <RuleRow
        icon={RefreshCw}
        title={t.settings.reminderRenewal}
        description={t.settings.reminderRenewalDesc}
      />
      <RuleRow
        icon={ShieldCheck}
        title={t.settings.reminderWarranty}
        description={t.settings.reminderWarrantyDesc}
      />
      <div className="pt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{t.settings.reminderSchedule}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{t.settings.reminderAdminOnly}</span>
        </div>
      </div>
    </div>
  )
}
