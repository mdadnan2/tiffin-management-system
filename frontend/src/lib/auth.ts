import { api, setAuthToken } from './api';
import type { User } from '@/types';

export const auth = {
  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  getRefreshToken: () => typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setAuth: (accessToken: string, refreshToken: string, user: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthToken(accessToken);
  },
  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  isAuthenticated: () => !!auth.getToken(),
};
