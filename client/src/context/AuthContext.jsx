import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync token header and fetch fresh current user profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await API.get('/auth/me');
        if (response.data.success) {
          const freshUser = { ...response.data.data, token };
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setToken(userData.token);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      throw err;
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const response = await API.post('/auth/register', formData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await API.post('/auth/logout').catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (updatedFields) => {
    try {
      const response = await API.put('/auth/profile', updatedFields);
      if (response.data.success) {
        const updated = { ...user, ...response.data.data };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer',
        isOwner: user?.role === 'owner',
        isAdmin: user?.role === 'admin',
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
