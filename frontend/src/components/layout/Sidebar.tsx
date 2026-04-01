import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, LogOut, Menu, X, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { path: '/users', icon: Users, labelKey: 'users' as const },
  { path: '/settings', icon: Settings, labelKey: 'settings' as const },
]

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  let initials = '?';
  if (user) {
    if (user.firstName && user.lastName) {
      initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user.email) {
      const [name] = user.email.split('@');
      initials = name.slice(0, 2).toUpperCase();
    }
  }

  const sidebarContent = (
    <div className="flex h-screen flex-col">

      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-sidebar-border px-4 gap-3",
        collapsed ? "justify-center px-2" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/efsora-logo.jpg"
              alt="Efsora"
              className="h-8 w-8 rounded-lg object-cover shrink-0 shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
              E
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-wide text-foreground font-archivo truncate">
                EFSORA LABS
              </p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">
                AI Platform v2.1
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <img
            src="/efsora-logo.jpg"
            alt="Efsora"
            className="h-8 w-8 rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden lg:flex shrink-0 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="lg:hidden shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-0.5 px-2">
          {!collapsed && (
            <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 font-mono">
              Menu
            </p>
          )}
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    onClick={onMobileClose}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 relative",
                        isActive
                          ? "bg-primary/15 text-primary font-semibold before:absolute before:left-0 before:top-1/4 before:bottom-1/4 before:w-0.5 before:rounded-full before:bg-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center px-2"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="font-archivo">{t.nav[item.labelKey]}</span>}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="font-archivo">
                    {t.nav[item.labelKey]}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t border-sidebar-border p-3">
        <div className={cn(
          "flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-8 w-8 shrink-0">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.firstName || user.email}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <AvatarFallback className="text-xs font-mono bg-primary/20 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-foreground font-archivo">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground font-mono">{user?.email}</p>
              </div>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t.auth.logout}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
        {collapsed && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="mt-1 w-full text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t.auth.logout}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onMobileClose} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 bg-sidebar-background border-r border-sidebar-border transition-all duration-200",
        collapsed ? "lg:w-16" : "lg:w-64"
      )}>
        {sidebarContent}
      </aside>
    </>
  )
}