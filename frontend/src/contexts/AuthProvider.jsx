import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { authService } from '@/services/auth/authService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from local storage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = storage.getItem(STORAGE_KEYS.USER);
      const storedToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (storedUser && storedToken) {
        setAccessToken(storedToken);
        setIsAuthenticated(true);

        // Refresh user profile from backend to sync is_owner, company_id, etc.
        try {
          const { default: api } = await import('@/services/api/axios');
          // Use nocache to bypass client-side response cache for fresh user data
          const res = await api.get('/auth/me', { params: { nocache: true } });
          const freshUser = res.data;
          if (freshUser && freshUser.id) {
            storage.setItem(STORAGE_KEYS.USER, freshUser);
            setUser(freshUser);
          } else {
            setUser(storedUser);
          }
        } catch (err) {
          // Fallback to stored user if /auth/me fails (e.g. token expired)
          setUser(storedUser);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Listeners coordinate axios token refreshes from outside React lifecycle
  useEffect(() => {
    window.__auth_token_update_listener__ = (newToken) => {
      storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
      setAccessToken(newToken);
    };

    window.__auth_refresh_failed_listener__ = () => {
      storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      storage.removeItem(STORAGE_KEYS.USER);
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    };

    return () => {
      delete window.__auth_token_update_listener__;
      delete window.__auth_refresh_failed_listener__;
    };
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      // data contains: { access_token, refresh_token, token_type, user }
      const { access_token, refresh_token, user: userData } = data;
      
      storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      storage.setItem(STORAGE_KEYS.USER, userData);
      
      setAccessToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout().catch(() => {});
    } finally {
      storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      storage.removeItem(STORAGE_KEYS.USER);
      
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    const currentRefreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!currentRefreshToken) throw new Error('No refresh token available');
    
    const data = await authService.refreshToken({ refresh_token: currentRefreshToken });
    const { access_token } = data;
    storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
    setAccessToken(access_token);
    return access_token;
  };

  const getCurrentUser = () => {
    return user;
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshToken,
      getCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
