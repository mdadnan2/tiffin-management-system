import axios from 'axios';
import type { AuthResponse, User, Meal, PriceSetting, Dashboard } from '@/types';
import { auth } from './auth';

const authApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL });
const userApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_USER_SERVICE_URL });
const mealApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_MEAL_SERVICE_URL });
const adminApi = axios.create({ baseURL: process.env.NEXT_PUBLIC_ADMIN_SERVICE_URL });

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setAuthToken = (token: string) => {
  [userApi, mealApi, adminApi].forEach(api => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  });
};

// Add response interceptor for automatic token refresh
[userApi, mealApi, adminApi].forEach(api => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = auth.getRefreshToken();
        if (!refreshToken) {
          auth.clearAuth();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const { data } = await authApi.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = data;
          const user = auth.getUser();
          auth.setAuth(accessToken, newRefreshToken, user!);
          setAuthToken(accessToken);
          originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
          processQueue(null, accessToken);
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          auth.clearAuth();
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
});

export const api = {
  auth: {
    login: (email: string, password: string) => 
      authApi.post<AuthResponse>('/auth/login', { email, password }),
    register: (email: string, password: string, name: string, role?: 'USER' | 'ADMIN') => 
      authApi.post<AuthResponse>('/auth/register', { email, password, name, role }),
    refresh: (refreshToken: string) => 
      authApi.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
    me: (token: string) => 
      authApi.get<User>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
  },
  meals: {
    list: (params?: { date?: string; mealType?: string; startDate?: string; endDate?: string }) => 
      mealApi.get<Meal[]>('/meals', { params }),
    create: (data: { date: string; mealType: string; count: number; note?: string }) => 
      mealApi.post<Meal>('/meals', data),
    createBulk: (data: { dates: string[]; mealType: string; count: number; note?: string }) => 
      mealApi.post('/meals/bulk', data),
    update: (id: string, data: { count?: number; note?: string }) => 
      mealApi.patch<Meal>(`/meals/${id}`, data),
    delete: (id: string) => 
      mealApi.delete(`/meals/${id}`),
  },
  dashboard: {
    get: () => mealApi.get<Dashboard>('/dashboard'),
  },
  price: {
    get: () => userApi.get<PriceSetting>('/users/me/price'),
    update: (data: { breakfast: number; lunch: number; dinner: number; custom: number }) => 
      userApi.patch<PriceSetting>('/users/me/price', data),
  },
  users: {
    getProfile: () => userApi.get<User>('/users/profile'),
    updateProfile: (data: { name?: string; mobile?: string }) => 
      userApi.patch<User>('/users/profile', data),
  },
  admin: {
    getAllUsers: () => adminApi.get('/admin/users'),
    getUserSummary: (userId: string) => adminApi.get(`/admin/users/${userId}/summary`),
  },
};
