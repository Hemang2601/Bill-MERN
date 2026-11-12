import React, { createContext, useContext, useState, useEffect } from 'react';
import { ManagerUser } from '../../types';
import { authApi } from '../../services/api';

interface AuthContextType {
  manager: ManagerUser | null;
  isLoading: boolean;
  login: (username: 'hiren' | 'suresh', pin: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshManager: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manager, setManager] = useState<ManagerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentManager = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setManager(res.data);
      } else {
        setManager(null);
      }
    } catch {
      setManager(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentManager();
  }, []);

  const login = async (username: 'hiren' | 'suresh', pin: string) => {
    const res = await authApi.login(username, pin);
    if (res.success && res.data) {
      setManager(res.data);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setManager(null);
    }
  };

  const refreshManager = async () => {
    await fetchCurrentManager();
  };

  return (
    <AuthContext.Provider
      value={{
        manager,
        isLoading,
        login,
        logout,
        refreshManager,
      }}
    >
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
