import type { AuthResponse } from '../../types';

// These functions would normally make API calls, but for now we use the store mock
export const authApi = {
  login: async (): Promise<AuthResponse> => {
    // In production, this would be:
    // const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    // return response.data;
    throw new Error('Use store login method for mock authentication');
  },

  logout: async (): Promise<void> => {
    // In production, this would be:
    // await axiosInstance.post('/auth/logout');
  },

  refreshToken: async (): Promise<{ access_token: string }> => {
    // In production, this would be:
    // const response = await axiosInstance.post('/auth/refresh');
    // return response.data;
    throw new Error('Not implemented');
  },

  getCurrentUser: async () => {
    // In production, this would be:
    // const response = await axiosInstance.get('/auth/me');
    // return response.data;
    throw new Error('Not implemented');
  },
};

export default authApi;
