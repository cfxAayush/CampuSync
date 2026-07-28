import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configure axios auth header & 401 automatic logout interceptor
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/auth/login/`, { username, password });
      const { access, refresh, user: userData } = res.data;
      
      setToken(access);
      setUser(userData);
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE}/auth/register/`, formData);
      // Auto-login after registration
      return await login(formData.username, formData.password);
    } catch (err) {
      const errData = err.response?.data;
      let msg = 'Registration failed.';
      if (errData) {
        if (typeof errData === 'string') msg = errData;
        else if (errData.detail) msg = errData.detail;
        else {
          const firstKey = Object.keys(errData)[0];
          msg = `${firstKey}: ${errData[firstKey][0]}`;
        }
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (formData) => {
    try {
      const res = await axios.patch(`${API_BASE}/auth/me/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return res.data;
    } catch (err) {
      throw err;
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
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT',
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
