import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { STORAGE_KEYS } from '../../utils/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  originalUser: User | null; // Store original admin user when impersonating
  isImpersonating: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  originalUser: null,
  isImpersonating: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      
      // Persist to localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.originalUser = null;
      state.isImpersonating = false;
      
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ORIGINAL_USER);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload));
    },
    clearError: (state) => {
      state.error = null;
    },
    refreshToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload);
    },
    impersonate: (state, action: PayloadAction<User>) => {
      // Store original admin user
      if (!state.isImpersonating && state.user) {
        state.originalUser = state.user;
        localStorage.setItem(STORAGE_KEYS.ORIGINAL_USER, JSON.stringify(state.user));
      }
      // Switch to impersonated user
      state.user = action.payload;
      state.isImpersonating = true;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload));
    },
    exitImpersonation: (state) => {
      // Restore original admin user
      if (state.originalUser) {
        state.user = state.originalUser;
        state.originalUser = null;
        state.isImpersonating = false;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
        localStorage.removeItem(STORAGE_KEYS.ORIGINAL_USER);
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setUser,
  clearError,
  refreshToken,
  impersonate,
  exitImpersonation,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsImpersonating = (state: { auth: AuthState }) => state.auth.isImpersonating;
export const selectOriginalUser = (state: { auth: AuthState }) => state.auth.originalUser;
