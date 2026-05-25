// client/src/api/auth.api.js
import api from './axios';

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');
export const refreshToken = (refreshToken) => api.post('/auth/refresh', { refreshToken });
export const googleLogin = (tokenId) => api.post('/auth/google-login', { tokenId });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });
