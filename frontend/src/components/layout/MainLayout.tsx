import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

const pageTitles: Record<string, 'dashboard' | 'users' | 'settings'> = {
  '/dashboard': 'dashboard',
  '/users': 'users',
  '/settings': 'settings',
}

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { t } = useI18n()

  const titleKey = pageTitles[location.pathname] || 'dashboard'
  const title = t.nav[titleKey] || t.nav.dashboard

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={cn("transition-all duration-200", collapsed ? "lg:ml-16" : "lg:ml-64")}>
        <Header
          title={title}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
