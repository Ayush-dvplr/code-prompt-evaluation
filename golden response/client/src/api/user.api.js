import api from './axios';

export const getProfile     = ()     => api.get('/user/profile');
export const updateProfile  = (data) => api.put('/user/profile', data);
export const changePassword = (data) => api.patch('/user/password', data);
