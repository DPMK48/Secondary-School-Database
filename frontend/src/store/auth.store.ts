import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, LoginCredentials } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { delay } from '../utils/helpers';

// Mock users for simulation
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: {
      id: 1,
      username: 'admin',
      email: 'admin@schoolhub.com',
      role: 'admin',
      is_active: true,
      created_at: '2024-01-01',
    },
  },
  formteacher: {
    password: 'form123',
    user: {
      id: 3,
      username: 'formteacher',
      email: 'formteacher@schoolhub.com',
      role: 'form_teacher',
      is_active: true,
      created_at: '2024-01-01',
    },
  },
  teacher: {
    password: 'teacher123',
    user: {
      id: 4,
      username: 'teacher',
      email: 'teacher@schoolhub.com',
      role: 'subject_teacher',
      is_active: true,
      created_at: '2024-01-01',
    },
  },
};

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        
        // Simulate API call
        await delay(1000);
        
        const mockUser = MOCK_USERS[credentials.username];
        
        if (mockUser && mockUser.password === credentials.password) {
          const token = `mock_token_${Date.now()}`;
          set({
            user: mockUser.user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
          throw new Error('Invalid username or password');
        }
      },

      logout: () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      checkAuth: () => {
        const { token, user } = get();
        return !!(token && user);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
