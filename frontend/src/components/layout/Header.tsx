import { Menu, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useI18n } from '@/i18n'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

import { NotificationPanel } from './NotificationPanel'
import { GlobalSearch } from './GlobalSearch'

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { language, setLanguage } = useI18n()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '??'

  const segments = location.pathname.split('/').filter(Boolean)

  return (
    <header className={cn(
      "sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6"
    )}>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-muted-foreground/50 hidden sm:block">
            efsora
          </span>
          {segments.map((seg, i) => (
            <span key={seg} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-muted-foreground/30 hidden sm:block" />
              {i === segments.length - 1 ? (
                <h1 className="text-sm font-semibold text-foreground font-archivo capitalize">
                  {title}
                </h1>
              ) : (
                <span className="text-xs text-muted-foreground font-mono capitalize">{seg}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Global Search */}
        <div className="hidden sm:block">
          <GlobalSearch />
        </div>

        {/* Language Switch */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
          <button
            onClick={() => setLanguage('tr')}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer font-mono",
              language === 'tr'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            TR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer font-mono",
              language === 'en'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            EN
          </button>
        </div>

        {/* Notification Bell */}
        <NotificationPanel />

        {/* Profile Avatar */}
        <button onClick={() => navigate('/settings')} className="cursor-pointer">
          <Avatar className="h-8 w-8">
            {user?.profilePhoto && <AvatarImage src={user.profilePhoto} alt="Profile" />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  )
}