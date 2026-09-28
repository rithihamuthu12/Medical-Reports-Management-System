import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => getAuthToken());
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', title = null) => {
    setToast({ id: Date.now(), message, type, title });
  };

  const removeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const res = await api.getCurrentUser();
          setUser(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        } catch (error) {
          console.error('Failed to verify token:', error);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      const { token: newToken, user: userData } = response;

      setAuthToken(newToken);
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      showToast(`Welcome back, ${userData.name}!`, 'success', 'Login Successful');
      setLoading(false);
      return userData;
    } catch (error) {
      setLoading(false);
      showToast(error.message || 'Login failed. Check your credentials.', 'error', 'Authentication Failed');
      throw error;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
    showToast('You have been logged out.', 'info', 'Logged Out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        role: user ? user.role : null,
        toast,
        showToast,
        removeToast
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
