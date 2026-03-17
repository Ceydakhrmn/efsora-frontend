import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  const options = [
    { value: 'light' as const, label: t.settings.themeLight, icon: Sun },
    { value: 'dark' as const, label: t.settings.themeDark, icon: Moon },
    { value: 'system' as const, label: t.settings.themeSystem, icon: Monitor },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer",
            theme === value
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <Icon className={cn("h-6 w-6", theme === value ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-sm font-medium", theme === value ? "text-primary" : "text-muted-foreground")}>
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
