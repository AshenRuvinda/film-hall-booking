// frontend/src/contexts/AuthContext.js - FIXED VERSION
import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/check');
      if (res.data.user) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.log('No active session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      const res = await api.post('/auth/login', { email, password, role });
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error;
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data || error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};