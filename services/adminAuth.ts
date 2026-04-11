import axios from 'axios';
import apiClient from './apiClient';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  token: string;
  userId: string;
  name: string;
  username: string;
  loggedInAt: string;
}

export interface AdminLoginPayload {
  username: string;
  password: string;
}

interface AdminLoginResponse {
  token: string;
  user: AdminUser;
}

export const adminSessionStorageKey = 'hienphuong-motel-admin-session';

const setAdminAuthHeader = (token: string | null): void => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

export const getAdminSession = (): AdminSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(adminSessionStorageKey);
  if (!rawValue) {
    return null;
  }

  try {
    const session = JSON.parse(rawValue) as Partial<AdminSession>;

    if (
      typeof session.token !== 'string' ||
      !session.token ||
      typeof session.username !== 'string' ||
      !session.username
    ) {
      window.localStorage.removeItem(adminSessionStorageKey);
      setAdminAuthHeader(null);
      return null;
    }

    setAdminAuthHeader(session.token);
    return session as AdminSession;
  } catch {
    window.localStorage.removeItem(adminSessionStorageKey);
    setAdminAuthHeader(null);
    return null;
  }
};

export const isAdminAuthenticated = (): boolean => Boolean(getAdminSession());

export const loginAdmin = async ({ username, password }: AdminLoginPayload): Promise<AdminSession> => {
  try {
    const response = await apiClient.post<AdminLoginResponse>('/api/auth/login', {
      username: username.trim(),
      password,
    }) as any;

    console.log('response login: ', response);
    

    const { token, user } = response.data.data;
    const session: AdminSession = {
      token,
      userId: user.id,
      name: user.name,
      username: user.username,
      loggedInAt: new Date().toISOString(),
    };

    setAdminAuthHeader(token);
    window.localStorage.setItem(adminSessionStorageKey, JSON.stringify(session));
    return session;
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 400 || error.response?.status === 401)) {
      throw new Error('INVALID_ADMIN_CREDENTIALS');
    }

    throw error;
  }
};

export const logoutAdmin = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  setAdminAuthHeader(null);
  window.localStorage.removeItem(adminSessionStorageKey);
};
