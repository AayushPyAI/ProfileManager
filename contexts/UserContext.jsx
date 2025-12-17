'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const refreshPromiseRef = React.useRef(null);
  const isLoggingOutRef = React.useRef(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const router = useRouter();
  
  
useEffect(() => {
  try {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken && storedRefreshToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
    } else {
      localStorage.clear();
    }
  } catch {
    localStorage.clear();
  }
}, []);

  function isAccessTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
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

  //   const refreshAccessToken = useCallback(async () => {

  //     if (isLoggingOutRef.current) {
  //   throw new Error('Logging out');
  // }

  //     if (refreshPromiseRef.current) {
  //       return refreshPromiseRef.current;
  //     }

  //     refreshPromiseRef.current = (async () => {
  //       const storedRefreshToken = localStorage.getItem('refreshToken');
  //       if (!storedRefreshToken) {
  //         throw new Error('No refresh token');
  //       }

  //       const response = await fetch('/api/user/refresh', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ refreshToken: storedRefreshToken }),
  //       });

  //       if (!response.ok) {
  //         throw new Error('Failed to refresh token');
  //       }

  //       const data = await response.json();

  //       localStorage.setItem('accessToken', data.accessToken);
  //       localStorage.setItem('refreshToken', data.refreshToken);
  //       localStorage.setItem('user', JSON.stringify(data.user));

  //       setAccessToken(data.accessToken);
  //       setRefreshToken(data.refreshToken);
  //       setUser(data.user);

  //       return data.accessToken;
  //     })();

  //     try {
  //       return await refreshPromiseRef.current;
  //     } finally {
  //       refreshPromiseRef.current = null;
  //     }
  //   }, []);


  const authenticatedFetch = useCallback(async (url, options = {}) => {
  let token = accessToken || localStorage.getItem('accessToken');
  if (token && isAccessTokenExpired(token)) {
      token = await refreshAccessToken();
    }
    if (!token) {
      throw new Error('Authentication required');
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    headers.Authorization = `Bearer ${newToken}`;
    response = await fetch(url, { ...options, headers });
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

const logout = () => {
  const token = accessToken || localStorage.getItem('accessToken');

  // Fire-and-forget
  if (token) {
    fetch('/api/user/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch(() => {});
  }

  // Immediate local cleanup
  setUser(null);
  setAccessToken(null);
  setRefreshToken(null);
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  isLoggingOutRef.current = true;
  router.replace('/');
};

const value = React.useMemo(() => ({
  user,
  setUser,
  login,
  logout,
  accessToken,
  authenticatedFetch
}), [user, accessToken, authenticatedFetch]);



  return (
<UserContext.Provider value={value}>
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