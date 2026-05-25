import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Spinner from './components/Spinner';
import ProtectedRoute from './components/ProtectedRoute';
import OfflineBanner from './components/OfflineBanner';

// Route-based code splitting — each page loads only when navigated to
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));
const TaskPage           = lazy(() => import('./pages/TaskPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <Router>
      {/* Toast notifications — top-right corner */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* Offline detection banner — sits above everything */}
      <OfflineBanner />

      {/* Spinner shown while any lazy page is loading */}
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner />
        </div>
      }>
        <Routes>
          {/* Public routes */}
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />

          {/* Protected routes — redirect to /login if no token */}
          <Route path="/" element={
            <ProtectedRoute><TaskPage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
