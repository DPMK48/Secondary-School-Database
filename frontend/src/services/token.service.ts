import { STORAGE_KEYS } from '../utils/constants';

export const tokenService = {
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Basic JWT expiration check (if using JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  },
};

export default tokenService;
