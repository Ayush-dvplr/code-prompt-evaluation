// AuthContext.jsx — authentication state + useAuth() hook
import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as authApi from '../api/auth.api'

const AuthContext = createContext(null)

const initialState = {
  user: (() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })(),
  loading: false,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false }
    case 'CLEAR_USER':
      return { ...state, user: null, loading: false }
    default:
      return state
  }
}

function persistTokens(data) {
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  localStorage.setItem('user', JSON.stringify(data.user))
}

function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const navigate = useNavigate()

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const { data } = await authApi.login(credentials)
      persistTokens(data.data)
      dispatch({ type: 'SET_USER', payload: data.data.user })
      toast.success(`Welcome back, ${data.data.user.displayName}!`)
      navigate('/')
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.error(err.response?.data?.message || 'Login failed')
      throw err
    }
  }, [navigate])

  const register = useCallback(async (formData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const { data } = await authApi.register(formData)
      persistTokens(data.data)
      dispatch({ type: 'SET_USER', payload: data.data.user })
      toast.success('Account created! Welcome aboard.')
      navigate('/')
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.error(err.response?.data?.message || 'Registration failed')
      throw err
    }
  }, [navigate])

  const loginWithGoogle = useCallback(async (idToken) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const { data } = await authApi.googleAuth(idToken)
      persistTokens(data.data)
      dispatch({ type: 'SET_USER', payload: data.data.user })
      toast.success(`Welcome, ${data.data.user.displayName}!`)
      navigate('/')
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.error(err.response?.data?.message || 'Google sign-in failed')
      throw err
    }
  }, [navigate])

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      await authApi.logout(refreshToken)
    } catch {
      // Silent fail — always clear local state regardless of server response
    } finally {
      clearTokens()
      dispatch({ type: 'CLEAR_USER' })
      toast.success('Logged out')
      navigate('/login')
    }
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user: state.user, loading: state.loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
