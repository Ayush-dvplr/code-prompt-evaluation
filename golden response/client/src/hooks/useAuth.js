import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authApi from '../api/auth.api';
import { useLocalStorage } from './useLocalStorage';

/**
 * Manages authentication state.
 * User info and tokens are stored in localStorage so they survive page refresh.
 */
export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useLocalStorage('user', null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(credentials);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.displayName}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err; // re-throw so the form can re-enable the submit button
    } finally {
      setLoading(false);
    }
  }, [navigate, setUser]);

  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await authApi.register(formData);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      toast.success('Account created! Welcome aboard.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate, setUser]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authApi.logout(refreshToken);
    } catch {
      // Silent fail — always clear local state regardless of server response
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('Logged out');
      navigate('/login');
    }
  }, [navigate, setUser]);

  return { user, loading, login, register, logout };
}
