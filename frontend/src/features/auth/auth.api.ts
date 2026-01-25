import axiosInstance from '../../services/axios';
import type { AuthResponse, User } from '../../types';

export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  refreshToken: async (): Promise<{ access_token: string }> => {
    const response = await axiosInstance.post<{ access_token: string }>('/auth/refresh');
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<void> => {
    await axiosInstance.patch('/auth/change-password', data);
  },

  requestPasswordReset: async (username: string): Promise<void> => {
    await axiosInstance.post('/auth/request-password-reset', { username });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await axiosInstance.post('/auth/reset-password', { token, newPassword });
  },
};

export default authApi;
