import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { I18nProvider } from '@/contexts/I18nProvider'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/UsersPage'
import { UserDetailPage } from '@/pages/UserDetailPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { InvitePage } from '@/pages/InvitePage'
import { AssetsPage } from '@/pages/AssetsPage'
import { ActivityLogPage } from '@/pages/ActivityLogPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { ImpersonationBar } from '@/components/layout/ImpersonationBar'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <ImpersonationBar />
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/invite/:token" element={<InvitePage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/users" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UsersPage />
                  </ProtectedRoute>
                } />
                <Route path="/users/:id" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/activity-log" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ActivityLogPage />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ReportsPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <Toaster 
              position="top-right" 
              richColors 
              closeButton 
              expand={true}
              duration={4000}
              toastOptions={{
                style: {
                  borderRadius: '12px',
                  fontSize: '14px',
                },
              }}
            />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
