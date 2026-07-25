import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import { AppLayout } from "@/components/layout/app-layout"
import LandingPage from "@/pages/landing"
import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import ForgotPasswordPage from "@/pages/auth/forgot-password"
import GoogleCallbackPage from "@/pages/auth/google-callback"
import SubscriptionPlans from "@/pages/subscription"
import DashboardPage from "@/pages/dashboard"
import ReviewCodePage from "@/pages/review-code"
import ReviewResultPage from "@/pages/review-result"
import HistoryPage from "@/pages/history"
import AnalyticsPage from "@/pages/analytics"
import ReportsPage from "@/pages/reports"
import ProfilePage from "@/pages/profile"
import SettingsPage from "@/pages/settings"
import AdminDashboard from "@/pages/admin/dashboard"
import ActivityMonitor from "@/pages/admin/activity-monitor"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  )
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/subscription" element={<SubscriptionPlans />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="review" element={<ReviewCodePage />} />
          <Route path="review/:id" element={<ReviewResultPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/activities" element={<ProtectedRoute><ActivityMonitor /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
