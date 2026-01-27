import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, LoginCredentials } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { authApi } from '../features/auth/auth.api';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => boolean;
  impersonate: (user: User) => void;
  exitImpersonation: () => void;
  originalUser: User | null;
  isImpersonating: boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      originalUser: null,
      isImpersonating: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        
        try {
          const response = await authApi.login(credentials);
          
          // Check if role selection is required (no token returned)
          if (response.requiresRoleSelection || !response.access_token) {
            set({ isLoading: false });
            // Don't complete login - caller should handle role selection
            return;
          }
          
          // Store token and user info
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
          
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error?.response?.data?.message || 'Invalid username or password');
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.ORIGINAL_USER);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            originalUser: null,
            isImpersonating: false,
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      checkAuth: () => {
        const { token, user } = get();
        return !!(token && user);
      },

      impersonate: (user: User) => {
        const { user: currentUser } = get();
        // Store original user if not already impersonating
        if (!get().isImpersonating && currentUser) {
          localStorage.setItem(STORAGE_KEYS.ORIGINAL_USER, JSON.stringify(currentUser));
          set({
            originalUser: currentUser,
            user,
            isImpersonating: true,
          });
        }
      },

      exitImpersonation: () => {
        const { originalUser } = get();
        if (originalUser) {
          localStorage.removeItem(STORAGE_KEYS.ORIGINAL_USER);
          set({
            user: originalUser,
            originalUser: null,
            isImpersonating: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, ensure isAuthenticated matches the presence of user and token
        if (state && state.user && state.token) {
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      },
    }
  )
);

export default useAuthStore;
