// frontend/src/contexts/AuthContext.js - ENHANCED VERSION WITH BETTER ERROR HANDLING
import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test if backend is reachable
      await api.get('/health');
      
      // Check authentication
      const res = await api.get('/auth/check');
      if (res.data.user) {
        setUser(res.data.user);
        console.log('User authenticated:', res.data.user);
      }
    } catch (error) {
      console.log('Auth check failed:', error.message);
      setUser(null);
      
      if (error.code === 'ECONNREFUSED') {
        setError('Backend server is not running. Please start the server.');
      } else if (error.response?.status === 404) {
        setError('API endpoints not found. Please check backend routes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      setError(null);
      const res = await api.post('/auth/login', { email, password, role });
      setUser(res.data.user);
      console.log('Login successful:', res.data.user);
      return res.data;
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      throw new Error(errorMessage);
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      setError(null);
      const res = await api.post('/auth/register', { name, email, password, role });
      setUser(res.data.user);
      console.log('Registration successful:', res.data.user);
      return res.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      throw new Error(errorMessage);
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
    error,
    checkAuth
  };

  // Show error screen if there's a critical error
  if (error && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-600 text-center mb-4">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded">
            <p className="font-medium mb-2">To fix this issue:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Make sure your backend server is running</li>
              <li>Check that it's running on port 5000</li>
              <li>Verify MongoDB is connected</li>
              <li>Check the console for detailed error messages</li>
            </ol>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};