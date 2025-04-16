import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from '../types';
import { refreshToken } from '../services/api';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@KickManager:token');
    const storedUser = localStorage.getItem('@KickManager:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    // Configurar intervalo para atualizar o token
    const interval = setInterval(async () => {
      if (token) {
        try {
          const newToken = await refreshToken(token);
          setToken(newToken);
          localStorage.setItem('@KickManager:token', newToken);
        } catch (error) {
          // Se não conseguir atualizar o token, faça logout
          logout();
        }
      }
    }, 1000 * 60 * 60); // Atualizar a cada hora

    setLoading(false);

    return () => clearInterval(interval);
  }, [token]);

  const login = (token: string, user: User) => {
    localStorage.setItem('@KickManager:token', token);
    localStorage.setItem('@KickManager:user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('@KickManager:token');
    localStorage.removeItem('@KickManager:user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};