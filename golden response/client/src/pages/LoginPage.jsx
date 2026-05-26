// LoginPage.jsx — email/password login + Google OAuth
import { useState } from 'react'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { firebaseAuth } from '../firebase'
import Spinner from '../components/Spinner'

function LoginPage() {
  const { login, loginWithGoogle, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Sanitize inputs before sending — defense in depth
    const sanitized = {
      email: DOMPurify.sanitize(form.email.trim()),
      password: form.password,
    }
    try {
      await login(sanitized)
    } catch {
      // error toast handled in AuthContext
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(firebaseAuth, provider)
      const idToken = await result.user.getIdToken()
      await loginWithGoogle(idToken)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-1 text-2xl font-bold text-gray-800">Welcome back</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Spinner size="sm" /> : 'Sign in'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          {googleLoading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="mt-5 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
