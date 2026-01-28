import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds token to all requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    console.log('🔑 [AXIOS] Storage key used:', STORAGE_KEYS.TOKEN);
    console.log('🔑 [AXIOS] Token from localStorage:', token ? `${token.substring(0, 30)}...` : 'NULL/UNDEFINED');
    console.log('🔑 [AXIOS] Request URL:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [AXIOS] Authorization header added');
    } else {
      console.log('❌ [AXIOS] NO TOKEN - Authorization header NOT added');
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('🔥 [AXIOS ERROR]:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      params: error.config?.params,
    });

    // Handle 401 Unauthorized - redirect to login
    // But NOT for auth endpoints (login, public-stats)
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/public-stats');
      
      if (!isAuthEndpoint) {
        console.log('🚪 [AXIOS] Unauthorized - clearing auth');
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
