import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  currentUser: User | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = '/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refresh_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async (jwtToken: string) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error('unauthorized');
    }

    if (!res.ok) {
      throw new Error('temporary_error');
    }

    const user: User = await res.json();
    setCurrentUser(user);
  };

  // Обновить access token через refresh
  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      if (!res.ok) {
        logout();
        return null;
      }

      const data = await res.json();
      const newAccessToken = data.access_token;
      localStorage.setItem('access_token', newAccessToken);
      setToken(newAccessToken);
      return newAccessToken;
    } catch (err) {
      logout();
      return null;
    }
  };

  // Логин с access + refresh токенами
  const login = async (accessToken: string, newRefreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', newRefreshToken);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);
    await fetchMe(accessToken);
  };

  // Логаут
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
  };

  // Подтягиваем пользователя при старте, если access token есть
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe(token)
      .catch((err) => {
        if (err.message === 'unauthorized') logout();
        console.error('fetchMe error:', err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, refreshToken, currentUser, login, logout, refreshAccessToken }}>
      {!loading ? children : <div className="min-h-screen center-vertical"><p>Загрузка...</p></div>}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
