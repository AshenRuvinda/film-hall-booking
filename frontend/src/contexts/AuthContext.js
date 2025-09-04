import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in (e.g., via session cookie)
    axios.get('/api/auth/check').then((res) => {
      if (res.data.user) setUser(res.data.user);
    });
  }, []);

  const login = async (email, password, role) => {
    const res = await axios.post('/api/auth/login', { email, password, role });
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password, role) => {
    const res = await axios.post('/api/auth/register', { name, email, password, role });
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    axios.post('/api/auth/logout');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};