import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { I18nProvider } from '@/contexts/I18nProvider'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'

const AuthPage = lazy(() => import('@/pages/AuthPage').then(m => ({ default: m.AuthPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const UsersPage = lazy(() => import('@/pages/UsersPage').then(m => ({ default: m.UsersPage })))
const UserDetailPage = lazy(() => import('@/pages/UserDetailPage').then(m => ({ default: m.UserDetailPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const InvitePage = lazy(() => import('@/pages/InvitePage').then(m => ({ default: m.InvitePage })))
const AssetsPage = lazy(() => import('@/pages/AssetsPage').then(m => ({ default: m.AssetsPage })))
const ActivityLogPage = lazy(() => import('@/pages/ActivityLogPage').then(m => ({ default: m.ActivityLogPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ReportsPage })))
const ImpersonationBar = lazy(() => import('@/components/layout/ImpersonationBar').then(m => ({ default: m.ImpersonationBar })))

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <ImpersonationBar />
            </Suspense>
            <Suspense fallback={null}>
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
            </Suspense>
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
