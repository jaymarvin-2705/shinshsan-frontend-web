import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import api from '../services/api';
import type {
  LoginResponse,
  User,
} from '../types/auth';

interface AuthMeResponse {
  success: boolean;
  message: string;
  data: User;
}

function isAdmin(user: User): boolean {
  return user.role === 'Admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<AuthMeResponse>('/auth/me');

        if (isAdmin(response.data.data)) {
          setUser(response.data.data);
        } else {
          await api.post('/auth/logout');
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      } catch {
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    const token = response.data.data.token;
    const loggedInUser = response.data.data.user;

    if (!isAdmin(loggedInUser)) {
      try {
        await api.post(
          '/auth/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error: unknown) {
        console.error(
          'Unable to revoke rejected non-admin web token.',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      throw new Error(
        'Only administrator accounts can sign in to the web portal. Use the mobile app for client or technician access.'
      );
    }

    localStorage.setItem('auth_token', token);

    setUser(loggedInUser);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue logout even if API request fails.
    }

    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// The provider and its hook are kept together as one auth-context module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}