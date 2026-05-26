// App.jsx — router setup with lazy loading, context providers, and global UI
import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { TaskProvider } from './context/TaskContext'
import Spinner from './components/Spinner'
import ProtectedRoute from './components/ProtectedRoute'
import OfflineBanner from './components/OfflineBanner'

// Route-based code splitting — each page loads only when navigated to
const LoginPage          = lazy(() => import('./pages/LoginPage'))
const RegisterPage       = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'))
const TaskPage           = lazy(() => import('./pages/TaskPage'))
const EditTaskPage       = lazy(() => import('./pages/EditTaskPage'))
const ProfilePage        = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'))

const PageFallback = (
  <div className="flex h-screen items-center justify-center">
    <Spinner />
  </div>
)

function App() {
  return (
    <Router>
      {/* AuthProvider wraps everything so any component can call useAuth() */}
      <AuthProvider>
        {/* TaskProvider is inside AuthProvider so it can use auth state if needed */}
        <TaskProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <OfflineBanner />

          <Suspense fallback={PageFallback}>
            <Routes>
              {/* Public routes */}
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/register"        element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password"  element={<ResetPasswordPage />} />

              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute><TaskPage /></ProtectedRoute>
              } />
              <Route path="/tasks/:id/edit" element={
                <ProtectedRoute><EditTaskPage /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />

              {/* 404 catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </TaskProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
