import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthUser | null;
  loading: boolean;
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'fh_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthHeaders() {
  const token = getAuthToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      setAuthHeaders();
      const { data } = await axios.get(`${API_URL}/api/auth/me`);
      setUser({
        id: data._id || data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
      });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setAuthHeaders();
      refreshProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signInWithUsername = async (username: string, password: string) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setAuthHeaders();
      setUser({
        id: data.id || data._id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
      });
      return { error: null };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      return { error: new Error(message) };
    }
  };

  const signUpWithUsername = async (username: string, password: string) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password,
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      setAuthHeaders();
      setUser({
        id: data.id || data._id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
      });
      return { error: null };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      return { error: new Error(message) };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        loading,
        signInWithUsername,
        signUpWithUsername,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
