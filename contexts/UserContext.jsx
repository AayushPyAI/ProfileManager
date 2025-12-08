'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load tokens and user from localStorage on mount
  useEffect(() => {
    const loadAuth = () => {
      try {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

        if (storedAccessToken && storedRefreshToken && storedUser) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
          // Clear invalid data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error loading auth:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Refresh access token using refresh token
  const refreshAccessToken = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token');
      }

      const response = await fetch('/api/user/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Update tokens and user
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);

      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear auth on refresh failure
      logout();
      throw error;
    }
  }, []);

  // Make authenticated fetch request with automatic token refresh
  const authenticatedFetch = useCallback(async (url, options = {}) => {
    let token = accessToken || localStorage.getItem('accessToken');
    
    // If no token, try to refresh
    if (!token) {
      try {
        token = await refreshAccessToken();
      } catch (error) {
        throw new Error('Authentication required');
      }
    }

    // Add Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    let response = await fetch(url, { ...options, headers });

    // If token expired, try to refresh and retry
    if (response.status === 401) {
      try {
        const newToken = await refreshAccessToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } catch (error) {
        throw new Error('Authentication failed');
      }
    }

    return response;
  }, [accessToken, refreshAccessToken]);

  const login = (userData, tokens) => {
    if (userData && tokens) {
      setUser(userData);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  };

  const logout = async () => {
    try {
      // Call logout API if we have a token
      const token = accessToken || localStorage.getItem('accessToken');
      if (token) {
        await fetch('/api/user/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Ignore errors on logout
        });
      }
    } catch (error) {
      // Ignore errors
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/');
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      logout, 
      accessToken,
      authenticatedFetch,
      isLoading,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};